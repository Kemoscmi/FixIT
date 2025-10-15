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
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }

  /* Obtener una categoría por ID con detalles */
public function get($id)
{
    // Obtener los datos básicos de la categoría
    $vSql = "SELECT id, nombre, descripcion, sla_id FROM categorias WHERE id = $id";
    $vResultado = $this->enlace->ExecuteSQL($vSql);
    
    // Si no encontramos la categoría, retornamos null
    if (empty($vResultado)) {
        return null;
    }

    $categoria = $vResultado[0];  // Tomamos el primer resultado (en este caso, es un objeto)

    // Obtener etiquetas de la categoría desde la tabla intermedia categoria_etiqueta
    $vSqlEtiquetas = "SELECT e.nombre FROM etiquetas e
                      JOIN categoria_etiqueta ce ON e.id = ce.etiqueta_id
                      WHERE ce.categoria_id = $id";
    $categoria->etiquetas = $this->enlace->ExecuteSQL($vSqlEtiquetas);  // Accedemos a propiedades usando `->`

    // Obtener especialidades de la categoría desde la tabla intermedia categoria_especialidad
    $vSqlEspecialidades = "SELECT e.nombre FROM especialidades e
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
}
