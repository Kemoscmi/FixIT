import React, { useEffect, useState } from "react"; // Importa React y los hooks para estado y efectos
import { useParams, useNavigate } from "react-router-dom"; // Permite leer parámetros y navegar entre rutas
import CategoriaService from "@/services/CategoriaService"; // Servicio que obtiene las categorías del backend
import { Layers, Tag, Star, Clock, ArrowLeftCircle } from "lucide-react"; // Íconos usados en la vista

export function DetailCategoria() { // Componente principal de detalle de categoría
  const { id } = useParams(); // Obtiene el ID desde la URL
  const [categoria, setCategoria] = useState(null); // Guarda la categoría seleccionada
  const [loading, setLoading] = useState(true); // Controla el estado de carga
  const [error, setError] = useState(null); // Guarda mensajes de error
  const navigate = useNavigate(); // Permite volver al listado

  useEffect(() => { // Se ejecuta cuando cambia el ID
    CategoriaService.getCategoriaById(id) // Llama al backend para obtener la categoría
      .then((response) => {
        setCategoria(response.data); // Guarda los datos obtenidos
        setLoading(false); // Termina la carga
      })
      .catch((error) => { // Si hay error
        setError(error.message); // Guarda el error
        setLoading(false); // Termina la carga
      });
  }, [id]); // Solo se ejecuta cuando cambia el parámetro id

  if (loading) // Pantalla de carga
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-indigo-600">
        <Clock className="animate-spin h-10 w-10 mb-4" /> {/* Ícono animado */}
        <p className="text-lg font-medium">Cargando detalles...</p>
      </div>
    );

  if (error) // Si hay error
    return (
      <p className="text-center text-red-500 text-lg mt-8">
        Error: {error}
      </p>
    );

  if (!categoria) // Si no existe la categoría
    return (
      <p className="text-center text-gray-500 text-lg mt-8">
        Categoría no encontrada.
      </p>
    );

  return ( // Si todo está bien, muestra el detalle
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-pink-100 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 border border-gray-200">
        
        {/* 🔹 Encabezado principal */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-100 to-pink-100 rounded-full shadow-sm">
            <Layers className="h-8 w-8 text-blue-700" /> {/* Ícono de capa */}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              {categoria.nombre} {/* Nombre de la categoría */}
            </h2>
          </div>
        </div>

        {/* 🔹 Etiquetas */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-black-700 flex items-center gap-2">
            <Tag className="h-5 w-5" /> Etiquetas
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {categoria.etiquetas?.length > 0 ? ( // Si hay etiquetas
        //map() sirve para recorrer un arreglo (array) y renderizar algo por cada elemento.
              categoria.etiquetas.map((etq, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {etq.nombre}
                </span>
              ))
            ) : ( // Si no hay
              <p className="text-gray-500 text-sm">Sin etiquetas registradas.</p>
            )}
          </div>
        </div>

        {/* 🔹 Especialidades */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-black-700 flex items-center gap-2">
            <Star className="h-5 w-5" /> Especialidades
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {categoria.especialidades?.length > 0 ? ( // Si hay especialidades
              categoria.especialidades.map((esp, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {esp.nombre}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Sin especialidades registradas.</p>
            )}
          </div>
        </div>

        {/* 🔹 SLA */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-black-700 flex items-center gap-2">
            <Clock className="h-5 w-5" /> SLA
          </h3>
          {categoria.sla?.length > 0 ? ( // Si hay datos SLA
            <div className="mt-2 space-y-1 text-gray-700">
              <p>
                <strong>Tiempo máx. de respuesta:</strong>{" "}
                {categoria.sla[0].tiempo_max_respuesta_min} min
              </p>
              <p>
                <strong>Tiempo máx. de resolución:</strong>{" "}
                {categoria.sla[0].tiempo_max_resolucion_min} min
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">SLA no disponible.</p>
          )}
        </div>

        {/* 🔹 Botón volver */}
        <button
          onClick={() => navigate("/categorias")} // Redirige al listado
          className="flex items-center gap-2 bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-3 rounded-md shadow-lg hover:scale-105 transition-all"
        >
          <ArrowLeftCircle className="h-5 w-5" /> {/* Ícono de regreso */}
          Volver al listado
        </button>
      </div>
    </div> 
  );
}
