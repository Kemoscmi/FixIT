<?php
class TecnicoModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();  // Conexión a la base de datos
    }

    /* Listar todos los técnicos (usuarios con rol_id = 2) */
    public function all()
    {
        $vSql = "SELECT id, nombre, apellido, correo, telefono, disponibilidad, observaciones
                 FROM usuarios
                 WHERE rol_id = 2 AND activo = 1";  // Filtramos los técnicos (rol_id = 2)

        $vResultado = $this->enlace->ExecuteSQL($vSql);  // Ejecutamos la consulta
        return $vResultado;
    }


    /* Obtener un técnico por ID */
    public function get($id)
    {
        // Consulta SQL
        $vSql = "SELECT id, nombre, apellido, correo, telefono, disponibilidad, observaciones, carga_trabajo
             FROM usuarios
             WHERE rol_id = 2 AND id = $id AND activo = 1";  // Filtramos por técnico activo

        // Ejecutamos la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Si no se encuentra ningún técnico, retornamos null
        if (empty($vResultado)) {
            return null;
        }

        // Si se encuentra el técnico, retornamos el primer resultado
        return $vResultado[0];
    }
}
