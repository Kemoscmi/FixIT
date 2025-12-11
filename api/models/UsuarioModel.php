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

    // En UsuarioModel.php
public function getById($id)
{
    $vSql = "SELECT u.*, r.nombre AS rol
             FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id
             WHERE u.id = '$id' AND u.activo = 1";
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

  // Crear un nuevo usuario
   public function create($data)
{
    // Validación de correo único
    $sqlCheck = "SELECT * FROM usuarios WHERE correo = '{$data->correo}'";
    $result = $this->enlace->ExecuteSQL($sqlCheck);
    
    if (is_array($result) && count($result) > 0) {
        return ["success" => false, "message" => "El correo ya está registrado"];
    }

    // Encriptar la contraseña
    $contrasenaHash = password_hash($data->contrasena, PASSWORD_BCRYPT);

    // Insertar el nuevo usuario con la contraseña encriptada
    $sql = "INSERT INTO usuarios (nombre, apellido, correo, telefono, contrasena_hash, rol_id, activo)
            VALUES ('$data->nombre', '$data->apellido', '$data->correo', '$data->telefono', '$contrasenaHash', $data->rol_id, 1)";
    
    // Ejecutamos la consulta de inserción
    $this->enlace->ExecuteSQL_DML($sql);

    return ["success" => true, "message" => "Usuario creado correctamente"];
}

public function checkEmail($correo)
{
    // Asegúrate de que la consulta esté correctamente construida y se ejecute correctamente
    $vSql = "SELECT id FROM usuarios WHERE correo = '$correo' AND activo = 1";
    $result = $this->enlace->ExecuteSQL($vSql);
    
    // Verifica si el resultado tiene al menos un registro
    if (is_array($result) && count($result) > 0) {
        return ["success" => false, "message" => "El correo ya está registrado"];
    } else {
        return ["success" => true, "message" => "El correo está disponible"];
    }
}



public function update($id, $data)
{
    // Actualizar usuario sin modificar la contraseña
    $sql = "UPDATE usuarios SET
                nombre = '{$data->nombre}',
                apellido = '{$data->apellido}',
                correo = '{$data->correo}',
                telefono = '{$data->telefono}',
                rol_id = {$data->rol_id}
            WHERE id = $id";
    $this->enlace->ExecuteSQL_DML($sql);

    return ["success" => true, "message" => "Usuario actualizado correctamente"];
}



// Guardar token de restablecimiento
public function saveResetToken($correo, $token) {
    $sql = "UPDATE usuarios SET reset_token = '$token' WHERE correo = '$correo'";
    $this->enlace->ExecuteSQL_DML($sql);
}




// Obtener usuario por token
public function getByToken($token) {
    $vSql = "SELECT * FROM usuarios WHERE reset_token = '$token'";
    return $this->enlace->ExecuteSQL($vSql);
}

// Actualizar la contraseña
public function updatePassword($correo, $contrasenaHash) {
    $sql = "UPDATE usuarios SET contrasena_hash = '$contrasenaHash' WHERE correo = '$correo'";
    $this->enlace->ExecuteSQL_DML($sql);
}

// Limpiar el token
public function clearResetToken($correo) {
    $sql = "UPDATE usuarios SET reset_token = NULL WHERE correo = '$correo'";
    $this->enlace->ExecuteSQL_DML($sql);
}

   
}