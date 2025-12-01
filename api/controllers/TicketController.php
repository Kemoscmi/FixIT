<?php
// ============================================================
// CONTROLADOR: TicketController
// Descripción:
//  Este controlador maneja todas las operaciones HTTP relacionadas
//  con los tickets. Recibe solicitudes desde el frontend (o Postman),
//  valida los parámetros, llama al modelo TicketModel y devuelve
//  respuestas JSON con la información solicitada.
// ============================================================

class TicketController
{
    // ============================================================
    // PRUEBA EN POSTMAN (LISTADO POR ROL)
    // ============================================================
    // Aquí se detallan ejemplos de cómo probar este controlador en Postman.
    // Se utiliza el método GET con diferentes parámetros (rol_id y user_id)
    // para obtener el listado de tickets según el tipo de usuario:
    //   - rol_id = 1  → Administrador (ve todos los tickets)
    //   - rol_id = 2  → Técnico (ve solo sus tickets asignados vigentes)
    //   - rol_id = 3  → Cliente (ve solo sus propios tickets creados)
    //
    // Ejemplos:
    // GET -> http://localhost:81/Proyecto/api/TicketController?rol_id=1&user_id=1
    // GET -> http://localhost:81/Proyecto/api/TicketController?rol_id=2&user_id=3
    // GET -> http://localhost:81/Proyecto/api/TicketController?rol_id=3&user_id=4
    //
    // El resultado esperado es una lista de tickets con 4 campos:
    // id, titulo, fecha_creacion y estado.
    // ============================================================

    public function index()
    {
        // Se crea un nuevo objeto Response, encargado de devolver las respuestas en formato JSON
        $response = new Response();
        try {
            // Define el tipo de contenido de la respuesta como JSON con codificación UTF-8
            header('Content-Type: application/json; charset=utf-8');

            // Obtiene los parámetros de la URL (query string)
            // Ejemplo: ?rol_id=1&user_id=3
            $rolId  = isset($_GET['rol_id'])  ? intval($_GET['rol_id'])  : 0; // intval convierte el valor a número entero
            $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

            // Si falta alguno de los parámetros requeridos, retorna error 400 (Bad Request)
            if (!$rolId || !$userId) {
                http_response_code(400); // Envía el código HTTP 400 al cliente
                $response->toJSON(null, "Faltan parámetros rol_id y user_id", 400);
                return; // Detiene la ejecución
            }

            // Se instancia el modelo que interactuará con la base de datos
            $model = new TicketModel();

            // Según el rol del usuario, se ejecuta el método correspondiente del modelo
            switch ($rolId) {
                case 1:
                    $data = $model->listAdmin($userId);
                    break; // Admin ve todos los tickets
                case 2:
                    $data = $model->listTecnico($userId);
                    break; // Técnico ve los tickets asignados
                case 3:
                    $data = $model->listCliente($userId);
                    break; // Cliente ve sus propios tickets
                default:
                    // Si el rol no es válido, se devuelve error 400 con mensaje explicativo
                    http_response_code(400);
                    $response->toJSON(null, "rol_id inválido (use 1=Administrador, 2=Tecnico, 3=Cliente)", 400);
                    return;
            }

            // Si la ejecución es correcta, se envía la respuesta con los datos obtenidos
            $response->toJSON($data, "Listado de tickets");
        } catch (Exception $e) {
            // Si ocurre una excepción (error del sistema), devuelve código 500 (Error interno del servidor)
            http_response_code(500);
            $response->toJSON(null, "Error al obtener tickets", 500);
            handleException($e); // Función que registra el error en logs
        } catch (\Throwable $e) {
            // Captura errores fatales o no esperados (Throwable incluye errores y excepciones)
            http_response_code(500);
            $response->toJSON(null, "Error inesperado", 500);
            handleException($e);
        }
    }

    // ============================================================
    // PRUEBA EN POSTMAN (DETALLE DE TICKET)
    // ============================================================
    // Este método obtiene la información completa de un ticket por su ID.
    // Ejemplos de prueba:
    // GET -> http://localhost:81/Proyecto/api/TicketController/1?rol_id=1&user_id=1   (Administrador)
    // GET -> http://localhost:81/Proyecto/api/TicketController/1?rol_id=2&user_id=2   (Técnico asignado)
    // GET -> http://localhost:81/Proyecto/api/TicketController/1?rol_id=3&user_id=4   (Cliente solicitante)
    //
    // Autorización:
    //  - Admin   → Puede acceder a cualquier ticket.
    //  - Técnico → Solo si el ticket está asignado a él y la asignación está vigente.
    //  - Cliente → Solo si es el solicitante del ticket.
    //
    // Devuelve: toda la información (datos básicos, SLA, historial e imágenes, valoraciones).
    // ============================================================

