import React from "react";
import { Link } from "react-router-dom";

export function CategoriaListCard({ categoria }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{categoria.nombre}</h3>
      <p className="text-sm text-gray-600 mb-4">{categoria.descripcion}</p>

      <Link
        to={`/categoria/${categoria.id}`}
        className="bg-blue-700 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-800 transition"
      >
        Ver detalle
      </Link>
    </div>
  );
}
