<?php
class ticket
{
    public function index()
    {
        $model = new TicketModel();
        $response = new Response();
        $result = $model->all();
        $response->toJSON($result);
    }

    public function get($id)
    {
        $model = new TicketModel();
        $response = new Response();
        $result = $model->get($id);
        $response->toJSON($result);
    }

    public function create()
    {
        $request = new Request();
        $data = $request->getJSON();
        $model = new TicketModel();
        $response = new Response();

        $id = $model->create($data);
        $response->toJSON(['id_ticket' => $id], "Ticket creado correctamente");
    }

    public function updateEstado($id)
    {
        $request = new Request();
        $data = $request->getJSON();
        $model = new TicketModel();
        $response = new Response();

        $res = $model->updateEstado($id, $data->estado_id, $data->usuario_id, $data->observaciones);
        $response->toJSON(['historial_id' => $res], "Estado actualizado");
    }
}
