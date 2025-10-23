<?php
class AsignacionModel
{
    /** Conexión a la BD */
    private $db;

    public function __construct()
    {
        $this->db = new MySqlConnect();
    }

    /* -----------------------------------------------------------
     * 🔹 1. Obtener TODAS las asignaciones (admin o técnico)
     * ----------------------------------------------------------- */
public function allByRole(int $rolId, int $userId)
{
    if ($rolId == 1) {
        // 🟢 ADMIN: todos los tickets, incluso los no asignados
        $sql = "
            SELECT
                tk.id AS ticket_id,
                tk.titulo,
                c.nombre AS categoria,
                e.nombre AS estado,
                COALESCE(u.nombre, 'N/A') AS tecnico,
                a.fecha_asignacion,
                CASE
                    WHEN tk.sla_resol_limite IS NULL THEN NULL
                    ELSE TIMESTAMPDIFF(HOUR, NOW(), tk.sla_resol_limite)
                END AS horas_restantes_sla
            FROM tickets tk
            LEFT JOIN asignaciones a ON a.ticket_id = tk.id AND a.vigente = 1
            LEFT JOIN usuarios u ON u.id = a.tecnico_id
            JOIN categorias c ON c.id = tk.categoria_id
            JOIN estados_ticket e ON e.id = tk.estado_id
            ORDER BY tk.fecha_creacion DESC;
        ";
    } else {
        // 🔵 TECNICO: solo sus asignaciones activas
        $sql = "
            SELECT
                a.id AS asignacion_id,
                a.ticket_id,
                tk.titulo,
                c.nombre AS categoria,
                e.nombre AS estado,
                u.nombre AS tecnico,
                a.fecha_asignacion,
                CASE
                    WHEN tk.sla_resol_limite IS NULL THEN NULL
                    ELSE TIMESTAMPDIFF(HOUR, NOW(), tk.sla_resol_limite)
                END AS horas_restantes_sla
            FROM asignaciones a
            JOIN tickets tk ON tk.id = a.ticket_id
            JOIN categorias c ON c.id = tk.categoria_id
            JOIN estados_ticket e ON e.id = tk.estado_id
            JOIN usuarios u ON u.id = a.tecnico_id
            WHERE a.vigente = 1
              AND a.tecnico_id = " . intval($userId) . "
            ORDER BY a.fecha_asignacion DESC, tk.id ASC;
        ";
    }

    $rows = $this->db->executeSQL($sql) ?: [];

    // 🎨 Paleta de estados
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

        if ($r->horas_restantes_sla === null) {
            $r->sla_status   = 'N/A';
            $r->sla_progress = null;
        } else {
            $hrs = (int)$r->horas_restantes_sla;
            $r->sla_status   = ($hrs > 0) ? 'Dentro de SLA' : 'Vencido';
            $r->sla_progress = $hrs <= 0 ? 0 : ($hrs <= 12 ? 50 : ($hrs <= 24 ? 80 : 100));
        }

        if (!$r->tecnico || $r->tecnico === '') {
            $r->tecnico = "N/A";
        }
    }

    return $rows;
}
    /* -----------------------------------------------------------
     * 🔹 2. Obtener asignaciones por semana (admin o técnico)
     * ----------------------------------------------------------- */
    public function weeklyByRole(int $rolId, int $userId, string $monday, string $sunday)
    {
        $where = "a.vigente = 1";
        if ($rolId == 2) {
            $where .= " AND a.tecnico_id = " . intval($userId);
        }

        $sql = "
            SELECT
                a.id                 AS asignacion_id,
                a.ticket_id,
                tk.titulo,
                c.nombre             AS categoria,
                e.nombre             AS estado,
                u.nombre             AS tecnico,
                a.fecha_asignacion,
                CASE
                    WHEN tk.sla_resol_limite IS NULL THEN NULL
                    ELSE TIMESTAMPDIFF(HOUR, NOW(), tk.sla_resol_limite)
                END                  AS horas_restantes_sla
            FROM asignaciones a
            JOIN tickets tk        ON tk.id = a.ticket_id
            JOIN categorias c      ON c.id = tk.categoria_id
            JOIN estados_ticket e  ON e.id = tk.estado_id
            JOIN usuarios u        ON u.id = a.tecnico_id
            WHERE $where
              AND DATE(a.fecha_asignacion) BETWEEN '" . addslashes($monday) . "'
                                              AND '" . addslashes($sunday) . "'
            ORDER BY a.fecha_asignacion ASC, tk.id ASC;
        ";

        $rows = $this->db->executeSQL($sql) ?: [];

        // mismos metadatos visuales
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
        }

        return $rows;
    }
}