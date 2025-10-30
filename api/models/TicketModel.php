<?php
// ============================================================
//  MODELO: TicketModel
//  Descripción: Contiene toda la lógica de acceso a datos
//  relacionada con los tickets, incluyendo listados por rol,
//  detalle de ticket, cálculo de SLA, historial y valoraciones.
// ============================================================

class TicketModel
{
    // Propiedad pública para mantener la conexión activa a la base de datos
    public $enlace;

 
    // Constructor: inicializa la conexión al crear la instancia del modelo
  
    public function __construct()
    {
        // Se crea una nueva conexión utilizando la clase MySqlConnect,
        // la cual abstrae las operaciones de conexión y ejecución SQL
        $this->enlace = new MySqlConnect();
    }

    /* -----------------------------------------------------------
     * Utilidad interna: valida que un usuario pertenezca a un rol
     * ----------------------------------------------------------- */
    private function assertRole(int $userId, int $rolId): bool
    {
        // Se construye una consulta SQL que busca el usuario con el ID y rol especificados
        $vSql = "SELECT 1
                 FROM usuarios
                 WHERE id = " . intval($userId) . "
                   AND rol_id = " . intval($rolId) . "
                   AND activo = 1
                 LIMIT 1";
        // Se ejecuta la consulta mediante el método ExecuteSQL del objeto de conexión
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        // Si la consulta devuelve algún resultado, retorna true; de lo contrario, false
        return !empty($vResultado);
    }

    /* -----------------------------------------------------------
     * (1) ADMIN: Listar TODOS los tickets (máx. 4 campos)
     * ----------------------------------------------------------- */
    public function listAdmin(int $adminId)
    {
        // Valida que el usuario que invoca el método tenga rol de administrador (rol_id = 1)
        if (!$this->assertRole($adminId, 1)) return [];

        // Consulta SQL para obtener todos los tickets con sus datos principales
        $vSql = "
            SELECT 
                tk.id,                         -- ID del ticket
                tk.titulo,                     -- Título del ticket
                tk.fecha_creacion,             -- Fecha de creación del ticket
                e.nombre AS estado,            -- Estado actual del ticket
                c.nombre AS categoria,         -- Categoría asociada
                p.nombre AS prioridad          -- Prioridad del ticket
            FROM tickets tk
            JOIN estados_ticket e ON e.id = tk.estado_id
            LEFT JOIN categorias c ON c.id = tk.categoria_id
            LEFT JOIN prioridades p ON p.id = tk.prioridad_id
            ORDER BY tk.fecha_creacion DESC   -- Orden descendente por fecha (más recientes primero)
        ";
        // Retorna el resultado de la consulta o un arreglo vacío si no hay registros
        return $this->enlace->ExecuteSQL($vSql) ?: [];
    }

    /* -----------------------------------------------------------
     * (2) TÉCNICO: Listar tickets ASIGNADOS al técnico
     * ----------------------------------------------------------- */
    public function listTecnico(int $tecnicoId)
    {
        // Valida que el usuario sea un técnico (rol_id = 2)
        if (!$this->assertRole($tecnicoId, 2)) return [];

        // Consulta SQL que obtiene los tickets asignados al técnico con su información principal
        $vSql = "
            SELECT 
                tk.id,                         -- ID del ticket
                tk.titulo,                     -- Título del ticket
                tk.fecha_creacion,             -- Fecha de creación
                e.nombre AS estado,            -- Estado actual
                c.nombre AS categoria,         -- Categoría asociada
                p.nombre AS prioridad          -- Prioridad del ticket
            FROM asignaciones a
            JOIN tickets tk ON tk.id = a.ticket_id             -- Une las asignaciones con sus tickets
            JOIN estados_ticket e ON e.id = tk.estado_id       -- Une con la tabla de estados
            LEFT JOIN categorias c ON c.id = tk.categoria_id   -- Trae la categoría (si existe)
            LEFT JOIN prioridades p ON p.id = tk.prioridad_id  -- Trae la prioridad (si existe)
            WHERE a.vigente = 1                                -- Solo las asignaciones activas
              AND a.tecnico_id = " . intval($tecnicoId) . "    -- Filtra por el técnico actual
            ORDER BY tk.fecha_creacion DESC                    -- Ordena por fecha de creación (descendente)
        ";
        // Devuelve el resultado de la consulta o un arreglo vacío si no hay tickets
        return $this->enlace->ExecuteSQL($vSql) ?: [];
    }

