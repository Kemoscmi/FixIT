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
    // Consulta SQL para obtener la información del técnico
    $vSql = "SELECT id, nombre, apellido, correo, telefono, disponibilidad, observaciones, carga_trabajo
             FROM usuarios
             WHERE rol_id = 2 AND id = $id AND activo = 1";  // Filtramos por técnico activo

    // Ejecutamos la consulta
    $vResultado = $this->enlace->ExecuteSQL($vSql);
 
    // Convertir el objeto a un array
    // Esto permite manipular mejor los datos del resultado 
    // y facilita que PHP lo convierta correctamente a JSON al enviarlo al frontend.
    $vResultado = (array) $vResultado[0];

    // Obtener las especialidades del técnico
    $vSqlEspecialidades = "SELECT e.nombre 
                           FROM especialidades e
                           JOIN tecnico_especialidad te ON e.id = te.especialidad_id
                           WHERE te.usuario_id = $id";
    $especialidades = $this->enlace->ExecuteSQL($vSqlEspecialidades);

    // Añadimos las especialidades a la información del técnico
    $vResultado['especialidades'] = $especialidades;

    // Si se encuentra el técnico, retornamos el primer resultado con las especialidades
    return $vResultado;
}
}
