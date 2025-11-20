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
}
