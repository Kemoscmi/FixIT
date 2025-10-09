<?php
class UsuarioModel
{
    private $db;

    public function __construct()
    {
        $this->db = new MySqlConnect();
    }

    public function all()
    {
        $sql = "SELECT u.id, u.nombre, u.correo, u.rol_id, r.nombre AS rol
                FROM usuarios u
                INNER JOIN roles r ON u.rol_id = r.id
                WHERE u.activo = 1;";
        return $this->db->executeSQL($sql);
    }

    public function get($id)
    {
        $sql = "SELECT id, nombre, correo, telefono, rol_id
                FROM usuarios WHERE id = $id;";
        $result = $this->db->executeSQL($sql);
        return $result ? $result[0] : null;
    }

    public function create($data)
    {
        $nombre = $data->nombre;
        $correo = $data->correo;
        $telefono = $data->telefono;
        $password = password_hash($data->contrasena, PASSWORD_BCRYPT);
        $rol_id = $data->rol_id;

        $sql = "INSERT INTO usuarios (nombre, correo, telefono, contrasena_hash, rol_id, activo)
                VALUES ('$nombre', '$correo', '$telefono', '$password', $rol_id, 1);";

        return $this->db->executeSQL_DML_last($sql);
    }

    public function login($correo)
    {
        $sql = "SELECT u.*, r.nombre AS rol 
                FROM usuarios u 
                INNER JOIN roles r ON u.rol_id = r.id 
                WHERE correo = '$correo' AND activo = 1;";
        return $this->db->executeSQL($sql);
    }
}
