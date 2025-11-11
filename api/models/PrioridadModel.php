<?php
class PrioridadModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function getAll()
    {
        $sql = "SELECT id, nombre FROM prioridades ORDER BY id";
        return $this->enlace->ExecuteSQL($sql) ?: [];
    }
}
