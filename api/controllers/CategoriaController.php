<?php
class Categoria
{
    // Prueba en pooost ====  http://localhost:81/Proyecto/api/categoria
    // Listar todas las categorías
    public function index()
    {
        try { 
            $response = new Response();
            $model = new CategoriaModel();  // Instanciamos el modelo de Categorías
            $result = $model->all();  // Obtenemos todas las categorías
            $response->toJSON($result);  // Respondemos con los datos obtenidos
        } catch (Exception $e) {
            $response->toJSON(null, "Error al obtener categorías", 500);  // Respuesta en caso de error
            handleException($e);
        }
    }

    // Prueba en poooos === http://localhost:81/Proyecto/api/categoria/Id
    // Obtener una categoría por ID
    public function get($param)
    {
        try {
            $response = new Response();
            $model = new CategoriaModel();  // Instanciamos el modelo de Categorías
            $result = $model->get($param);  // Obtenemos la categoría por ID
            
            $response->toJSON($result);  // Respondemos con los detalles de la categoría
        } catch (Exception $e) {
            $response->toJSON(null, "Error al obtener la categoría", 500);  // Respuesta en caso de error
            handleException($e);
        }
    }


     public function create()
    {
        $response = new Response();

        try {
            $data = json_decode(file_get_contents("php://input"), true);

            if (!$data) {
                $response->toJSON(null, "Datos inválidos", 400);
                return;
            }

            $categoriaModel = new CategoriaModel();
            $slaModel = new SlaModel();

            // 1. SI VIENE NEW_SLA, primero CREAR EL SLA 
            if (isset($data["new_sla"])) {
                $newSlaData = $data["new_sla"];

                $slaId = $slaModel->create([
                    "nombre" => $newSlaData["nombre"],
                    "tiempo_max_respuesta_min" => $newSlaData["tiempo_max_respuesta_min"],
                    "tiempo_max_resolucion_min" => $newSlaData["tiempo_max_resolucion_min"]
                ]);

                $data["sla_id"] = $slaId; // Forzar el SLA recién creado
                unset($data["new_sla"]);
            }

            // Validar SLA obligatorio
            if (!isset($data["sla_id"]) || empty($data["sla_id"])) {
                $response->toJSON(null, "El SLA es obligatorio", 400);
                return;
            }

            // 2. CREAR LA CATEGORÍA
            $result = $categoriaModel->create($data);

            $response->toJSON($result, "Categoría creada correctamente", 201);

        } catch (Throwable $e) {
            handleException($e);
            $response->toJSON(null, "Error al crear categoría", 500);
        }
    }

    // Editaaaar PUT /api/categoria/{id}
    public function update($id)
    {
        $response = new Response();

        try {
            $data = json_decode(file_get_contents("php://input"), true);

            if (!$data) {
                $response->toJSON(null, "Datos inválidos", 400);
                return;
            }

            $categoriaModel = new CategoriaModel();
            $slaModel = new SlaModel();

            // 1. SI EDITA Y QUIERE CREAR SLA NUEVO
            if (isset($data["new_sla"])) {
                $newSlaData = $data["new_sla"];

                $slaId = $slaModel->create([
                    "nombre" => $newSlaData["nombre"],
                    "tiempo_max_respuesta_min" => $newSlaData["tiempo_max_respuesta_min"],
                    "tiempo_max_resolucion_min" => $newSlaData["tiempo_max_resolucion_min"]
                ]);

                $data["sla_id"] = $slaId;
                unset($data["new_sla"]);
            }

            // SLA requerido
            if (!isset($data["sla_id"]) || empty($data["sla_id"])) {
                $response->toJSON(null, "El SLA es obligatorio", 400);
                return;
            }

            // 2. ACTUALIZAR CATEGORÍA
            $result = $categoriaModel->update($id, $data);

            $response->toJSON($result, "Categoría actualizada correctamente", 200);

        } catch (Throwable $e) {
            handleException($e);
            $response->toJSON(null, "Error al actualizar categoría", 500);
        }
    }
}
?>
