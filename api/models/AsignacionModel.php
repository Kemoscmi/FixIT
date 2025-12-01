<?php
class AsignacionModel
{
    private $db;

    public function __construct()
    {
        $this->db = new MySqlConnect();
    }

    // ==========================================================
    //  Obtener todas las asignaciones (admin o técnico)
    // ==========================================================
    public function allByRole(int $rolId, int $userId)
    {
        if ($rolId == 1) {
            $sql = "
                SELECT
                    tk.id AS ticket_id,
                    tk.titulo,
                    tk.fecha_creacion,
                    tk.sla_resol_limite,
                    c.nombre AS categoria,
                    e.nombre AS estado,
                    COALESCE(u.nombre, 'N/A') AS tecnico,
                    a.fecha_asignacion
                FROM tickets tk
                LEFT JOIN asignaciones a ON a.ticket_id = tk.id
                LEFT JOIN usuarios u ON u.id = a.tecnico_id
                JOIN categorias c ON c.id = tk.categoria_id
                JOIN estados_ticket e ON e.id = tk.estado_id
                ORDER BY tk.fecha_creacion DESC;
            ";
        } else {
            $sql = "
                SELECT
                    a.id AS asignacion_id,
                    a.ticket_id,
                    tk.titulo,
                    tk.fecha_creacion,
                    tk.sla_resol_limite,
                    c.nombre AS categoria,
                    e.nombre AS estado,
                    u.nombre AS tecnico,
                    a.fecha_asignacion
                FROM asignaciones a
                JOIN tickets tk ON tk.id = a.ticket_id
                JOIN categorias c ON c.id = tk.categoria_id
                JOIN estados_ticket e ON e.id = tk.estado_id
                JOIN usuarios u ON u.id = a.tecnico_id
                WHERE a.tecnico_id = " . intval($userId) . "
                ORDER BY a.fecha_asignacion DESC, tk.id ASC;
            ";
        }

        $rows = $this->db->executeSQL($sql) ?: [];

    $palette = [
    'Pendiente'  => ['color' => '#9ca3af', 'icon' => 'clock'],
    'Asignado'   => ['color' => '#3b82f6', 'icon' => 'user-check'],
    'En Proceso' => ['color' => '#f59e0b', 'icon' => 'loader'],
    'Resuelto'   => ['color' => '#10b981', 'icon' => 'check-circle'],
    'Cerrado'    => ['color' => '#6b7280', 'icon' => 'archive'],
   ];

        foreach ($rows as $r) {
            $meta = $palette[$r->estado] ?? ['color' => '#9ca3af', 'icon' => 'circle'];
            $r->estado_color = $meta['color'];
            $r->estado_icon  = $meta['icon'];

            // Cálculo SLA (con fechas reales)
            if (!empty($r->sla_resol_limite) && !empty($r->fecha_creacion)) {
                $inicio = new DateTime($r->fecha_creacion, new DateTimeZone("America/Costa_Rica"));
                $limite = new DateTime($r->sla_resol_limite, new DateTimeZone("America/Costa_Rica"));
                $ahora = new DateTime("now", new DateTimeZone("America/Costa_Rica"));

                $totalMs = $limite->getTimestamp() - $inicio->getTimestamp();
                $transcurridoMs = $ahora->getTimestamp() - $inicio->getTimestamp();
                $progress = 100 - ($transcurridoMs / $totalMs * 100);
                $r->sla_progress = max(0, min(100, round($progress)));
                $r->sla_status = $ahora > $limite ? "Vencido" : "En curso";
            } else {
                $r->sla_status = "N/A";
                $r->sla_progress = null;
            }
        }

        return $rows;
    }

    // ==========================================================
    // 🔹 Obtener asignaciones por semana
    // ==========================================================
    public function weeklyByRole(int $rolId, int $userId, string $monday, string $sunday)
    {
        $where = "1=1";
        if ($rolId == 2) {
            $where .= " AND a.tecnico_id = " . intval($userId);
        }

        $sql = "
            SELECT
                a.id AS asignacion_id,
                a.ticket_id,
                tk.titulo,
                tk.fecha_creacion,
                tk.sla_resol_limite,
                c.nombre AS categoria,
                e.nombre AS estado,
                u.nombre AS tecnico,
                a.fecha_asignacion
            FROM asignaciones a
            JOIN tickets tk ON tk.id = a.ticket_id
            JOIN categorias c ON c.id = tk.categoria_id
            JOIN estados_ticket e ON e.id = tk.estado_id
            JOIN usuarios u ON u.id = a.tecnico_id
            WHERE $where
              AND DATE(a.fecha_asignacion) BETWEEN '" . addslashes($monday) . "' AND '" . addslashes($sunday) . "'
            ORDER BY a.fecha_asignacion ASC, tk.id ASC;
        ";

        $rows = $this->db->executeSQL($sql) ?: [];

        $palette = [
            'Pendiente'  => ['color' => '#9ca3af', 'icon' => 'clock'],
            'Asignado'   => ['color' => '#3b82f6', 'icon' => 'user-check'],
            'En Proceso' => ['color' => '#f59e0b', 'icon' => 'loader'],
            'Resuelto'   => ['color' => '#10b981', 'icon' => 'check-circle'],
            'Cerrado'    => ['color' => '#6b7280', 'icon' => 'archive'],
        ];

        foreach ($rows as $r) {
            $meta = $palette[$r->estado] ?? ['color' => '#9ca3af', 'icon' => 'circle'];
            $r->estado_color = $meta['color'];
            $r->estado_icon  = $meta['icon'];

            if (!empty($r->sla_resol_limite) && !empty($r->fecha_creacion)) {
                $inicio = new DateTime($r->fecha_creacion, new DateTimeZone("America/Costa_Rica"));
                $limite = new DateTime($r->sla_resol_limite, new DateTimeZone("America/Costa_Rica"));
                $ahora = new DateTime("now", new DateTimeZone("America/Costa_Rica"));

                $totalMs = $limite->getTimestamp() - $inicio->getTimestamp();
                $transcurridoMs = $ahora->getTimestamp() - $inicio->getTimestamp();
                $progress = 100 - ($transcurridoMs / $totalMs * 100);
                $r->sla_progress = max(0, min(100, round($progress)));
                $r->sla_status = $ahora > $limite ? "Vencido" : "En curso";
            } else {
                $r->sla_status = "N/A";
                $r->sla_progress = null;
            }
        }

        return $rows;
    }


