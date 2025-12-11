// src/components/Usuarios/UsersListCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { UserCog, CheckCircle2, AlertCircle } from "lucide-react";

export function UsersListCard({ usuario }) {
  const rol = usuario.rol_id === "1" ? "Administrador" : usuario.rol_id === "2" ? "Técnico" : "Cliente";
  const rolColor = rol === "Administrador" ? "bg-blue-500" : rol === "Técnico" ? "bg-green-500" : "bg-gray-500";

  return (
    <div className="relative overflow-hidden bg-white/70 border border-gray-200 backdrop-blur-lg shadow-lg rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-blue-400 group">
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 ${rolColor} rounded-full`}>
            <UserCog className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            {usuario.nombre} {usuario.apellido}
          </h3>
        </div>    

        <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full text-white ${rolColor}`}>
          {rol}
        </span>

        <Link
          to={`/usuario/detail/${usuario.id}`}
          className="mt-4 inline-block px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-sky-600 to-blue-700 rounded-md shadow-md hover:from-sky-700 hover:to-blue-800 hover:shadow-lg hover:scale-105 transition"
        >
          Ver Detalles
        </Link>
      </div>
    </div>
  );
}