    public function get($id)
    {
        $response = new Response();
        try {
            header('Content-Type: application/json; charset=utf-8');

            // Captura los parámetros GET y el id de la ruta (Path parameter)
            $rolId    = isset($_GET['rol_id'])  ? intval($_GET['rol_id'])  : 0;
            $userId   = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
            $ticketId = intval($id); // El parámetro $id viene desde la URL (ejemplo /TicketController/1)

            // Valida que todos los parámetros estén presentes
            if (!$rolId || !$userId || !$ticketId) {
                http_response_code(400);
                $response->toJSON(null, "Faltan parámetros: rol_id, user_id o ticket id", 400);
                return;
            }

            // Instancia del modelo de datos
            $model = new TicketModel();

            // --- Validación de permisos según el rol ---
            $authorized = false;
            if ($rolId === 1) {
                $authorized = true; // Admin puede ver todos
            } elseif ($rolId === 2) {
                $authorized = $model->assignedToTech($ticketId, $userId); // Verifica si el técnico tiene ese ticket
            } elseif ($rolId === 3) {
                $authorized = $model->belongsToClient($ticketId, $userId); // Verifica si el cliente es el solicitante
            } else {
                http_response_code(400);
                $response->toJSON(null, "rol_id inválido (use 1=Administrador, 2=Tecnico, 3=Cliente)", 400);
                return;
            }

            // Si el usuario no tiene autorización, devuelve error 403 (Prohibido)
            if (!$authorized) {
                http_response_code(403);
                $response->toJSON(null, "Acceso denegado", 403);
                return;
            }

            // Si pasa la validación, obtiene la información completa del ticket
            $data = $model->getById($ticketId);

            // Si no existe el ticket, devuelve error 404 (no encontrado)
            if (!$data) {
                http_response_code(404);
                $response->toJSON(null, "Ticket no encontrado", 404);
                return;
            }

            // Devuelve el detalle en formato JSON
            $response->toJSON($data, "Detalle de ticket");
        } catch (Exception $e) {
            http_response_code(500);
            $response->toJSON(null, "Error al obtener el detalle", 500);
            handleException($e);
        } catch (\Throwable $e) {
            http_response_code(500);
            $response->toJSON(null, "Error inesperado", 500);
            handleException($e);
        }
    }

    // ============================================================
    // TICKETS RECIENTES
    // ============================================================
    // Método para obtener los tickets más recientes del sistema.
    // Se puede probar con:
    // GET -> http://localhost:81/Proyecto/api/TicketController/recientes
    //
    // No requiere rol ni parámetros. Retorna los últimos registros
    // con su información principal.
    // ============================================================
    public function recientes()
    {
        $response = new Response();
        try {
            header('Content-Type: application/json; charset=utf-8');

            // Se instancia el modelo y se ejecuta la función de obtener los tickets más recientes
            $model = new TicketModel();
            $data = $model->getRecientes();

            // Devuelve los resultados como JSON con código 200 (OK)
            $response->toJSON(
                $data,
                "Tickets recientes obtenidos correctamente",
                200
            );
        } catch (Exception $e) {
            http_response_code(500);
            $response->toJSON(null, "Error al obtener tickets recientes", 500);
            handleException($e);
        } catch (\Throwable $e) {
            http_response_code(500);
            $response->toJSON(null, "Error inesperado al obtener tickets recientes", 500);
            handleException($e);
        }
    }

