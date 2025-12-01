<?php
class Tecnico
{

    // Prueba en post ===== http://localhost:81/Proyecto/api/tecnico
    // Listar todos los técnicos
    public function index()
    {
        try {
            $response = new Response();
            $model = new TecnicoModel();  // Instanciamos el modelo de Técnicos
            $result = $model->all();  // Obtenemos todos los técnicos
            
            $response->toJSON($result);  // Respondemos con los datos obtenidos
        } catch (Exception $e) {
            $response->toJSON(null, "Error al obtener técnicos", 500);  // Respuesta en caso de error
            handleException($e);
        }
    }


    // PRueba en poooost ===== http://localhost:81/Proyecto/api/tecnico/{id}
    // Obtener un técnico por ID
    public function get($param)
    {
        try {
        $response = new Response();
        $model = new TecnicoModel();  // Instanciamos el modelo de Técnicos

        // Obtenemos el técnico por ID
        $result = $model->get($param);

        // Si no se encuentra el técnico, devolvemos "Técnico no encontrado"
        if ($result === null) {
            $response->toJSON(null, "Técnico no encontrado", 404);  // Respuesta de técnico no encontrado
            return;
        }

        // Si si encuentra el técnico, respondemos con los datos
        $response->toJSON($result);

    } catch (Exception $e) {
        $response->toJSON(null, "Error al obtener el técnico", 500);  // Respuesta en caso de error
        handleException($e);
    }
    }  


    // POST: Crear técnico
    public function create()
    {
        try {
            $response = new Response();
            $data = json_decode(file_get_contents("php://input"), true);
            $model = new TecnicoModel();

            $result = $model->create($data);
            $response->toJSON($result, "Técnico creado correctamente", 201);
        } catch (Exception $e) {
            $response->toJSON(null, "Error al crear técnico", 500);
            handleException($e);
        }
    }

    // PUT: Actualizar técnico
   public function update($id)
{
    $response = new Response();
    $data = json_decode(file_get_contents("php://input"), true);
    $model = new TecnicoModel();

    $result = $model->update($id, $data);
    $response->toJSON($result, "Técnico actualizado correctamente");
}

}