import React, { useEffect, useState } from "react"; // Importa React y los hooks para manejar estado y efectos
import CategoriaService from "@/services/CategoriaService"; // Servicio que obtiene las categorías desde el backend
import { CategoriaListCard } from "./CategoriaListCard"; // Componente de tarjeta individual para cada categoría
import { Loader2 } from "lucide-react"; // Ícono animado de carga

export function ListCategoria() { // Componente principal para listar categorías
  const [categorias, setCategorias] = useState([]); // Estado con la lista de categorías
  const [loading, setLoading] = useState(true); // Controla si los datos están cargando
  const [error, setError] = useState(null); // Guarda posibles errores

  useEffect(() => { // Se ejecuta al montar el componente
    CategoriaService.getCategorias() // Llama al servicio para obtener las categorías
      .then((response) => { 
        setCategorias(response.data); // Guarda las categorías recibidas
        setLoading(false); // Termina la carga
      })
      .catch((error) => { // Si ocurre un error
        setError(error.message); // Guarda el mensaje de error
        setLoading(false); // Detiene el estado de carga
      });
  }, []); // Se ejecuta solo una vez al iniciar

  if (loading) // Si está cargando, muestra el spinner
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-blue-700">
        <Loader2 className="animate-spin h-10 w-10 mb-4" /> {/* Ícono girando */}
        <p className="text-lg font-medium">Cargando categorías...</p>
      </div>
    );

  if (error) // Si hay error, muestra mensaje
    return (
      <p className="text-center text-red-500 text-lg mt-8">
        Error: {error}
      </p>
    );

  return ( // Si todo está bien, renderiza las categorías
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-pink-100 py-12 px-6">
      <div className="text-center mb-10"> {/* Encabezado del listado */}
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-sky-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent mb-3">
          Categorías de Soporte
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Explora las distintas áreas de soporte técnico disponibles. Cada categoría incluye etiquetas, especialidades y tiempos de respuesta definidos.
        </p>
      </div>

      {/* Grid con todas las tarjetas de categorías */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
         {/* El ? es como un if, si si hay algo hago, si no no */}
        {categorias?.length > 0 ? ( // Si hay categorías, las recorre y muestra
          categorias.map((categoria) => (
            <CategoriaListCard key={categoria.id} categoria={categoria} /> // Tarjeta individual
          ))
        ) : ( // Si no hay registros
          <p className="text-center col-span-full text-gray-600">
            No se encontraron categorías registradas.
          </p>
        )}
      </div>
    </div> 
  );
}
