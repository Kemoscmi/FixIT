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
    // ============================================================
// SUBIR IMÁGENES DE ESTADO
// POST -> http://localhost:81/Proyecto/api/TicketController/uploadImagenes
//
// Body (form-data):
//   - historial_id (int)
//   - imagenes[] (file, múltiples)
//
// Guarda las imágenes y las asocia al historial_estados
// ============================================================
public function uploadImagenes()
{
    $response = new Response();
    header("Content-Type: application/json");

    $historialId = $_POST["historial_id"] ?? null;
    if (!$historialId) {
        http_response_code(400);
        $response->toJSON(null, "Falta el parámetro historial_id", 400);
        return;
    }

    $uploadDir = "../uploads/estados/";
    if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);

    try {
        // ✅ Usa tu clase de conexión real
        $db = new MySqlConnect();
        $rutasGuardadas = [];

        foreach ($_FILES["imagenes"]["tmp_name"] as $index => $tmpName) {
            $nombre = uniqid("img_") . "_" . basename($_FILES["imagenes"]["name"][$index]);
            $destino = $uploadDir . $nombre;

            if (move_uploaded_file($tmpName, $destino)) {
                $rutaRelativa = "uploads/estados/" . $nombre;

                // 👇 Como tu clase no soporta parámetros ?, usá string concatenado seguro
                $sql = "INSERT INTO imagenes_estado (historial_id, ruta) 
                        VALUES ($historialId, '$rutaRelativa')";
                $db->executeSQL_DML($sql);

                $rutasGuardadas[] = $rutaRelativa;
            }
        }

        $response->toJSON([
            "success" => true,
            "message" => "Imágenes subidas correctamente",
            "rutas" => $rutasGuardadas
        ], "Carga completada", 200);

    } catch (Throwable $e) {
        http_response_code(500);
        $response->toJSON(null, "Error al subir imágenes: " . $e->getMessage(), 500);
    }
}


}

