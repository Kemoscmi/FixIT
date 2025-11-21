<?php
class CategoriaModel
{ 
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();  // Conexión a la base de datos
    }

    /* Listar todas las categorías */
    public function all()
    {
        $vSql = "SELECT id, nombre, descripcion FROM categorias ";
        $vResultado = $this->enlace->ExecuteSQL($vSql); // Ejecutamos la consulta
        return $vResultado;
    }

  /* Obtener una categoría por ID con detalles 
  Este método busca una categoría por su ID, verifica si existe, y si sí, 
  le agrega sus etiquetas, especialidades y datos del SLA antes de devolverla al frontend.
  */
public function get($id)
{
    // Obtener los datos básicos de la categoría
    $vSql = "SELECT id, nombre, descripcion, sla_id FROM categorias WHERE id = $id";
    $vResultado = $this->enlace->ExecuteSQL($vSql);
    
    // Convertir el objeto a un array
    // Esto permite manipular mejor los datos del resultado 
    // y facilita que PHP lo convierta correctamente a JSON al enviarlo al frontend.
    $categoria = $vResultado[0];  // Tomamos el primer resultado (en este caso, es un objeto)

    // Obtenemos etiquetas de la categoría desde la tabla intermedia categoria_etiqueta
    $vSqlEtiquetas = "SELECT e.id, e.nombre 
                  FROM etiquetas e
                  JOIN categoria_etiqueta ce ON e.id = ce.etiqueta_id
                  WHERE ce.categoria_id = $id";
    $categoria->etiquetas = $this->enlace->ExecuteSQL($vSqlEtiquetas);  // Accedemos a propiedades usando `->`

    // Obtener especialidades de la categoría desde la tabla intermedia categoria_especialidad
    $vSqlEspecialidades = "SELECT e.id, e.nombre 
                       FROM especialidades e
                       JOIN categoria_especialidad ce ON e.id = ce.especialidad_id
                       WHERE ce.categoria_id = $id";
    $categoria->especialidades = $this->enlace->ExecuteSQL($vSqlEspecialidades);  // Accedemos a propiedades usando `->`

    // Obtener SLA de la categoría
    $vSqlSLA = "SELECT s.tiempo_max_respuesta_min, s.tiempo_max_resolucion_min
                FROM sla s
                WHERE s.id = {$categoria->sla_id}";
    $categoria->sla = $this->enlace->ExecuteSQL($vSqlSLA);  // Accedemos a propiedades usando `->`

    return $categoria;
}

 
 public function create($data)
    {
        // Insert en tabla categorías
        $sql = "
            INSERT INTO categorias (nombre, descripcion, sla_id, creado_en, actualizado_en)
            VALUES (
                '{$data['nombre']}',
                '{$data['descripcion']}',
                {$data['sla_id']},
                NOW(),
                NOW()
            )
        ";

        // Devuelve el ID recién insertado
        $categoriaId = $this->enlace->executeSQL_DML_last($sql);

        if (!empty($data['etiquetas'])) {
            foreach ($data['etiquetas'] as $etqId) {
                $sqlEtq = "
                    INSERT INTO categoria_etiqueta (categoria_id, etiqueta_id)
                    VALUES ($categoriaId, $etqId)
                ";
                $this->enlace->executeSQL_DML($sqlEtq);
            }
        }

        if (!empty($data['especialidades'])) {
            foreach ($data['especialidades'] as $espId) {
                $sqlEsp = "
                    INSERT INTO categoria_especialidad (categoria_id, especialidad_id)
                    VALUES ($categoriaId, $espId)
                ";
                $this->enlace->executeSQL_DML($sqlEsp);
            }
        }

        return [
            "success" => true,
            "message" => "Categoría creada correctamente",
            "id" => $categoriaId
        ];
    }

//MODIFICAAAARRR
    public function update($id, $data)
    {
        // Update categoría
        $sql = "
            UPDATE categorias SET
                nombre = '{$data['nombre']}',
                descripcion = '{$data['descripcion']}',
                sla_id = {$data['sla_id']},
                actualizado_en = NOW()
            WHERE id = $id
        ";
        $this->enlace->executeSQL_DML($sql);

        $sqlDelEtq = "DELETE FROM categoria_etiqueta WHERE categoria_id = $id";
        $this->enlace->executeSQL_DML($sqlDelEtq);

        // Agregar nuevas etiquetas
        if (!empty($data['etiquetas'])) {
            foreach ($data['etiquetas'] as $etqId) {
                $sqlEtq = "
                    INSERT INTO categoria_etiqueta (categoria_id, etiqueta_id)
                    VALUES ($id, $etqId)
                ";
                $this->enlace->executeSQL_DML($sqlEtq);
            }
        }

        $sqlDelEsp = "DELETE FROM categoria_especialidad WHERE categoria_id = $id";
        $this->enlace->executeSQL_DML($sqlDelEsp);

        // Agregar nuevas
        if (!empty($data['especialidades'])) {
            foreach ($data['especialidades'] as $espId) {
                $sqlEsp = "
                    INSERT INTO categoria_especialidad (categoria_id, especialidad_id)
                    VALUES ($id, $espId)
                ";
                $this->enlace->executeSQL_DML($sqlEsp);
            }
        }

        return [
            "success" => true,
            "message" => "Categoría actualizada correctamente"
        ];
    }

}
