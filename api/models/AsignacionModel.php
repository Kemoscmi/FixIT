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
}
