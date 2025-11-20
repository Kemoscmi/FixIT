<?php
class Sla
{
    public function index()
    {
        try {
            $response = new Response();
            $model = new SlaModel();
            $result = $model->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON(null, "Error al obtener SLA", 500);
            handleException($e);
        }
    }

    // GET /api/sla/{id}
    public function get($id)
    {
        try {
            $response = new Response();
            $model = new SlaModel();
            $result = $model->get($id);

            if (!$result) {
                $response->toJSON(null, "SLA no encontrado", 404);
                return;
            }

            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON(null, "Error al obtener SLA", 500);
            handleException($e);
        }
    }

    public function create()
{
    try {
        $response = new Response();
        $model = new SlaModel();

        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            $response->toJSON(null, "Datos inválidos", 400);
            return;
        }

        $id = $model->create($data);
        $response->toJSON(["id" => $id], "SLA creado correctamente");
    } catch (Exception $e) {
        $response->toJSON(null, "Error al crear SLA", 500);
        handleException($e);
    }
}

}
