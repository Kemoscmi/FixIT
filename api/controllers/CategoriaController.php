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

            $model = new CategoriaModel();
            $result = $model->create($data);

            $response->toJSON($result, "Categoría creada correctamente", 201);

        } catch (Throwable $e) {
            handleException($e);
            $response->toJSON(null, "Error al crear categoría", 500);
        }
    }


    /* ============================
       PUT /categoria/{id}
       ============================ */
    public function update($id)
    {
        $response = new Response();

        try {
            $data = json_decode(file_get_contents("php://input"), true);

            $model = new CategoriaModel();
            $result = $model->update($id, $data);

            $response->toJSON($result, "Categoría actualizada correctamente", 200);

        } catch (Throwable $e) {
            handleException($e);
            $response->toJSON(null, "Error al actualizar categoría", 500);
        }
    }
}
?>
