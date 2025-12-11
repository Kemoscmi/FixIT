<?php
class Valoracion
{
  public function index()
    {
        try {
            $response = new Response();
            header('Content-Type: application/json; charset=utf-8');

            // Obtener los parámetros de la URL (query string)
            $rolId  = isset($_GET['rol_id'])  ? intval($_GET['rol_id'])  : 0;
            $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

            // Validación de parámetros
            if (!$rolId || !$userId) {
                http_response_code(400); // Bad Request
                $response->toJSON(null, "Faltan parámetros rol_id y user_id", 400);
                return;
            }

            // Instanciamos el modelo
            $model = new ValoracionModel();

            // Utilizamos listByRole para todos los roles (Admin, Técnico, Cliente)
            $data = $model->listByRole($userId, $rolId);

            // Devolvemos los datos obtenidos
            $response->toJSON($data, "Listado de valoraciones");
        } catch (Exception $e) {
            http_response_code(500); // Error interno del servidor
            $response->toJSON(null, "Error al obtener valoraciones", 500);
            handleException($e);
        } catch (\Throwable $e) {
            http_response_code(500); // Error inesperado
            $response->toJSON(null, "Error inesperado", 500);
            handleException($e);
        }
    }

   public function get($id)
{
    try {
        $response = new Response();
        header('Content-Type: application/json; charset=utf-8');

        // Obtener los parámetros de la URL (query string)
        $rolId  = isset($_GET['rol_id'])  ? intval($_GET['rol_id'])  : 0;
        $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

        // Validación de parámetros
        if (!$rolId || !$userId || !$id) {
            http_response_code(400); // Bad Request
            $response->toJSON(null, "Faltan parámetros: rol_id, user_id o valoracion id", 400);
            return;
        }

        // Instanciamos el modelo
        $model = new ValoracionModel();

        // Validación de permisos según el rol
        $authorized = false;
        if ($rolId === 1) {
            $authorized = true; // Admin puede ver todas las valoraciones
        } elseif ($rolId === 2) {
            $authorized = true; // Técnico puede ver valoraciones de sus tickets asignados
        } elseif ($rolId === 3) {
            $authorized = true; // Cliente puede ver sus propias valoraciones
        } else {
            http_response_code(400); // Bad Request
            $response->toJSON(null, "rol_id inválido", 400);
            return;
        }

        // Si no está autorizado, respondemos con error 403
        if (!$authorized) {
            http_response_code(403);
            $response->toJSON(null, "Acceso denegado", 403);
            return;
        }

        // Obtenemos la valoración por ID
        $data = $model->get($id);

        // Si no existe la valoración, respondemos con error 404
        if (!$data) {
            http_response_code(404);
            $response->toJSON(null, "Valoración no encontrada", 404);
            return;
        }

        // Devolvemos el detalle de la valoración
        $response->toJSON($data, "Detalle de valoración");
    } catch (Exception $e) {
        http_response_code(500);
        $response->toJSON(null, "Error al obtener la valoración", 500);
        handleException($e);
    } catch (\Throwable $e) {
        http_response_code(500);
        $response->toJSON(null, "Error inesperado", 500);
        handleException($e);
    }
}

    // Crear valoración (POST)
    public function create()
    {
        try {
            $response = new Response();
            header('Content-Type: application/json; charset=utf-8');

            // Recibimos los datos del formulario
            $data = json_decode(file_get_contents("php://input"), true);

            // Instanciamos el modelo de valoraciones
            $model = new ValoracionModel();

            // Llamamos al método para crear la valoración
            $result = $model->create($data);

            // Respondemos con el resultado
            $response->toJSON($result, "Valoración registrada correctamente", 201);
        } catch (Exception $e) {
            $response->toJSON(null, "Error al registrar valoración", 500);
            handleException($e);
        }
    }

    // Actualizar valoración (PUT)
    public function update($id)
    {
        try {
            $response = new Response();
            header('Content-Type: application/json; charset=utf-8');

            // Recibimos los datos del formulario
            $data = json_decode(file_get_contents("php://input"), true);

            // Instanciamos el modelo de valoraciones
            $model = new ValoracionModel();

            // Llamamos al método para actualizar la valoración
            $result = $model->update($id, $data);

            // Respondemos con el resultado
            $response->toJSON($result, "Valoración actualizada correctamente");
        } catch (Exception $e) {
            $response->toJSON(null, "Error al actualizar valoración", 500);
            handleException($e);
        }
    }

    // Eliminar valoración (DELETE)
    public function delete($id)
    {
        try {
            $response = new Response();
            header('Content-Type: application/json; charset=utf-8');

            // Instanciamos el modelo de valoraciones
            $model = new ValoracionModel();

            // Llamamos al método para eliminar la valoración
            $result = $model->delete($id);

            // Respondemos con el resultado
            $response->toJSON($result, "Valoración eliminada correctamente");
        } catch (Exception $e) {
            $response->toJSON(null, "Error al eliminar valoración", 500);
            handleException($e);
        }
    }

    
}
