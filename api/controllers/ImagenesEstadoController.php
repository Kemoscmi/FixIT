<?php
require_once "../models/ImagenesEstadoModel.php";
require_once "../lib/Response.php";

class ImagenesEstadoController
{
    // POST -> /ImagenesEstado/upload
    public function upload()
    {
        $response = new Response();

        try {
            if (!isset($_POST['historial_id'])) {
                http_response_code(400);
                $response->toJSON(null, "Falta el parámetro historial_id", 400);
                return;
            }

            $historial_id = intval($_POST['historial_id']);
            $uploadDir = "../../uploads/estados/";

            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            if (empty($_FILES['imagenes']['name'][0])) {
                http_response_code(400);
                $response->toJSON(null, "No se enviaron archivos", 400);
                return;
            }

            $model = new ImagenesEstadoModel();
            $rutasGuardadas = [];

            foreach ($_FILES['imagenes']['tmp_name'] as $i => $tmpName) {
                $nombreArchivo = basename($_FILES['imagenes']['name'][$i]);
                $nombreSeguro = time() . "_" . preg_replace('/[^A-Za-z0-9._-]/', '_', $nombreArchivo);
                $rutaDestino = $uploadDir . $nombreSeguro;
                $rutaDB = "uploads/estados/" . $nombreSeguro;

                if (move_uploaded_file($tmpName, $rutaDestino)) {
                    $model->insertarImagen($historial_id, $rutaDB, "Evidencia del cambio de estado");
                    $rutasGuardadas[] = $rutaDB;
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
