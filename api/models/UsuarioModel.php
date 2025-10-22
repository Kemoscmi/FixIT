<?php
class UsuarioModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();  // Conexión a la base de datos
    }

    /* Listar todos los usuarios activos */
    public function all()
    {
        $vSql = "SELECT u.id, u.nombre, u.apellido, u.correo, u.telefono, u.rol_id, r.nombre AS rol
                 FROM usuarios u
                 INNER JOIN roles r ON u.rol_id = r.id
                 WHERE u.activo = 1";
        return $this->enlace->ExecuteSQL($vSql);
    }

    /* Buscar usuario por correo (para login) */
   public function login($correo)
{
    $vSql = "SELECT u.*, r.nombre AS rol
             FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id
             WHERE u.correo = '$correo' AND u.activo = 1";

    $vResultado = $this->enlace->ExecuteSQL($vSql);

    // Forzamos a devolver un array, aunque venga vacío o como stdClass
    if (is_object($vResultado)) {
        $vResultado = [$vResultado];
    } elseif (!is_array($vResultado)) {
        $vResultado = [];
    }

    return $vResultado;
}

    /* Crear un nuevo usuario */
    public function create($data)
    {
        $nombre = $data->nombre;
        $apellido = $data->apellido;
        $correo = $data->correo;
        $telefono = $data->telefono ?? null;
        $rol_id = $data->rol_id ?? 3;
        $password = password_hash($data->contrasena, PASSWORD_BCRYPT);

        $vSql = "INSERT INTO usuarios (nombre, apellido, correo, telefono, contrasena_hash, rol_id, activo)
                 VALUES ('$nombre', '$apellido', '$correo', '$telefono', '$password', $rol_id, 1)";
        return $this->enlace->ExecuteSQL_DML_last($vSql);
    }
}