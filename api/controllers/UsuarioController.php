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
}
