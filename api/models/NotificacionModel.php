<?php
class NotificacionModel
{
    private $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /* Crear una nueva notificación */
    public function create($data)
    {
        $tipo = $data["tipo"];
        $mensaje = $data["mensaje"];
        $destinatario = $data["destinatario_id"];
        $remitente = $data["remitente_id"] ?? "NULL";
        $referencia = $data["referencia_ticket"] ?? "NULL";

        $sql = "
            INSERT INTO notificaciones (tipo, referencia_ticket, remitente_id, destinatario_id, mensaje, estado, fecha)
            VALUES (
                '$tipo',
                $referencia,
                $remitente,
                $destinatario,
                '{$mensaje}',
                'no_leida',
                NOW()
            )
        ";

        return $this->enlace->executeSQL_DML_last($sql);
    }

    /* Listar notificaciones de un usuario */
    public function getByUser($userId)
    {
        $sql = "
            SELECT 
                n.id,
                n.tipo,
                n.mensaje,
                n.referencia_ticket,
                n.estado,
                n.fecha,
                u.nombre AS remitente_nombre
            FROM notificaciones n
            LEFT JOIN usuarios u ON u.id = n.remitente_id
            WHERE n.destinatario_id = $userId
            ORDER BY n.fecha DESC
        ";

        return $this->enlace->ExecuteSQL($sql);
    }

    public function marcarTodas($usuarioId)
{
    $sql = "
        UPDATE notificaciones 
        SET estado = 'leida'
        WHERE destinatario_id = $usuarioId
          AND estado = 'no_leida'
    ";

    return $this->enlace->executeSQL_DML($sql);
}

public function marcarUna($notifId, $usuarioId)
{
    $sql = "
        UPDATE notificaciones
        SET estado = 'leida'
        WHERE id = $notifId
          AND destinatario_id = $usuarioId
        LIMIT 1
    ";

    return $this->enlace->executeSQL_DML($sql);
}

}
?>
