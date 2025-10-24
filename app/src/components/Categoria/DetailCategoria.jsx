import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CategoriaService from "@/services/CategoriaService";

export function DetailCategoria() {
  const { id } = useParams();
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    CategoriaService.getCategoriaById(id)
      .then((response) => {
        setCategoria(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="text-center text-lg">Cargando detalles...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  if (!categoria)
    return <p className="text-center text-gray-500">Categoría no encontrada.</p>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-6 text-blue-700">
        Detalle de Categoría
      </h2>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <p>
          <strong className="text-gray-700">Nombre:</strong> {categoria.nombre}
        </p>
        <p>
          <strong className="text-gray-700">Descripción:</strong>{" "}
          {categoria.descripcion}
        </p>

        {/* Etiquetas */}
        <div>
          <h3 className="text-xl font-semibold text-blue-700">Etiquetas</h3>
          {categoria.etiquetas && categoria.etiquetas.length > 0 ? (
            <ul className="list-disc pl-6 mt-2">
              {categoria.etiquetas.map((etq, index) => (
                <li key={index} className="text-gray-600">
                  {etq.nombre}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Sin etiquetas registradas.</p>
          )}
        </div>

        {/* Especialidades */}
        <div>
          <h3 className="text-xl font-semibold text-blue-700">Especialidades</h3>
          {categoria.especialidades && categoria.especialidades.length > 0 ? (
            <ul className="list-disc pl-6 mt-2">
              {categoria.especialidades.map((esp, index) => (
                <li key={index} className="text-gray-600">
                  {esp.nombre}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Sin especialidades registradas.</p>
          )}
        </div>

        {/* SLA */}
        <div>
          <h3 className="text-xl font-semibold text-blue-700">SLA</h3>
          {categoria.sla && categoria.sla.length > 0 ? (
            <ul className="pl-2 mt-2 text-gray-700">
              <li>
                <strong>Tiempo máx. de respuesta:</strong>{" "}
                {categoria.sla[0].tiempo_max_respuesta_min} minutos
              </li>
              <li>
                <strong>Tiempo máx. de resolución:</strong>{" "}
                {categoria.sla[0].tiempo_max_resolucion_min} minutos
              </li>
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">SLA no disponible.</p>
          )}
        </div>

        <div className="pt-4">
          <button
            onClick={() => navigate("/categorias")}
            className="bg-blue-700 text-white px-5 py-2 rounded-md hover:bg-blue-800 transition"
          >
            Volver al listado
          </button>
        </div>
      </div>
    </div>
  );
}
