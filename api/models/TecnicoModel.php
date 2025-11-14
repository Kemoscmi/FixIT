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
    // Consulta SQL del técnico
    $vSql = "SELECT id, nombre, apellido, correo, telefono, disponibilidad, observaciones, carga_trabajo
             FROM usuarios
             WHERE rol_id = 2 AND id = $id AND activo = 1";

    $data = $this->enlace->ExecuteSQL($vSql);

    if (!$data || !isset($data[0])) {
        return null; // <- EVITA TODOS LOS PUTOS ERRORES
    }

    $vResultado = (array) $data[0];

    // Traer especialidades
    $vSqlEspecialidades = "SELECT e.id, e.nombre
                           FROM especialidades e
                           INNER JOIN tecnico_especialidad te ON e.id = te.especialidad_id
                           WHERE te.usuario_id = $id";

    $especialidades = $this->enlace->ExecuteSQL($vSqlEspecialidades);

    // Asegurar siempre un array
    if (!is_array($especialidades)) {
        $especialidades = [];
    } 

    $vResultado["especialidades"] = array_values($especialidades);

    return $vResultado;
}

/* Crear técnico */
  public function create($data)
    {
        // Crear usuario
        $sql = "INSERT INTO usuarios 
                (nombre, apellido, correo, contrasena_hash, telefono, observaciones, disponibilidad, activo, rol_id, carga_trabajo, creado_en, actualizado_en)
                VALUES (
                    '{$data['nombre']}',
                    '{$data['apellido']}',
                    '{$data['correo']}',
                    '{$data['contrasena']}',
                    '{$data['telefono']}',
                    '{$data['observaciones']}',
                    '{$data['disponibilidad']}',
                    {$data['activo']},
                    2,
                    0,
                    NOW(),
                    NOW()
                )";

        $usuarioId = $this->enlace->executeSQL_DML_last($sql);

        // Insertar especialidades
        if (!empty($data['especialidades'])) {
            foreach ($data['especialidades'] as $esp) {
                $sqlEsp = "INSERT INTO tecnico_especialidad (usuario_id, especialidad_id)
                           VALUES ($usuarioId, $esp)";
                $this->enlace->executeSQL_DML($sqlEsp);
            }
        }

        return ["success" => true, "id" => $usuarioId];
    }

    // Actualizar tecnico
    public function update($id, $data)
    {
        $sql = "UPDATE usuarios SET
                    nombre = '{$data['nombre']}',
                    apellido = '{$data['apellido']}',
                    correo = '{$data['correo']}',
                    telefono = '{$data['telefono']}',
                    observaciones = '{$data['observaciones']}',
                    disponibilidad = '{$data['disponibilidad']}',
                    activo = {$data['activo']},
                    actualizado_en = NOW()
                WHERE id = $id";

        $this->enlace->executeSQL_DML($sql);

        // Borrar especialidades anteriores
        $sqlDel = "DELETE FROM tecnico_especialidad WHERE usuario_id = $id";
        $this->enlace->executeSQL_DML($sqlDel);

        // Insertar nuevas especialidades
        if (!empty($data['especialidades'])) {
            foreach ($data['especialidades'] as $esp) {
                $sqlEsp = "INSERT INTO tecnico_especialidad (usuario_id, especialidad_id)
                           VALUES ($id, $esp)";
                $this->enlace->executeSQL_DML($sqlEsp);
            }
        }

        return ["success" => true];
    }
}
