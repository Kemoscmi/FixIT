<?php
class TicketController
{
    // ============================================================
    // PRUEBA EN POSTMAN (LISTADO POR ROL)
    // GET  -> http://localhost:81/Proyecto/api/TicketController?rol_id=1&user_id=1 (Listado Admin)
    // GET  -> http://localhost:81/Proyecto/api/TicketController?rol_id=2&user_id=3 (Listado Técnico (ve sus asignaciones vigentes))
    // GET  -> http://localhost:81/Proyecto/api/TicketController?rol_id=3&user_id=4 (Listado Cliente (ve sus propios tickets))
    //
    // Parámetros (query):
    //   - rol_id  : 1=Administrador | 2=Tecnico | 3=Cliente (obligatorio)
    //   - user_id : ID del usuario (obligatorio)
    //
    // Respuesta: lista de tickets con 4 campos (id, titulo, fecha_creacion, estado)
    // ============================================================
    public function index()
    {
        $response = new Response();
        try {
            header('Content-Type: application/json; charset=utf-8');

            $rolId  = isset($_GET['rol_id'])  ? intval($_GET['rol_id'])  : 0;
            $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

            if (!$rolId || !$userId) {
                http_response_code(400);
                $response->toJSON(null, "Faltan parámetros rol_id y user_id", 400);
                return;
            }

            $model = new TicketModel();
            switch ($rolId) {
                case 1: $data = $model->listAdmin($userId);   break; // Admin ve todo
                case 2: $data = $model->listTecnico($userId); break; // Técnico ve asignados (vigentes)
                case 3: $data = $model->listCliente($userId); break; // Cliente ve los propios
                default:
                    http_response_code(400);
                    $response->toJSON(null, "rol_id inválido (use 1=Administrador, 2=Tecnico, 3=Cliente)", 400);
                    return;
            }

            $response->toJSON($data, "Listado de tickets");
        } catch (Exception $e) {
            http_response_code(500);
            $response->toJSON(null, "Error al obtener tickets", 500);
            handleException($e);
        } catch (\Throwable $e) {
            http_response_code(500);
            $response->toJSON(null, "Error inesperado", 500);
            handleException($e);
        }
    }

    // ============================================================
    // PRUEBA EN POSTMAN (DETALLE DE TICKET)
    // GET  -> http://localhost:81/Proyecto/api/TicketController/1?rol_id=1&user_id=1   (Admin)
    // GET  -> http://localhost:81/Proyecto/api/TicketController/1?rol_id=2&user_id=2   (Técnico asignado vigente)
    // GET  -> http://localhost:81/Proyecto/api/TicketController/1?rol_id=3&user_id=4   (Cliente solicitante)
    //
    // Parámetros (query):
    //   - rol_id  : 1=Administrador | 2=Tecnico | 3=Cliente (obligatorio)
    //   - user_id : ID del usuario (obligatorio)
    // Path:
    //   - {id}    : ID del ticket a consultar (obligatorio)
    //
    // Autorización por rol:
    //   - Admin   : accede a cualquier ticket
    //   - Técnico : solo si el ticket está asignado a él (asignaciones.vigente = 1)
    //   - Cliente : solo si es el solicitante (tickets.usuario_solicitante_id = user_id)
    //
    // Respuesta: detalle completo (básicos, SLA, historial con imágenes, valoración)
    // ============================================================
    public function get($id)
    {
        $response = new Response();
        try {
            header('Content-Type: application/json; charset=utf-8');

            $rolId    = isset($_GET['rol_id'])  ? intval($_GET['rol_id'])  : 0;
            $userId   = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
            $ticketId = intval($id);

            if (!$rolId || !$userId || !$ticketId) {
                http_response_code(400);
                $response->toJSON(null, "Faltan parámetros: rol_id, user_id o ticket id", 400);
                return;
            }

            $model = new TicketModel();

            // --- Autorización por rol ---
            $authorized = false;
            if ($rolId === 1) {                 // Administrador
                $authorized = true;
            } elseif ($rolId === 2) {           // Técnico asignado
                $authorized = $model->assignedToTech($ticketId, $userId);
            } elseif ($rolId === 3) {           // Cliente solicitante
                $authorized = $model->belongsToClient($ticketId, $userId);
            } else {
                http_response_code(400);
                $response->toJSON(null, "rol_id inválido (use 1=Administrador, 2=Tecnico, 3=Cliente)", 400);
                return;
            }

            if (!$authorized) {
                http_response_code(403);
                $response->toJSON(null, "Acceso denegado", 403);
                return;
            }

            $data = $model->getById($ticketId);
            if (!$data) {
                http_response_code(404);
                $response->toJSON(null, "Ticket no encontrado", 404);
                return;
            }

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
}