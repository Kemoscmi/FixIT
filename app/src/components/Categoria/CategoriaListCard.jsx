import React from "react"; // Importa React
import { Link } from "react-router-dom"; // Permite la navegación entre páginas sin recargar
import { Layers } from "lucide-react"; // Ícono decorativo usado en la tarjeta

export function CategoriaListCard({ categoria }) { // Recibe una categoría como prop
  return (
    <div className="relative bg-white/80 border border-gray-200 backdrop-blur-lg rounded-2xl p-6 shadow-md hover:shadow-2xl hover:border-blue-300 transition-all duration-500 hover:-translate-y-2 group overflow-hidden">
      {/* Contenedor principal de la tarjeta con efectos de hover y sombra */}

      <div className="relative z-10"> {/* Contenedor del contenido interno */}
        <div className="flex items-center gap-3 mb-3"> {/* Encabezado: ícono + nombre */}
          <div className="p-3 bg-gradient-to-br from-sky-100 to-indigo-100 rounded-full shadow-sm">
            <Layers className="h-6 w-6 text-blue-700" /> {/* Ícono de capas */}
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            {categoria.nombre} {/* Muestra el nombre de la categoría */}
          </h3>
        </div>

        {/* Descripción corta de la categoría */}
        <p className="text-sm text-gray-600 mb-5">{categoria.descripcion}</p>

        {/* Botón para ver los detalles completos */}
        <Link
          to={`/categoria/${categoria.id}`} // Redirige al detalle usando el ID
          className="inline-block px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-indigo-600 rounded-md shadow-md hover:from-sky-600 hover:to-indigo-700 hover:shadow-lg hover:scale-105 transition-all"
        >
          Ver detalle
        </Link>
      </div>
    </div>
  );
}
