<?php
// ============================================================
// MODELO: AsignacionModel
// Descripción:
//  Este modelo se encarga de obtener la información de las
//  asignaciones de tickets (qué técnico tiene qué ticket),
//  tanto para la vista del administrador como para la del técnico.
//  También calcula el estado visual (color, icono) y la información
//  del SLA (tiempo restante).
// ============================================================

class AsignacionModel
{
    /** Conexión a la BD */
    private $db; // Propiedad privada que almacena el objeto de conexión

    public function __construct()
    {
        // Se inicializa la conexión con la base de datos mediante la clase MySqlConnect
        // Esto permite ejecutar sentencias SQL a través de los métodos del objeto $db
        $this->db = new MySqlConnect();
    }

    /* -----------------------------------------------------------
     * 🔹 1. Obtener TODAS las asignaciones (admin o técnico)
     * ----------------------------------------------------------- */
    public function allByRole(int $rolId, int $userId)
    {
        // Si el usuario tiene rol de administrador (rol_id = 1)
        if ($rolId == 1) {
            // 🟢 ADMIN: obtiene todos los tickets, incluso los que no están asignados
            $sql = "
                SELECT
                    tk.id AS ticket_id,                     -- ID del ticket
                    tk.titulo,                              -- Título del ticket
                    c.nombre AS categoria,                  -- Nombre de la categoría del ticket
                    e.nombre AS estado,                     -- Estado actual del ticket
                    COALESCE(u.nombre, 'N/A') AS tecnico,   -- Nombre del técnico asignado o 'N/A' si no tiene
                    a.fecha_asignacion,                     -- Fecha en que se asignó el ticket
                    CASE
                        WHEN tk.sla_resol_limite IS NULL THEN NULL
                        ELSE TIMESTAMPDIFF(HOUR, NOW(), tk.sla_resol_limite)
                    END AS horas_restantes_sla              -- Horas restantes hasta vencer el SLA
                FROM tickets tk
                LEFT JOIN asignaciones a ON a.ticket_id = tk.id AND a.vigente = 1 -- Une las asignaciones activas
                LEFT JOIN usuarios u ON u.id = a.tecnico_id                        -- Trae el nombre del técnico
                JOIN categorias c ON c.id = tk.categoria_id                        -- Trae la categoría asociada
                JOIN estados_ticket e ON e.id = tk.estado_id                       -- Trae el estado del ticket
                ORDER BY tk.fecha_creacion DESC;                                   -- Ordena por fecha de creación (descendente)
            ";
        } else {
            // 🔵 TÉCNICO: obtiene solo las asignaciones del técnico actual
            $sql = "
                SELECT
                    a.id AS asignacion_id,                  -- ID de la asignación
                    a.ticket_id,                            -- ID del ticket asociado
                    tk.titulo,                              -- Título del ticket
                    c.nombre AS categoria,                  -- Categoría asociada
                    e.nombre AS estado,                     -- Estado actual del ticket
                    u.nombre AS tecnico,                    -- Nombre del técnico (actual)
                    a.fecha_asignacion,                     -- Fecha en la que se realizó la asignación
                    CASE
                        WHEN tk.sla_resol_limite IS NULL THEN NULL
                        ELSE TIMESTAMPDIFF(HOUR, NOW(), tk.sla_resol_limite)
                    END AS horas_restantes_sla              -- Diferencia en horas entre ahora y el límite SLA
                FROM asignaciones a
                JOIN tickets tk ON tk.id = a.ticket_id      -- Relación ticket-asignación
                JOIN categorias c ON c.id = tk.categoria_id -- Categoría del ticket
                JOIN estados_ticket e ON e.id = tk.estado_id-- Estado del ticket
                JOIN usuarios u ON u.id = a.tecnico_id      -- Técnico asignado
                WHERE a.vigente = 1                         -- Solo las asignaciones activas (vigentes)
                  AND a.tecnico_id = " . intval($userId) . " -- Filtra por el técnico actual
                ORDER BY a.fecha_asignacion DESC, tk.id ASC; -- Ordena por fecha y luego por ID
            ";
        }

        // Ejecuta la consulta SQL (si falla o no hay resultados, retorna un arreglo vacío)
        $rows = $this->db->executeSQL($sql) ?: [];

        // 🎨 Paleta de colores e íconos para representar visualmente el estado de cada ticket
        // Se utiliza más adelante para mostrar colores e íconos distintos según el estado.
        $palette = [
            'Pendiente'  => ['color' => '#9ca3af', 'icon' => 'clock'],         // Gris - reloj
            'Asignado'   => ['color' => '#3b82f6', 'icon' => 'user-check'],    // Azul - usuario asignado
            'En Proceso' => ['color' => '#f59e0b', 'icon' => 'loader'],        // Amarillo - proceso
            'Resuelto'   => ['color' => '#10b981', 'icon' => 'check-circle'],  // Verde - completado
            'Cerrado'    => ['color' => '#6b7280', 'icon' => 'archive'],       // Gris oscuro - cerrado
        ];

        // Recorre cada resultado para agregarle metadatos visuales y cálculos de SLA
        foreach ($rows as $r) {
            // Busca el color y el icono correspondiente al estado actual
            $meta = $palette[$r->estado] ?? ['color' => '#9ca3af', 'icon' => 'circle'];
            $r->estado_color = $meta['color']; // Se agrega un nuevo atributo 'estado_color' al objeto
            $r->estado_icon  = $meta['icon'];  // Se agrega un nuevo atributo 'estado_icon' al objeto

            // Si el ticket no tiene SLA configurado (nulo)
            if ($r->horas_restantes_sla === null) {
                $r->sla_status   = 'N/A';   // No aplica SLA
                $r->sla_progress = null;    // Sin barra de progreso
            } else {
                // Convierte las horas restantes a entero
                $hrs = (int)$r->horas_restantes_sla;

                // Define el estado del SLA dependiendo de si aún está dentro del tiempo o vencido
                $r->sla_status = ($hrs > 0) ? 'Dentro de SLA' : 'Vencido';

                // Define un valor de progreso visual (por ejemplo para una barra)
                // Si el SLA ya venció → 0%
                // Si quedan ≤12h → 50%
                // Si quedan ≤24h → 80%
                // Si queda más tiempo → 100%
                $r->sla_progress = $hrs <= 0 ? 0 : ($hrs <= 12 ? 50 : ($hrs <= 24 ? 80 : 100));
            }

            // Si el técnico está vacío o nulo, se reemplaza por "N/A"
            if (!$r->tecnico || $r->tecnico === '') {
                $r->tecnico = "N/A";
            }
        }

        // Devuelve el arreglo completo con todos los datos enriquecidos
        return $rows;
    }