    /* -----------------------------------------------------------
     * (3) CLIENTE: Listar tickets creados por el cliente
     * ----------------------------------------------------------- */
    public function listCliente(int $clienteId)
    {
        // Verifica que el usuario tenga rol de cliente (rol_id = 3)
        if (!$this->assertRole($clienteId, 3)) return [];

        // Consulta SQL que devuelve los tickets creados por el cliente
        $vSql = "
            SELECT 
                tk.id,                         -- ID del ticket
                tk.titulo,                     -- Título
                tk.fecha_creacion,             -- Fecha de creación
                e.nombre AS estado,            -- Estado actual
                c.nombre AS categoria,         -- Categoría asociada
                p.nombre AS prioridad          -- Prioridad del ticket
            FROM tickets tk
            JOIN estados_ticket e ON e.id = tk.estado_id
            LEFT JOIN categorias c ON c.id = tk.categoria_id
            LEFT JOIN prioridades p ON p.id = tk.prioridad_id
            WHERE tk.usuario_solicitante_id = " . intval($clienteId) . "   -- Filtra por usuario actual
            ORDER BY tk.fecha_creacion DESC
        ";
        // Retorna el listado o un arreglo vacío si no hay resultados
        return $this->enlace->ExecuteSQL($vSql) ?: [];
    }

    /* -----------------------------------------------------------
     * (4) DETALLE por ID: datos completos del ticket
     * ----------------------------------------------------------- */
    public function getById(int $ticketId)
    {
        /* A) Datos básicos */
        // Consulta principal que obtiene toda la información básica del ticket solicitado
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
        // Ejecuta la consulta y obtiene el primer resultado
        $rBasicos = $this->enlace->ExecuteSQL($vSqlBasicos);
        // Si no hay resultados, retorna null
        if (empty($rBasicos)) return null;
        // Guarda el resultado en una variable más descriptiva
        $basicos = $rBasicos[0];

        /* B) Cálculo de SLA */
        // Consulta que calcula la cantidad de horas restantes hasta los límites de respuesta y resolución
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
        // Ejecuta la consulta de SLA
        $rSla = $this->enlace->ExecuteSQL($vSqlSla);
        // Si hay resultados, se toma el primero; si no, se devuelven valores nulos
        $sla  = $rSla ? $rSla[0] : (object)[
            "hrs_resp_restantes"  => null,
            "hrs_resol_restantes" => null
        ];

        // ✅ Determina si el SLA está cumplido o no (según las horas restantes)
        $sla->cumple_respuesta  = is_null($sla->hrs_resp_restantes)
            ? null
            : ($sla->hrs_resp_restantes >= 0 ? 'Cumple' : 'No cumple');

        $sla->cumple_resolucion = is_null($sla->hrs_resol_restantes)
            ? null
            : ($sla->hrs_resol_restantes >= 0 ? 'Cumple' : 'No cumple');

        /* C) Historial de estados con observaciones e imágenes */
        // Consulta que devuelve el historial de estados del ticket con observaciones y posibles imágenes adjuntas
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
        // Ejecuta la consulta de historial
        $rowsHist = $this->enlace->ExecuteSQL($vSqlHist) ?: [];

        // Arreglo que almacenará el historial estructurado con imágenes agrupadas
        $historial = [];
        foreach ($rowsHist as $r) {
            $hid = $r->historial_id;
            // Si aún no existe este historial en el arreglo, se crea
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
            // Si hay imágenes asociadas, se agregan al arreglo correspondiente
            if (!is_null($r->imagen_id)) {
                $historial[$hid]["imagenes"][] = [
                    "imagen_id"  => $r->imagen_id,
                    "ruta"       => $r->ruta,
                    "descripcion"=> $r->imagen_desc
                ];
            }
        }
        // Reindexa el arreglo para obtener un formato limpio
        $historial = array_values($historial);

        /* D) Valoración del ticket */
        // Consulta para traer la valoración del ticket (si existe)
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
        // Ejecuta la consulta
        $rVal = $this->enlace->ExecuteSQL($vSqlVal);
        // Toma la primera valoración si existe, de lo contrario devuelve null
        $valoracion = ($rVal && !empty($rVal[0])) ? $rVal[0] : null;

        /* Empaquetar y retornar */
        // Retorna toda la información del ticket agrupada en un solo arreglo
        return [
            "basicos"   => $basicos,     // Información general
            "sla"       => $sla,         // Cálculo y cumplimiento de SLA
            "historial" => $historial,   // Estados y observaciones
            "valoracion"=> $valoracion   // Comentarios del cliente
        ];
    }

