<?php
class EtiquetaController
{
    // Listar todas las etiquetas   endpoints /api/EtiquetaControlle   y este es de caytegoria EtiquetaController/categoria?id=5
    public function index()
    {
        $response = new Response();

        try {
            $model = new EtiquetaModel();
            $data = $model->getAll();

            if (!$data) {
                $response->toJSON(["success" => false, "data" => []], "No hay etiquetas registradas", 404);
                return;
            }

            $response->toJSON(["success" => true, "data" => $data], "Listado de etiquetas", 200);
        } catch (Throwable $e) {
            handleException($e);
            $response->toJSON(["success" => false], "Error al obtener etiquetas", 500);
        }
    }

    // Obtener la categoría asociada a una etiqueta específica
    public function categoria()
    {
        $response = new Response();

        try {
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            if ($id <= 0) {
                http_response_code(400);
                $response->toJSON(null, "El parámetro 'id' es requerido", 400);
                return;
            }

            $model = new EtiquetaModel();
            $data = $model->getCategoriaByEtiqueta($id);

            if ($data) {
                $response->toJSON(["success" => true, "data" => $data], "Categoría asociada", 200);
            } else {
                http_response_code(404);
                $response->toJSON(["success" => false], "No se encontró categoría asociada", 404);
            }
        } catch (Throwable $e) {
            handleException($e);
            $response->toJSON(["success" => false], "Error al obtener categoría", 500);
        }
    }
}
