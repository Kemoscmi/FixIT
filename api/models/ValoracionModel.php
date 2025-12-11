<?php
class ValoracionModel
{
    public $enlace;

    public function __construct()
    {
        // Se crea una conexión utilizando MySqlConnect
        $this->enlace = new MySqlConnect();
    }

    // Listar todas las valoraciones (como en el caso de listAdmin)
    public function listAll()
    {
        // Aquí puedes usar una consulta SQL para obtener todas las valoraciones
        $vSql = "SELECT v.id, v.ticket_id, v.cliente_id, v.puntaje, v.comentario, v.fecha, t.titulo AS ticket_titulo, u.nombre AS cliente_nombre
                 FROM valoraciones v
                 JOIN tickets t ON v.ticket_id = t.id
                 JOIN usuarios u ON v.cliente_id = u.id";
        return $this->enlace->ExecuteSQL($vSql) ?: [];
    }

public function listByRole(int $userId, int $roleId)
{
    if ($roleId == 1) { // Admin
        // Consulta para admin, todas las valoraciones
        $sql = "SELECT v.id, v.ticket_id, v.cliente_id, v.puntaje, v.comentario, v.fecha, 
                t.titulo AS ticket_titulo, u.nombre AS cliente_nombre
                FROM valoraciones v
                JOIN tickets t ON v.ticket_id = t.id
                JOIN usuarios u ON v.cliente_id = u.id";
    } elseif ($roleId == 2) { // Técnico
        // Consulta para técnico, filtra por las asignaciones del técnico
        $sql = "SELECT v.id, v.ticket_id, v.cliente_id, v.puntaje, v.comentario, v.fecha, 
                t.titulo AS ticket_titulo, u.nombre AS cliente_nombre
                FROM valoraciones v
                JOIN tickets t ON v.ticket_id = t.id
                JOIN usuarios u ON v.cliente_id = u.id
                JOIN asignaciones a ON a.ticket_id = v.ticket_id
                WHERE a.tecnico_id = $userId";
    } elseif ($roleId == 3) { // Cliente
        // Consulta para cliente, filtra por las valoraciones de ese cliente
        $sql = "SELECT v.id, v.ticket_id, v.cliente_id, v.puntaje, v.comentario, v.fecha, 
                t.titulo AS ticket_titulo, u.nombre AS cliente_nombre
                FROM valoraciones v
                JOIN tickets t ON v.ticket_id = t.id
                JOIN usuarios u ON v.cliente_id = u.id
                WHERE v.cliente_id = $userId"; // Filtra por el ID del cliente
    }

    return $this->enlace->ExecuteSQL($sql) ?: [];
}

public function get(int $id)
{
    $vSql = "SELECT v.id, v.ticket_id, v.cliente_id, v.puntaje, v.comentario, v.fecha, t.titulo AS ticket_titulo, u.nombre AS cliente_nombre
             FROM valoraciones v
             JOIN tickets t ON v.ticket_id = t.id
             JOIN usuarios u ON v.cliente_id = u.id
             WHERE v.id = $id"; // Aquí se busca la valoración por ID

    $result = $this->enlace->ExecuteSQL($vSql);
    return $result ? $result[0] : null; // Retorna la valoración si existe, o null si no la encuentra
}

    // Obtener una valoración por ID
    public function getById(int $id)
    {
        $vSql = "SELECT v.id, v.ticket_id, v.cliente_id, v.puntaje, v.comentario, v.fecha, t.titulo AS ticket_titulo, u.nombre AS cliente_nombre
                 FROM valoraciones v
                 JOIN tickets t ON v.ticket_id = t.id
                 JOIN usuarios u ON v.cliente_id = u.id
                 WHERE v.id = $id";
        $result = $this->enlace->ExecuteSQL($vSql);
        return $result ? $result[0] : null;
    }

    // Crear una valoración
    public function create($data)
    {

         try {
        // Verificamos que los datos necesarios estén presentes
        if (empty($data['ticket_id']) || empty($data['cliente_id']) || empty($data['puntaje'])) {
            throw new Exception("Faltan datos requeridos para crear la valoración.");
        }

        $sql = "INSERT INTO valoraciones (ticket_id, cliente_id, puntaje, comentario, fecha)
                VALUES (
                    {$data['ticket_id']},
                    {$data['cliente_id']},
                    {$data['puntaje']},
                    '{$data['comentario']}',
                    NOW()
                )";
        $valoracionId = $this->enlace->executeSQL_DML_last($sql);
        return ["success" => true, "id" => $valoracionId];
          } catch (Exception $e) {
        // Manejo de errores: si hay un problema con la consulta o los datos
        throw new Exception("Error al registrar la valoración: " . $e->getMessage());
    }
    }

    // Actualizar una valoración
    public function update(int $id, $data)
    {
        $sql = "UPDATE valoraciones SET
                    puntaje = {$data['puntaje']},
                    comentario = '{$data['comentario']}',
                    fecha = NOW()
                WHERE id = $id";
        $this->enlace->executeSQL_DML($sql);
        return ["success" => true];
    }

    // Eliminar una valoración
    public function delete(int $id)
    {
        $sql = "DELETE FROM valoraciones WHERE id = $id";
        $this->enlace->executeSQL_DML($sql);
        return ["success" => true];
    }

    
}
