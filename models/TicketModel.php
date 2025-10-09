<?php
class TicketModel
{
    private $db;

    public function __construct()
    {
        $this->db = new MySqlConnect();
    }

    public function all()
    {
        $sql = "SELECT t.id, t.titulo, t.descripcion, t.fecha_creacion,
                       e.nombre AS estado, c.nombre AS categoria, 
                       u.nombre AS cliente
                FROM tickets t
                INNER JOIN estados_ticket e ON e.id = t.estado_id
                INNER JOIN categorias c ON c.id = t.categoria_id
                INNER JOIN usuarios u ON u.id = t.usuario_solicitante_id
                ORDER BY t.fecha_creacion DESC;";
        return $this->db->executeSQL($sql);
    }

    public function get($id)
    {
        $sql = "SELECT * FROM tickets WHERE id = $id;";
        $result = $this->db->executeSQL($sql);
        return $result ? $result[0] : null;
    }

    public function create($data)
    {
        $titulo = $data->titulo;
        $descripcion = $data->descripcion;
        $categoria_id = $data->categoria_id;
        $usuario_id = $data->usuario_solicitante_id;
        $prioridad_id = $data->prioridad_id;
        $estado_id = 1; // pendiente

        $sql = "INSERT INTO tickets (titulo, descripcion, fecha_creacion, categoria_id, usuario_solicitante_id, prioridad_id, estado_id)
                VALUES ('$titulo', '$descripcion', NOW(), $categoria_id, $usuario_id, $prioridad_id, $estado_id);";
        return $this->db->executeSQL_DML_last($sql);
    }

    public function updateEstado($id, $estado_id, $usuario_id, $obs)
    {
        $sql = "UPDATE tickets SET estado_id = $estado_id, actualizado_en = NOW() WHERE id = $id;";
        $this->db->executeSQL_DML($sql);

        $sqlH = "INSERT INTO historial_estado (ticket_id, estado_id, fecha, usuario_id, observaciones)
                 VALUES ($id, $estado_id, NOW(), $usuario_id, '$obs');";
        return $this->db->executeSQL_DML_last($sqlH);
    }
}
