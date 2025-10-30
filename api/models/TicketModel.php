<?php
class TicketModel
{
    public $enlace;

    public function __construct()
    {
        // Conexión a la base de datos
        $this->enlace = new MySqlConnect();
    }

    /* -----------------------------------------------------------
     * Utilidad interna: valida que un usuario pertenezca a un rol
     * Parámetros:
     *  - $userId (int): ID del usuario en tabla usuarios
     *  - $rolId  (int): 1=Administrador, 2=Tecnico, 3=Cliente
     * Retorna:
     *  - bool: true si existe el usuario activo con ese rol
     * ----------------------------------------------------------- */
    private function assertRole(int $userId, int $rolId): bool
    {
        $vSql = "SELECT 1
                 FROM usuarios
                 WHERE id = " . intval($userId) . "
                   AND rol_id = " . intval($rolId) . "
                   AND activo = 1
                 LIMIT 1";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return !empty($vResultado);
    }

    /* -----------------------------------------------------------
     * (1) ADMIN: Listar TODOS los tickets (máx. 4 campos)
     * Requisito: el user_id debe ser Administrador (rol_id = 1)
     * Muestra: id, titulo, fecha_creacion, estado
     * Retorna:
     *  - array de objetos (cada objeto con las 4 columnas)
     * ----------------------------------------------------------- */
  public function listAdmin(int $adminId)
{
    if (!$this->assertRole($adminId, 1)) return [];

    $vSql = "
        SELECT 
            tk.id,
            tk.titulo,
            tk.fecha_creacion,
            e.nombre AS estado,
            c.nombre AS categoria,
            p.nombre AS prioridad
        FROM tickets tk
        JOIN estados_ticket e ON e.id = tk.estado_id
        LEFT JOIN categorias c ON c.id = tk.categoria_id
        LEFT JOIN prioridades p ON p.id = tk.prioridad_id
        ORDER BY tk.fecha_creacion DESC
    ";
    $vResultado = $this->enlace->ExecuteSQL($vSql);
    return $vResultado ?: [];
}


    /* -----------------------------------------------------------
     * (2) TÉCNICO: Listar tickets ASIGNADOS al técnico (máx. 4 campos)
     * Requisito: el user_id debe ser Técnico (rol_id = 2)
     * Criterio: asignaciones vigentes (a.vigente = 1) para ese técnico
     * Muestra: id, titulo, fecha_creacion, estado
     * Retorna:
     *  - array de objetos
     * ----------------------------------------------------------- */
   public function listTecnico(int $tecnicoId)
{
    if (!$this->assertRole($tecnicoId, 2)) return [];

    $vSql = "
        SELECT 
            tk.id,
            tk.titulo,
            tk.fecha_creacion,
            e.nombre AS estado,
            c.nombre AS categoria,
            p.nombre AS prioridad
        FROM asignaciones a
        JOIN tickets tk ON tk.id = a.ticket_id
        JOIN estados_ticket e ON e.id = tk.estado_id
        LEFT JOIN categorias c ON c.id = tk.categoria_id
        LEFT JOIN prioridades p ON p.id = tk.prioridad_id
        WHERE a.vigente = 1
          AND a.tecnico_id = " . intval($tecnicoId) . "
        ORDER BY tk.fecha_creacion DESC
    ";
    $vResultado = $this->enlace->ExecuteSQL($vSql);
    return $vResultado ?: [];
}

    /* -----------------------------------------------------------
     * (3) CLIENTE: Listar tickets creados por el cliente (máx. 4 campos)
     * Requisito: el user_id debe ser Cliente (rol_id = 3)
     * Muestra: id, titulo, fecha_creacion, estado
     * Retorna:
     *  - array de objetos
     * ----------------------------------------------------------- */
   public function listCliente(int $clienteId)
{
    if (!$this->assertRole($clienteId, 3)) return [];

    $vSql = "
        SELECT 
            tk.id,
            tk.titulo,
            tk.fecha_creacion,
            e.nombre AS estado,
            c.nombre AS categoria,
            p.nombre AS prioridad
        FROM tickets tk
        JOIN estados_ticket e ON e.id = tk.estado_id
        LEFT JOIN categorias c ON c.id = tk.categoria_id
        LEFT JOIN prioridades p ON p.id = tk.prioridad_id
        WHERE tk.usuario_solicitante_id = " . intval($clienteId) . "
        ORDER BY tk.fecha_creacion DESC
    ";
    $vResultado = $this->enlace->ExecuteSQL($vSql);
    return $vResultado ?: [];
}

