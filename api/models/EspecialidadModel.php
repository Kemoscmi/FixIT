<?php
class EspecialidadModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function all()
    {
        $sql = "SELECT id, nombre, descripcion FROM especialidades ORDER BY id";
        return $this->enlace->executeSQL($sql);
    }

}
