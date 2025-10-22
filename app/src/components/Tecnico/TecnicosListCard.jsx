import React from "react";
import { Link } from "react-router-dom";  // Usamos el Link de react-router-dom para navegar entre páginas

// Tarjeta de técnico
export function TecnicosListCard({ tecnico }) {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 flex flex-col items-start gap-4 shadow-md hover:shadow-xl transition-all">
      <h3 className="text-xl font-semibold text-gray-900">
        {tecnico.nombre} {tecnico.apellido}
      </h3>
      <p className="text-sm text-gray-600">Cargo: {tecnico.observaciones}</p>
      <p className="text-sm text-gray-600">Disponibilidad: {tecnico.disponibilidad}</p>

      {/* Enlace para ver detalle */}
      <Link
        to={`/tecnico/${tecnico.id}`}
        className="mt-4 px-6 py-2 bg-blue-700 text-white rounded-md shadow-md hover:bg-blue-800"
      >
        Ver detalle
      </Link>
    </div>
  );
}
