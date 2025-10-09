<?php
class CategoriaModel
{
    private $db;

    public function __construct()
    {
        $this->db = new MySqlConnect();
    }

    public function all()
    {
        $sql = "SELECT c.id, c.nombre, c.descripcion, s.nombre AS sla,
                       s.tiempo_max_respuesta_min, s.tiempo_max_resolucion_min
                FROM categorias c
                INNER JOIN sla s ON c.sla_id = s.id;";
        return $this->db->executeSQL($sql);
    }
}
