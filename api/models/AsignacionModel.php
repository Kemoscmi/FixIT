<?php
class AsignacionModel
{
    /** Conexión a la BD */
    private $db;

    public function __construct()
    {
        // Conexión a la base de datos
        $this->db = new MySqlConnect();
    }

    /* -----------------------------------------------------------
     * Vista semanal de asignaciones del técnico (usuario) activo
     *
     * Descripción:
     *  - Obtiene las asignaciones vigentes (a.vigente = 1) del técnico
     *    dentro del rango [lunes..domingo] de una semana específica.
     *  - Devuelve datos listos para pintar un tablero/agenda:
     *      ticket_id, titulo, categoria, estado, fecha_asignacion,
     *      horas_restantes_sla (calculado), y metadatos de UI:
     *      estado_color, estado_icon, sla_status, sla_progress.
     *
     * Parámetros:
     *  - $userId (int)     : ID del técnico (coincide con usuarios.id)
     *  - $monday (string)  : Lunes de la semana en formato 'YYYY-MM-DD'
     *  - $sunday (string)  : Domingo de la semana en formato 'YYYY-MM-DD'
     *
     * Consideraciones:
     *  - El tiempo restante de SLA de resolución se calcula con
     *    TIMESTAMPDIFF(HOUR, NOW(), tk.sla_resol_limite).
     *  - Si el ticket no tiene sla_resol_limite, se retorna NULL.
     *  - Los campos de UI (color, icono, barra progreso) se calculan aquí
     *    para simplificar el frontend.
     *
     * Retorna:
     *  - array de objetos (uno por asignación) con las propiedades:
     *      asignacion_id, ticket_id, titulo, categoria, estado,
     *      fecha_asignacion, horas_restantes_sla,
     *      estado_color, estado_icon, sla_status, sla_progress
     * ----------------------------------------------------------- */
    public function weeklyForTech(int $userId, string $monday, string $sunday)
    {
        $sql = "
            SELECT
                a.id                 AS asignacion_id,
                a.ticket_id,
                tk.titulo,
                c.nombre             AS categoria,
                e.nombre             AS estado,
                a.fecha_asignacion,
                CASE
                    WHEN tk.sla_resol_limite IS NULL THEN NULL
                    ELSE TIMESTAMPDIFF(HOUR, NOW(), tk.sla_resol_limite)
                END                  AS horas_restantes_sla
            FROM asignaciones a
            JOIN tickets tk        ON tk.id = a.ticket_id
            JOIN categorias c      ON c.id = tk.categoria_id
            JOIN estados_ticket e  ON e.id = tk.estado_id
            WHERE a.vigente = 1
              AND a.tecnico_id = " . intval($userId) . "
              AND DATE(a.fecha_asignacion) BETWEEN '" . addslashes($monday) . "'
                                                 AND '" . addslashes($sunday) . "'
            ORDER BY a.fecha_asignacion ASC, tk.id ASC;
        ";

       
        // Usa el que tengas estandarizado en MySqlConnect.
        $rows = $this->db->executeSQL($sql) ?: [];

        // Paleta de estado para la UI (colores e iconos sugeridos)
        $palette = [
            'Pendiente'  => ['color' => '#9ca3af', 'icon' => 'clock'],
            'Asignado'   => ['color' => '#3b82f6', 'icon' => 'user-check'],
            'En Proceso' => ['color' => '#f59e0b', 'icon' => 'loader'],
            'Resuelto'   => ['color' => '#10b981', 'icon' => 'check-circle'],
            'Cerrado'    => ['color' => '#6b7280', 'icon' => 'archive'],
        ];

        // Post-procesamiento para enriquecer los datos de la UI
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
                // Barra simple de progreso para tu tablero (0/50/80/100)
                $r->sla_progress = $hrs <= 0 ? 0 : ($hrs <= 12 ? 50 : ($hrs <= 24 ? 80 : 100));
            }
        }

        return $rows;
    }
}