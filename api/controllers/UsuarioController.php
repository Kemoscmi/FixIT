<?php
use Firebase\JWT\JWT;

class usuario
{
    // GET /usuario
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

        // ==========================================
        //   🔔 CREAR NOTIFICACIÓN DE INICIO DE SESIÓN
        // ==========================================
        try {
            require_once __DIR__ . "/../models/NotificacionModel.php";
            $notifModel = new NotificacionModel();

            $notifModel->create([
                "tipo" => "login",
                "mensaje" => "El usuario {$user->nombre} inició sesión",
                "destinatario_id" => $user->id,
                "remitente_id" => null,
                "referencia_ticket" => null
            ]);

        } catch (Throwable $e) {
            error_log("ERROR creando notificación de login: " . $e->getMessage());
        }

        // ==========================================
        //       🔐 GENERAR TOKEN JWT
        // ==========================================
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

        return $response->toJSON($result, "Inicio de sesión exitoso");
    }
}