    /* -----------------------------------------------------------
     * (4) DETALLE por ID: datos completos del ticket
     * Incluye:
     *  - Básicos: título, descripción, fecha, estado, prioridad, solicitante, categoría
     *  - SLA: hrs restantes respuesta/resolución, días_resolución, cumplimiento
     *  - Historial de estados con observaciones e imágenes
     *  - Valoración (puntaje y comentario) si existe
     * Parámetros:
     *  - $ticketId (int)
     * Retorna:
     *  - array asociativo con llaves: basicos, sla, historial, valoracion
     *  - null si no existe el ticket
     * ----------------------------------------------------------- */
    public function getById(int $ticketId)
    {
        /* A) Datos básicos del ticket */
        $vSqlBasicos = "
            SELECT tk.id,
                   tk.titulo,
                   tk.descripcion,
                   tk.fecha_creacion,
                   pr.nombre AS prioridad,
                   pr.id     AS prioridad_id,
                   e.nombre  AS estado,
                   e.id      AS estado_id,
                   c.nombre  AS categoria,
                   c.id      AS categoria_id,
                   u.id      AS solicitante_id,
                   CONCAT(u.nombre,' ',u.apellido) AS solicitante,
                   tk.sla_resp_limite,
                   tk.sla_resol_limite,
                   tk.cumplio_sla_respuesta,
                   tk.cumplio_sla_resolucion,
                   tk.fecha_cierre,
                   tk.dias_resolucion
            FROM tickets tk
            JOIN prioridades    pr ON pr.id = tk.prioridad_id
            JOIN estados_ticket e  ON e.id = tk.estado_id
            JOIN categorias     c  ON c.id = tk.categoria_id
            JOIN usuarios       u  ON u.id = tk.usuario_solicitante_id
            WHERE tk.id = " . intval($ticketId) . "
            LIMIT 1
        ";
        $rBasicos = $this->enlace->ExecuteSQL($vSqlBasicos);
        if (empty($rBasicos)) return null;
        $basicos = $rBasicos[0];

        /* B) Cálculo de SLA (horas restantes respuesta y resolución) */
        $vSqlSla = "
            SELECT
              CASE
                WHEN tk.sla_resp_limite  IS NULL THEN NULL
                ELSE TIMESTAMPDIFF(HOUR, NOW(), tk.sla_resp_limite)
              END AS hrs_resp_restantes,
              CASE
                WHEN tk.sla_resol_limite IS NULL THEN NULL
                ELSE TIMESTAMPDIFF(HOUR, NOW(), tk.sla_resol_limite)
              END AS hrs_resol_restantes
            FROM tickets tk
            WHERE tk.id = " . intval($ticketId) . "
        ";
        $rSla = $this->enlace->ExecuteSQL($vSqlSla);
        $sla  = $rSla ? $rSla[0] : (object)[
            "hrs_resp_restantes"  => null,
            "hrs_resol_restantes" => null
        ];

        /* C) Historial de estados con observaciones e imágenes */
        $vSqlHist = "
            SELECT h.id AS historial_id,
                   h.fecha,
                   h.estado_id,
                   est.nombre AS estado,
                   h.usuario_id,
                   CONCAT(uu.nombre,' ',uu.apellido) AS usuario,
                   h.observaciones,
                   img.id  AS imagen_id,
                   img.ruta,
                   img.descripcion AS imagen_desc
            FROM historial_estados h
            JOIN estados_ticket est ON est.id = h.estado_id
            JOIN usuarios uu        ON uu.id  = h.usuario_id
            LEFT JOIN imagenes_estado img ON img.historial_id = h.id
            WHERE h.ticket_id = " . intval($ticketId) . "
            ORDER BY h.fecha ASC, h.id ASC, img.id ASC
        ";
        $rowsHist = $this->enlace->ExecuteSQL($vSqlHist) ?: [];

        // Agrupar imágenes por historial
        $historial = [];
        foreach ($rowsHist as $r) {
            $hid = $r->historial_id;
            if (!isset($historial[$hid])) {
                $historial[$hid] = [
                    "historial_id" => $hid,
                    "fecha"        => $r->fecha,
                    "estado_id"    => $r->estado_id,
                    "estado"       => $r->estado,
                    "usuario_id"   => $r->usuario_id,
                    "usuario"      => $r->usuario,
                    "observaciones"=> $r->observaciones,
                    "imagenes"     => []
                ];
            }
            if (!is_null($r->imagen_id)) {
                $historial[$hid]["imagenes"][] = [
                    "imagen_id"  => $r->imagen_id,
                    "ruta"       => $r->ruta,
                    "descripcion"=> $r->imagen_desc
                ];
            }
        }
        // Reindexar a array secuencial
        $historial = array_values($historial);

        /* D) Valoración del ticket (opcional) */
        $vSqlVal = "
            SELECT v.id AS valoracion_id,
                   v.puntaje,
                   v.comentario,
                   v.fecha,
                   v.cliente_id,
                   CONCAT(uc.nombre,' ',uc.apellido) AS cliente
            FROM valoraciones v
            JOIN usuarios uc ON uc.id = v.cliente_id
            WHERE v.ticket_id = " . intval($ticketId) . "
            LIMIT 1
        ";
        $rVal = $this->enlace->ExecuteSQL($vSqlVal);
        $valoracion = ($rVal && !empty($rVal[0])) ? $rVal[0] : null;

        /* Empaquetar y retornar */
        return [
            "basicos"   => $basicos,
            "sla"       => $sla,
            "historial" => $historial,
            "valoracion"=> $valoracion
        ];
    }

