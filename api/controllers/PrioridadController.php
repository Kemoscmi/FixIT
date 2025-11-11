<?php
class PrioridadController
{

    // este es el endpoint /api/PrioridadController
    public function index()
    {
        $response = new Response();

        try {
            $model = new PrioridadModel();
            $data = $model->getAll();

            if (!$data) {
                $response->toJSON(["success" => false, "data" => []], "No hay prioridades registradas", 404);
                return;
            }

            $response->toJSON(["success" => true, "data" => $data], "Listado de prioridades", 200);
        } catch (Throwable $e) {
            handleException($e);
            $response->toJSON(["success" => false], "Error al obtener prioridades", 500);
        }
    }
}
