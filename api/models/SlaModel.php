<?php
class SlaModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    // Obtener todos los SLA
    public function all()
    {
        $sql = "SELECT id, nombre, tiempo_max_respuesta_min, tiempo_max_resolucion_min 
                FROM sla 
                WHERE activo = 1
                ORDER BY id";

        return $this->enlace->ExecuteSQL($sql);
    }

    // Obtener un SLA por ID
    public function get($id)
    {
        $sql = "SELECT id, nombre, tiempo_max_respuesta_min, tiempo_max_resolucion_min 
                FROM sla 
                WHERE id = $id AND activo = 1";

        $result = $this->enlace->ExecuteSQL($sql);
        return $result ? $result[0] : null;
    }

    public function create($data)
{
    $nombre = $data["nombre"];
    $resp = $data["tiempo_max_respuesta_min"];
    $reso = $data["tiempo_max_resolucion_min"];

    $sql = "INSERT INTO sla (nombre, tiempo_max_respuesta_min, tiempo_max_resolucion_min, activo)
            VALUES ('$nombre', $resp, $reso, 1)";

    $newId = $this->enlace->executeSQL_DML_last($sql);
    return $newId;
}

}
