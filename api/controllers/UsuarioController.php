<?php
use Firebase\JWT\JWT;

class usuario
{
    public function index()
    {
        $model = new UsuarioModel();
        $response = new Response();
        $result = $model->all();
        $response->toJSON($result);
    }

    // En UsuarioController.php
public function get($id)
{
    $model = new UsuarioModel();
    $response = new Response();
    
    $user = $model->getById($id);

    $response->toJSON($user[0], "Usuario encontrado");
}


    // POST /usuario/login
    public function login()
    {
        $request = new Request();
        $data = $request->getJSON();
        $model = new UsuarioModel();
        $response = new Response();

        $user = $model->login($data->correo);

        if (!$user || count($user) === 0) {
            return $response->toJSON(null, "Usuario no encontrado");
        }

        $user = $user[0];

        // VALIDAR CONTRASEÑA
        if ($data->contrasena !== $user->contrasena_hash) {
            return $response->toJSON(null, "Contraseña incorrecta");
        }

        // CREAR JWT
        $payload = [
            'id' => $user->id,
            'correo' => $user->correo,
            'rol' => ['name' => $user->rol],
            'iat' => time(),
            'exp' => time() + (60 * 60 * 4)
        ];

        $jwt = JWT::encode($payload, Config::get('SECRET_KEY'), 'HS256');

        $result = [
            'token' => $jwt,
            'usuario' => [
                'id' => $user->id,
                'nombre' => $user->nombre,
                'apellido' => $user->apellido,
                'correo' => $user->correo,
                'rol' => $user->rol
            ]
        ];

        // ==========================================================
        // CREAR NOTIFICACIÓN DE INICIO DE SESIÓN
        // ==========================================================
        require_once "models/NotificacionModel.php";
        $notiModel = new NotificacionModel();

        $mensaje = "El usuario {$user->nombre} inició sesión";
        
        $notiModel->create([
            "tipo" => "login",
            "mensaje" => $mensaje,
            "destinatario_id" => $user->id, 
            "remitente_id" => $user->id,
            "referencia_ticket" => "NULL"
        ]);

        $response->toJSON($result, "Inicio de sesión exitoso");
    }

    // Crear usuario
    public function create()
    {
        $data = json_decode(file_get_contents("php://input"));
        $model = new UsuarioModel();

        // Crear el usuario
        $result = $model->create($data);

        if ($result['success']) {
            echo json_encode(['message' => $result['message']], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['error' => $result['message']], JSON_UNESCAPED_UNICODE);
        }
    }

    public function checkEmail()
{
    $request = new Request();
    $data = $request->getJSON();
    $model = new UsuarioModel();
    $response = new Response();

    // Verifica si el correo ya existe
    $result = $model->checkEmail($data->correo);

    if ($result['success']) {
        $response->toJSON($result, "Correo disponible");
    } else {
        $response->toJSON($result, "Correo ya registrado");
    }
}

    // UsuarioController.php
public function update($id)
{
    $data = json_decode(file_get_contents("php://input"));
    $model = new UsuarioModel();

    // Actualizar usuario
    $result = $model->update($id, $data);

    echo json_encode(['message' => $result['message']], JSON_UNESCAPED_UNICODE);
}







// Ruta para solicitar el restablecimiento de contraseña
public function requestPasswordReset() {
    $request = new Request();
    $data = $request->getJSON();
    $response = new Response();

    $correo = $data->correo;
    $model = new UsuarioModel();

    // Verificar si el correo está registrado
    $user = $model->login($correo);
    if (!$user) {
        return $response->toJSON(null, "Correo no registrado");
    }

    // Generar un token único
    $token = bin2hex(random_bytes(50));

    // Guardar el token en la base de datos asociado al correo
    $model->saveResetToken($correo, $token);

    // Enviar el correo con el enlace para restablecer la contraseña
    $link = "https://tu-dominio.com/reset-password?token=" . $token;
    mail($correo, "Restablecer Contraseña", "Haz clic en el siguiente enlace para restablecer tu contraseña: $link");

    return $response->toJSON(null, "Enlace de restablecimiento de contraseña enviado");
}



// Ruta para restablecer la contraseña
public function resetPassword() {
    $request = new Request();
    $data = $request->getJSON();
    $response = new Response();

    $token = $data->token;
    $nuevaContrasena = $data->contrasena;

    $model = new UsuarioModel();

    // Verificar si el token es válido
    $user = $model->getByToken($token); // Método para obtener el usuario por el token

    if (!$user) {
        return $response->toJSON(null, "Token inválido o expirado");
    }

    // Encriptar la nueva contraseña
    $contrasenaHash = password_hash($nuevaContrasena, PASSWORD_BCRYPT);

    // Actualizar la contraseña
    $model->updatePassword($user->correo, $contrasenaHash);

    // Limpiar el token después de usarlo
    $model->clearResetToken($user->correo);

    return $response->toJSON(null, "Contraseña restablecida correctamente");
}

    
}
