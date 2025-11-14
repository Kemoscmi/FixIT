<?php
class Especialidad 
{
    public function index()
    {
        try {
            $response = new Response();
            $model = new EspecialidadModel();
            $result = $model->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON(null, "Error al obtener especialidades", 500);
            handleException($e);
        }
    }
}