   public function updateEstado()
{
    $response = new Response();
    try {
        header('Content-Type: application/json; charset=utf-8');

        // 🔹 Captura de datos enviados por POST
        $ticketId   = isset($_POST['ticket_id']) ? intval($_POST['ticket_id']) : 0;
        $nuevoEstado = isset($_POST['nuevo_estado_id']) ? intval($_POST['nuevo_estado_id']) : 0;
        $usuarioId   = isset($_POST['usuario_id']) ? intval($_POST['usuario_id']) : 0;
        $observaciones = isset($_POST['observaciones']) ? trim($_POST['observaciones']) : "";

        // 🔹 Validación de datos obligatorios
        if (!$ticketId || !$nuevoEstado || !$usuarioId || $observaciones === "") {
            http_response_code(400);
            $response->toJSON(null, "Debe enviar: ticket_id, nuevo_estado_id, usuario_id y observaciones.", 400);
            return;
        }

        // 🔹 Cargar modelo
        $model = new TicketModel();

        // 🔹 Obtener datos del ticket actual
        $ticket = $model->getById($ticketId);
        if (!$ticket) {
            http_response_code(404);
            $response->toJSON(null, "El ticket no existe.", 404);
            return;
        }

        $estadoActual = intval($ticket["basicos"]->estado_id);

        // 🔹 Validación del flujo correcto (no saltarse estados)
        if ($nuevoEstado !== $estadoActual + 1) {
            http_response_code(400);
            $response->toJSON(null, "Flujo inválido: no puede saltarse etapas.", 400);
            return;
        }

        // 🔹 Validar que el ticket tenga técnico asignado (excepto pasar de Pendiente → Asignado)
        if ($estadoActual > 1) {
            $sqlAsig = "
                SELECT 1 FROM asignaciones 
                WHERE ticket_id = $ticketId 
                  AND vigente = 1 
                LIMIT 1
            ";
            $asignado = $model->enlace->ExecuteSQL($sqlAsig);

            if (empty($asignado)) {
                http_response_code(400);
                $response->toJSON(null, "No se puede avanzar el estado: no hay técnico asignado.", 400);
                return;
            }
        }

        // 🔹 Registrar el cambio en historial_estados
        $sqlHist = "
            INSERT INTO historial_estados (ticket_id, estado_id, usuario_id, fecha, observaciones)
            VALUES ($ticketId, $nuevoEstado, $usuarioId, NOW(), '" . addslashes($observaciones) . "')
        ";
        $historialId = $model->enlace->executeSQL_DML_last($sqlHist);

        // 🔹 Procesar imagen (si existe)
        // 🔹 Procesar imágenes (si existen)
if (!empty($_FILES['imagenes']['name'])) {
    $uploadDir = "../uploads/estados/";

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $names = $_FILES['imagenes']['name'];
    $tmp   = $_FILES['imagenes']['tmp_name'];

    // Normalizar en caso de un solo archivo
    if (!is_array($names)) {
        $names = [$names];
        $tmp   = [$tmp];
    }

    foreach ($names as $idx => $nombreOriginal) {
        if (!$nombreOriginal) continue;

        // Limpia el nombre de caracteres raros
        $nombreArchivo = time() . "_" . preg_replace('/[^A-Za-z0-9._-]/', '_', $nombreOriginal);
        $rutaDestino   = $uploadDir . $nombreArchivo;

        if (move_uploaded_file($tmp[$idx], $rutaDestino)) {
            $rutaRel = "uploads/estados/" . $nombreArchivo;

            $sqlImg = "
                INSERT INTO imagenes_estado (historial_id, ruta, descripcion)
                VALUES ($historialId, '$rutaRel', 'Evidencia del cambio de estado')
            ";
            $model->enlace->executeSQL_DML($sqlImg);
        }
    }
}


        $sqlUpdate = "
            UPDATE tickets
            SET estado_id = $nuevoEstado,
                actualizado_en = NOW()
            WHERE id = $ticketId
        ";
        $model->enlace->executeSQL_DML($sqlUpdate);

     
        $response->toJSON([
            "success" => true,
            "ticket_id" => $ticketId,
            "historial_id" => $historialId
        ], "Estado actualizado correctamente.", 200);

    } catch (Throwable $e) {
        http_response_code(500);
        $response->toJSON(null, "Error inesperado: " . $e->getMessage(), 500);
        handleException($e);
    }
}


   public function create()
{
    $response = new Response();

    try {
        $request = new Request();
        $data = $request->getJSON();

        //  Convertir el objeto stdClass a un arreglo asociativo
        $dataArray = json_decode(json_encode($data), true);

        // Instanciar el modelo y llamar al método create
        $model = new TicketModel();
        $result = $model->create($dataArray);

        // Enviar respuesta
        if ($result["success"]) {
            $response->toJSON($result, $result["message"], 200);
        } else {
            $response->toJSON($result, $result["message"], 400);
        }

    } catch (Throwable $e) {
        $response->toJSON(null, "Error en el servidor: " . $e->getMessage(), 500);
        handleException($e);
    }
}

}