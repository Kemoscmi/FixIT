<?php
class EtiquetaModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    // Obtener todas las etiquetas
    public function getAll()
    {
        $sql = "SELECT id, nombre FROM etiquetas ORDER BY nombre";
        return $this->enlace->ExecuteSQL($sql) ?: [];
    }

    // Obtener categoría asociada a una etiqueta
    public function getCategoriaByEtiqueta(int $etiquetaId)
    {
        $sql = "
            SELECT c.id AS categoria_id, c.nombre, c.descripcion
            FROM categoria_etiqueta ce
            INNER JOIN categorias c ON c.id = ce.categoria_id
            WHERE ce.etiqueta_id = " . intval($etiquetaId) . "
            LIMIT 1
        ";
        $result = $this->enlace->ExecuteSQL($sql);
        return $result ? $result[0] : null;
    }
}