  public function getBestTechnician(int $ticketId)
{
    // Obtener ticket
    $sql = "
        SELECT 
            t.id, 
            t.prioridad_id AS prioridad,
            TIMESTAMPDIFF(HOUR, NOW(), t.sla_resol_limite) AS horas_restantes,
            t.categoria_id
        FROM tickets t
        WHERE t.id = $ticketId;
    ";

    $result = $this->db->executeSQL($sql);
    $ticket = is_array($result) && isset($result[0]) ? $result[0] : null;

    if (!$ticket) return null;

    // Obtener REGLA que aplica
    $sqlRegla = "
        SELECT id, nombre, prioridad_min, prioridad_max, especialidad_id, peso_carga_tecnico
        FROM reglas_autotriage
        WHERE categoria_id = {$ticket->categoria_id}
          AND prioridad_min <= {$ticket->prioridad}
          AND prioridad_max >= {$ticket->prioridad}
          AND activo = 1
        ORDER BY orden_prioridad ASC
        LIMIT 1;
    ";

    $regla = $this->db->executeSQL($sqlRegla);
    $regla = is_array($regla) && isset($regla[0]) ? $regla[0] : null;

    if (!$regla) return null;

    // Obtener técnicos según la regla
    $sqlTec = "
        SELECT 
            u.id AS tecnico_id,
            u.nombre,
            u.apellido,
            COALESCE(u.carga_trabajo,0) AS carga
        FROM usuarios u
        JOIN tecnico_especialidad te ON te.usuario_id = u.id
        WHERE u.rol_id = 2
          AND te.especialidad_id = {$regla->especialidad_id}
    ";

    $tecnicos = $this->db->executeSQL($sqlTec);
    $tecnicos = is_array($tecnicos) ? $tecnicos : [];

    if (empty($tecnicos)) return null;

    // Evaluar técnicos con puntaje
    $best = null;
    $bestScore = -999999;

    foreach ($tecnicos as $tec) {
        $puntaje = ($ticket->prioridad * 1000)
                 - $ticket->horas_restantes
                 - ($tec->carga * $regla->peso_carga_tecnico);

        if ($puntaje > $bestScore) {
            $bestScore = $puntaje;
            $best = $tec;
            $best->puntaje = $puntaje;
            $best->regla_id = $regla->id;
            $best->regla_nombre = $regla->nombre;
        }
    }

    return $best;
}


public function asignarAutomaticamente(int $ticketId)
{
    $tec = $this->getBestTechnician($ticketId);

    if (!$tec) return false;

    $ticketId = intval($ticketId);

    $sql = "
        INSERT INTO asignaciones (
            ticket_id,
            tecnico_id,
            fecha_asignacion,
            metodo,
            regla_aplicada_id,
            puntaje_prioridad,
            vigente
        ) VALUES (
            $ticketId,
            {$tec->tecnico_id},
            NOW(),
            'Automatica',
            {$tec->regla_id},
            {$tec->puntaje},
            1
        );
    ";

    $this->db->executeSQL_DML($sql);

    $this->db->executeSQL_DML("
        UPDATE tickets SET estado_id = 2 WHERE id = $ticketId
    ");

    $this->db->executeSQL_DML("
        INSERT INTO historial_estados (
            ticket_id,
            estado_id,
            usuario_id,
            observaciones
        ) VALUES (
            $ticketId,
            2,
            {$tec->tecnico_id},
            'Asignación automática basada en {$tec->regla_nombre}'
        );
    ");

    return $tec;
}

 // ----------------------------------------------------------
    // ASIGNACIÓN MANUAL
    // ----------------------------------------------------------
    public function asignarManual(int $ticketId, int $tecnicoId)
    {
        $ticketId  = intval($ticketId);
        $tecnicoId = intval($tecnicoId);

        $sql = "
            INSERT INTO asignaciones (
                ticket_id,
                tecnico_id,
                fecha_asignacion,
                metodo,
                vigente
            ) VALUES (
                $ticketId,
                $tecnicoId,
                NOW(),
                'Manual',
                1
            );
        ";

        $this->db->executeSQL_DML($sql);


      $this->db->executeSQL_DML("UPDATE tickets SET estado_id = 2 WHERE id = $ticketId");
//  INSERTAR EN HISTORIAL
$this->db->executeSQL_DML("
    INSERT INTO historial_estados (
        ticket_id,
        estado_id,
        usuario_id,
        observaciones
    ) VALUES (
        $ticketId,
        2,
        $tecnicoId,
        'Asignación manual'
    );
");

        return true;
    }



// Asignar automáticamente TODOS los tickets Pendientes

public function asignarTodosPendientes()
{
    // 1. Obtener todos los tickets con estado Pendiente (id_estado = 1)
    $sql = "
        SELECT id 
        FROM tickets
        WHERE estado_id = 1;
    ";

    $pendientes = $this->db->executeSQL($sql);

    // Normalizar array
    $pendientes = is_array($pendientes) ? $pendientes : [];

    if (empty($pendientes)) {
        return [
            "asignados" => 0,
            "detalles" => []
        ];
    }

    $detalles = [];
    $contador = 0;

    // 2. Recorrer y asignar cada ticket
    foreach ($pendientes as $t) {

    // Ejecutar asignación
    $resultado = $this->asignarAutomaticamente($t->id);

    if ($resultado) {

        // Obtener datos completos del ticket
        $sqlInfo = "
            SELECT 
                t.id,
                t.titulo,
                t.prioridad_id,
                TIMESTAMPDIFF(HOUR, NOW(), t.sla_resol_limite) AS horas_restantes,
                c.nombre AS categoria
            FROM tickets t
            JOIN categorias c ON c.id = t.categoria_id
            WHERE t.id = {$t->id};
        ";

        $info = $this->db->executeSQL($sqlInfo);
        $info = isset($info[0]) ? $info[0] : null;

        $contador++;

        $detalles[] = [
            "ticket_id"       => $t->id,
            "titulo"          => $info->titulo ?? "",
            "categoria"       => $info->categoria ?? "",
            "prioridad"       => $info->prioridad_id ?? "",
            "horas_restantes" => $info->horas_restantes ?? 0,

            "tecnico_id"      => $resultado->tecnico_id,
            "tecnico"         => $resultado->nombre,
            "carga_tecnico"   => $resultado->carga ?? 0,

            "regla_id"        => $resultado->regla_id,
            "regla_aplicada"  => $resultado->regla_nombre,

            "puntaje"         => $resultado->puntaje,

            "justificacion"   => "
                Se aplicó la regla '{$resultado->regla_nombre}' porque el ticket pertenece a la 
                categoría '{$info->categoria}' y su prioridad es {$info->prioridad_id}.
                El puntaje final se calculó como:
                (prioridad × 1000) – horas_restantes – (carga_actual × peso_carga).
                El técnico '{$resultado->nombre}' obtuvo el mejor puntaje total, debido a su 
                especialidad compatible y su menor carga laboral actual.
            "
        ];
    }
}

    return [
        "asignados" => $contador,
        "detalles" => $detalles
    ];
}
public function getTecnicosPorTicket(int $ticketId)
{
    $ticketId = intval($ticketId);

    $sql = "
        SELECT DISTINCT *
        FROM (
            SELECT 
                u.id,
                CONCAT(u.nombre, ' ', u.apellido) AS nombre,
                COALESCE(u.carga_trabajo, 0) AS carga,
                u.disponibilidad AS estado
            FROM usuarios u
            JOIN tecnico_especialidad te 
                ON te.usuario_id = u.id
            JOIN categoria_especialidad ce 
                ON ce.especialidad_id = te.especialidad_id
            WHERE u.rol_id = 2
              AND ce.categoria_id = (
                  SELECT categoria_id 
                  FROM tickets 
                  WHERE id = $ticketId
              )
        ) AS t
        ORDER BY t.carga ASC;
    ";

    return $this->db->executeSQL($sql);
}
public function listPendientes()
{
    $vSql = "
        SELECT 
            tk.id,
            tk.titulo,
            tk.descripcion,
            tk.fecha_creacion,
            c.nombre AS categoria,
            p.nombre AS prioridad,
            tk.sla_resol_limite,
            tk.sla_resp_limite,
            CASE
                WHEN tk.sla_resol_limite IS NULL THEN NULL
                ELSE TIMESTAMPDIFF(
                    MINUTE,
                    NOW(),
                    tk.sla_resol_limite
                )
            END AS sla_min_restantes
        FROM tickets tk
        LEFT JOIN categorias c ON c.id = tk.categoria_id
        LEFT JOIN prioridades p ON p.id = tk.prioridad_id
        WHERE tk.estado_id = 1
        ORDER BY tk.fecha_creacion ASC
    ";

    return $this->db->ExecuteSQL($vSql) ?: [];
}


  }