    /* -----------------------------------------------------------
     * 🔹 2. Obtener asignaciones por semana (admin o técnico)
     * ----------------------------------------------------------- */
    public function weeklyByRole(int $rolId, int $userId, string $monday, string $sunday)
    {
        // Define la condición base: solo asignaciones vigentes (activas)
        $where = "a.vigente = 1";

        // Si el usuario es técnico (rol 2), se filtra por su propio ID
        if ($rolId == 2) {
            $where .= " AND a.tecnico_id = " . intval($userId);
        }

        // Consulta SQL que obtiene todas las asignaciones comprendidas entre lunes y domingo
        // El rango semanal se define con las variables $monday y $sunday recibidas por parámetro
        $sql = "
            SELECT
                a.id                 AS asignacion_id,      -- ID de la asignación
                a.ticket_id,                                 -- ID del ticket asociado
                tk.titulo,                                   -- Título del ticket
                c.nombre             AS categoria,           -- Categoría del ticket
                e.nombre             AS estado,              -- Estado del ticket
                u.nombre             AS tecnico,             -- Técnico asignado
                a.fecha_asignacion,                          -- Fecha de asignación
                CASE
                    WHEN tk.sla_resol_limite IS NULL THEN NULL
                    ELSE TIMESTAMPDIFF(HOUR, NOW(), tk.sla_resol_limite)
                END                  AS horas_restantes_sla  -- Horas restantes del SLA
            FROM asignaciones a
            JOIN tickets tk        ON tk.id = a.ticket_id
            JOIN categorias c      ON c.id = tk.categoria_id
            JOIN estados_ticket e  ON e.id = tk.estado_id
            JOIN usuarios u        ON u.id = a.tecnico_id
            WHERE $where
              AND DATE(a.fecha_asignacion) BETWEEN '" . addslashes($monday) . "'
                                              AND '" . addslashes($sunday) . "'  -- addslashes evita inyección SQL
            ORDER BY a.fecha_asignacion ASC, tk.id ASC;       -- Orden por fecha e ID
        ";

        // Ejecuta la consulta y obtiene los resultados (si no hay, retorna array vacío)
        $rows = $this->db->executeSQL($sql) ?: [];

        // Se define nuevamente la misma paleta visual de estados
        $palette = [
            'Pendiente'  => ['color' => '#9ca3af', 'icon' => 'clock'],
            'Asignado'   => ['color' => '#3b82f6', 'icon' => 'user-check'],
            'En Proceso' => ['color' => '#f59e0b', 'icon' => 'loader'],
            'Resuelto'   => ['color' => '#10b981', 'icon' => 'check-circle'],
            'Cerrado'    => ['color' => '#6b7280', 'icon' => 'archive'],
        ];

        // Recorre cada fila del resultado para agregar el color e icono correspondiente
        foreach ($rows as $r) {
            // Busca los metadatos visuales del estado
            $meta = $palette[$r->estado] ?? ['color' => '#9ca3af', 'icon' => 'circle'];
            $r->estado_color = $meta['color']; // Color asociado al estado
            $r->estado_icon  = $meta['icon'];  // Ícono asociado al estado
        }

        // Retorna la lista final con metadatos visuales
        return $rows;
    }
}
