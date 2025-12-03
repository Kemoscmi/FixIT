<?php
class Notificacion
{
    /* GET /api/notificacion */
    public function index()
    {
        $response = new Response();
        $response->toJSON([], "Debe especificar un usuario ID");
    }

    /* GET /api/notificacion/{usuarioId} */
    public function get($usuarioId)
    {
        $response = new Response();

        try {
            $model = new NotificacionModel();
            $result = $model->getByUser($usuarioId);

            $response->toJSON($result, "Notificaciones obtenidas");
        } catch (Throwable $e) {
            handleException($e);
            $response->toJSON(null, "Error al obtener notificaciones", 500);
        }
    }

    /* POST /api/notificacion */
    public function create()
    {
        $response = new Response();

        try {
            $data = json_decode(file_get_contents("php://input"), true);

            if (!$data) {
                $response->toJSON(null, "Datos inválidos", 400);
                return;
            }

            $model = new NotificacionModel();
            $id = $model->create($data);

            $response->toJSON(["id" => $id], "Notificación creada correctamente", 201);

        } catch (Throwable $e) {
            handleException($e);
            $response->toJSON(null, "Error al crear notificación", 500);
        }
    }

    /* PUT /api/notificacion/{notifId} */
public function update($id = null)
{
    $request = new Request();
    $data = $request->getJSON();
    $model = new NotificacionModel();
    $response = new Response();

    if (empty($data->usuario_actual)) {
        return $response->toJSON(
            ["error" => "usuario_actual requerido"],
            "Error",
            400
        );
    }

    $usuarioActual = intval($data->usuario_actual);

    //Para boton que esta en el panel de marcar todas
    if (!empty($data->marcar_todas)) {
        $ok = $model->marcarTodas($usuarioActual);
        return $response->toJSON(
            ["success" => $ok],
            "Todas las notificaciones marcadas como leídas",
            200
        );
    }

    // Para boton que es unico en cada noti en el panel
    if (!$id) {
        return $response->toJSON(
            ["error" => "ID requerido para marcar una sola notificación"],
            "Error",
            400
        );
    }

    $ok = $model->marcarUna($id, $usuarioActual);

    return $response->toJSON(
        ["success" => $ok],
        "Notificación marcada como leída",
        200
    );
}

}
?>
