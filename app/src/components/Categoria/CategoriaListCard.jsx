import React from "react";
import { Link } from "react-router-dom";
import { Layers } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

export function CategoriaListCard({ categoria }) {
  const { t } = useI18n();

  return (
    <div className="relative bg-white/80 border border-gray-200 backdrop-blur-lg rounded-2xl p-6 shadow-md hover:shadow-2xl hover:border-blue-300 transition-all duration-500 hover:-translate-y-2 group overflow-hidden">
      
      <div className="relative z-10">

        {/* Ícono + Nombre */}
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-sky-100 to-indigo-100 rounded-full shadow-sm">
            <Layers className="h-6 w-6 text-blue-700" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            {categoria.nombre}
          </h3>
        </div>

        {/* Descripción */}
        <p className="text-sm text-gray-600 mb-5">{categoria.descripcion}</p>

        {/* Botón Ver detalle */}
        <Link
          to={`/categoria/${categoria.id}`}
          className="inline-block px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-indigo-600 rounded-md shadow-md hover:from-sky-600 hover:to-indigo-700 hover:shadow-lg hover:scale-105 transition-all"
        >
          {t("categories.viewDetail")}
        </Link>

      </div>
    </div>
  );
}
