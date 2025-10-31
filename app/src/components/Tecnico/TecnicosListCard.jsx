import React from "react"; // Importa React
import { Link } from "react-router-dom"; // Permite navegar sin recargar la página
import { UserCog, CheckCircle2, AlertCircle } from "lucide-react"; // Íconos visuales

export function TecnicosListCard({ tecnico }) { // Recibe un técnico como propiedad (prop)
  // Define el color según la disponibilidad del técnico
  const disponibilidadColor =
    tecnico.disponibilidad === "Disponible"
      ? "text-green-600 bg-green-50 border-green-200" // Verde si está disponible
      : "text-red-600 bg-red-50 border-red-200"; // Rojo si no está disponible

  return (
    <div className="relative overflow-hidden bg-white/70 border border-gray-200 backdrop-blur-lg shadow-lg rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-blue-400 group">
      {/* Contenedor principal con efecto hover y sombra */}    
      <div className="relative z-10 flex flex-col gap-4"> {/* Contenido interno */}
        <div className="flex items-center gap-3"> {/* Nombre + icono */}
          <div className="p-3 bg-blue-100 rounded-full"> {/* Fondo del icono */}
            <UserCog className="h-6 w-6 text-blue-700" /> {/* Ícono de técnico */}
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            {tecnico.nombre} {tecnico.apellido} {/* Nombre completo */}
          </h3>
        </div>

        {/* Observación o cargo del técnico */}
        <p className="text-sm text-gray-700">{tecnico.observaciones}</p>

        {/* Estado de disponibilidad */}
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border ${disponibilidadColor}`}
        >
          {tecnico.disponibilidad === "Disponible" ? ( // Ícono según disponibilidad
            <CheckCircle2 className="h-4 w-4" /> // Verde si disponible
          ) : (
            <AlertCircle className="h-4 w-4" /> // Rojo si no
          )}
          {tecnico.disponibilidad} {/* Texto de disponibilidad */}
        </span>

        {/* Botón que redirige al detalle del técnico */}
        <Link
          to={`/tecnico/${tecnico.id}`} // Navega al detalle usando el id
          className="mt-4 inline-block px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-sky-600 to-blue-700 rounded-md shadow-md hover:from-sky-700 hover:to-blue-800 hover:shadow-lg hover:scale-105 transition"
        >
          Ver detalle
        </Link>
      </div>
    </div>
  );
}
