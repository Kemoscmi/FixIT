<?php
require_once "../database/MySqlConnect.php";

class ImagenesEstadoModel
{
    private $db;

    public function __construct()
    {
        $this->db = new MySqlConnect();
    }

    public function insertarImagen($historial_id, $ruta, $descripcion)
    {
        $sql = "INSERT INTO imagenes_estado (historial_id, ruta, descripcion)
                VALUES ($historial_id, '$ruta', '$descripcion')";
        return $this->db->executeSQL_DML($sql);
    }
}
