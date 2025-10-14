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

    public function login()
    {
        $request = new Request();
        $data = $request->getJSON();
        $model = new UsuarioModel();
        $response = new Response();

        $user = $model->login($data->correo);
        if (!$user) {
            return $response->toJSON(null, "Usuario no encontrado");
        }

        $user = $user[0];
        if (!password_verify($data->contrasena, $user->contrasena_hash)) {
            return $response->toJSON(null, "Contraseña incorrecta");
        }

        $payload = [
            'id' => $user->id,
            'correo' => $user->correo,
            'rol' => ['name' => $user->rol],
            'iat' => time(),
            'exp' => time() + (60 * 60 * 4) // 4 horas
        ];
        $jwt = JWT::encode($payload, Config::get('SECRET_KEY'), 'HS256');

        $result = [
            'token' => $jwt,
            'usuario' => $user
        ];
        $response->toJSON($result, "Inicio de sesión exitoso");
    }
}