    /* -----------------------------------------------------------
     * Autorización: ¿el ticket pertenece al cliente?
     * Parámetros:
     *  - $ticketId (int)
     *  - $userId   (int)
     * Retorna:
     *  - bool
     * ----------------------------------------------------------- */
    public function belongsToClient(int $ticketId, int $userId): bool
    {
        $vSql = "SELECT 1
                 FROM tickets
                 WHERE id = " . intval($ticketId) . "
                   AND usuario_solicitante_id = " . intval($userId) . "
                 LIMIT 1";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return !empty($vResultado);
    }

    /* -----------------------------------------------------------
     * Autorización: ¿el ticket está asignado al técnico (vigente)?
     * Parámetros:
     *  - $ticketId (int)
     *  - $userId   (int)  // técnico
     * Retorna:
     *  - bool
     * ----------------------------------------------------------- */
    public function assignedToTech(int $ticketId, int $userId): bool
    {
        $vSql = "SELECT 1
                 FROM asignaciones
                 WHERE ticket_id = " . intval($ticketId) . "
                   AND tecnico_id = " . intval($userId) . "
                   AND vigente = 1
                 LIMIT 1";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return !empty($vResultado);
    }
    /* -----------------------------------------------------------
     * (5) Obtener los tickets más recientes
     * Muestra:
     *  - id, título, descripción, fecha_creacion, estado, categoría y usuario solicitante
     * Ordenados desde el más nuevo al más antiguo
     * ----------------------------------------------------------- */
    public function getRecientes(int $limite = 6)
    {
        $vSql = "
            SELECT 
                tk.id,
                tk.titulo,
                tk.descripcion,
                tk.fecha_creacion,
                e.nombre AS estado,
                c.nombre AS categoria,
                CONCAT(u.nombre, ' ', u.apellido) AS usuario
            FROM tickets tk
            JOIN estados_ticket e ON e.id = tk.estado_id
            JOIN categorias c      ON c.id = tk.categoria_id
            JOIN usuarios u        ON u.id = tk.usuario_solicitante_id
            ORDER BY tk.fecha_creacion DESC
            LIMIT " . intval($limite);

        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado ?: [];
    }

/* -----------------------------------------------------------
 * ACTUALIZAR ESTADO DEL TICKET
 * Parámetros:
 *  - ticketId (int)
 *  - nuevoEstado (int)
 *  - usuarioId (int)
 * Retorna:
 *  - bool (true si se actualizó correctamente)
 * ----------------------------------------------------------- */
public function updateEstado(int $ticketId, int $nuevoEstado, int $usuarioId)
{
    try {
        // 1️⃣ Validar que el ticket exista
        $sqlCheck = "SELECT id FROM tickets WHERE id = $ticketId";
        $ticket = $this->enlace->executeSQL($sqlCheck);
        if (empty($ticket)) {
            error_log("⚠️ Ticket no encontrado: ID $ticketId");
            return false;
        }

        // 2️⃣ Actualizar estado del ticket
        $sqlUpdate = "UPDATE tickets
                      SET estado_id = $nuevoEstado,
                          actualizado_en = NOW()
                      WHERE id = $ticketId";
        $ok1 = $this->enlace->executeSQL_DML($sqlUpdate);

        // 3️⃣ Insertar registro en historial_estados y obtener su ID
        $sqlHist = "INSERT INTO historial_estados (ticket_id, estado_id, usuario_id, fecha, observaciones)
                    VALUES ($ticketId, $nuevoEstado, $usuarioId, NOW(), 'Cambio de estado manual')";
        $lastId = $this->enlace->executeSQL_DML_last($sqlHist);

        if ($ok1 === false || $lastId === 0) {
            error_log("❌ Error en ejecución SQL en updateEstado");
            return false;
        }

        // ✅ 4️⃣ Retornar el ID del historial insertado
        return [
            "success" => true,
            "historial_id" => $lastId
        ];
    } catch (Throwable $e) {
        error_log("❌ Excepción en updateEstado(): " . $e->getMessage());
        return false;
    }
}



}