    /* -----------------------------------------------------------
     * Autorizaciones (cliente/técnico)
     * ----------------------------------------------------------- */
    public function belongsToClient(int $ticketId, int $userId): bool
    {
        // Verifica si el ticket pertenece al cliente indicado
        $vSql = "SELECT 1
                 FROM tickets
                 WHERE id = " . intval($ticketId) . "
                   AND usuario_solicitante_id = " . intval($userId) . "
                 LIMIT 1";
        return !empty($this->enlace->ExecuteSQL($vSql));
    }

    public function assignedToTech(int $ticketId, int $userId): bool
    {
        // Verifica si el ticket está asignado al técnico actual
        $vSql = "SELECT 1
                 FROM asignaciones
                 WHERE ticket_id = " . intval($ticketId) . "
                   AND tecnico_id = " . intval($userId) . "
                   AND vigente = 1
                 LIMIT 1";
        return !empty($this->enlace->ExecuteSQL($vSql));
    }

    /* -----------------------------------------------------------
     * (5) Obtener los tickets más recientes
     * ----------------------------------------------------------- */
    public function getRecientes(int $limite = 6)
    {
        // Consulta para obtener los últimos tickets creados, limitando la cantidad con el parámetro recibido
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
        // Retorna el listado de tickets o un arreglo vacío si no hay resultados
        return $this->enlace->ExecuteSQL($vSql) ?: [];
    }

    /* -----------------------------------------------------------
     * ACTUALIZAR ESTADO DEL TICKET
     * ----------------------------------------------------------- */
    public function updateEstado(int $ticketId, int $nuevoEstado, int $usuarioId)
    {
        try {
            // Verifica que el ticket exista antes de actualizarlo
            $sqlCheck = "SELECT id FROM tickets WHERE id = $ticketId";
            if (empty($this->enlace->executeSQL($sqlCheck))) return false;

            // Actualiza el estado del ticket y la fecha de modificación
            $sqlUpdate = "UPDATE tickets
                          SET estado_id = $nuevoEstado,
                              actualizado_en = NOW()
                          WHERE id = $ticketId";
            $ok1 = $this->enlace->executeSQL_DML($sqlUpdate);

            // Inserta un nuevo registro en el historial de estados, registrando el cambio
            $sqlHist = "INSERT INTO historial_estados (ticket_id, estado_id, usuario_id, fecha, observaciones)
                        VALUES ($ticketId, $nuevoEstado, $usuarioId, NOW(), 'Cambio de estado manual')";
            $lastId = $this->enlace->executeSQL_DML_last($sqlHist);

            // Si alguna de las operaciones falla, retorna false
            if ($ok1 === false || $lastId === 0) return false;

            // Retorna éxito y el ID del nuevo historial registrado
            return ["success" => true, "historial_id" => $lastId];
        } catch (Throwable $e) {
            // Captura y registra cualquier excepción ocurrida durante la ejecución
            error_log("❌ Excepción en updateEstado(): " . $e->getMessage());
            return false;
        }
    }
}
