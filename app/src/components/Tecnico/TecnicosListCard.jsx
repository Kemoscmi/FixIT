import React from "react";
import { Link } from "react-router-dom";
import { UserCog, CheckCircle2, AlertCircle } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

export function TecnicosListCard({ tecnico }) {
  const { t } = useI18n();

  const isAvailable = tecnico.disponibilidad === "Disponible";

  // Colores según disponibilidad
  const disponibilidadColor = isAvailable
    ? "text-green-600 bg-green-50 border-green-200"
    : "text-red-600 bg-red-50 border-red-200";

  // Traducción del estado “Disponible / Ocupado”
  const disponibilidadTexto = isAvailable
    ? t("technicians.fields.available") || "Disponible"
    : t("technicians.fields.busy") || "Ocupado";

  return (
    <div className="relative overflow-hidden bg-white/70 border border-gray-200 backdrop-blur-lg shadow-lg rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-blue-400 group">
      
      <div className="relative z-10 flex flex-col gap-4">
        
        {/* Nombre + ícono */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <UserCog className="h-6 w-6 text-blue-700" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            {tecnico.nombre} {tecnico.apellido}
          </h3>
        </div>

        {/* Observaciones */}
        <p className="text-sm text-gray-700">{tecnico.observaciones}</p>

        {/* Disponibilidad */}
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border ${disponibilidadColor}`}
        >
          {isAvailable ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}

          {disponibilidadTexto}
        </span>

        {/* Botón de detalle */}
        <Link
          to={`/tecnico/${tecnico.id}`}
          className="mt-4 inline-block px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-sky-600 to-blue-700 rounded-md shadow-md hover:from-sky-700 hover:to-blue-800 hover:shadow-lg hover:scale-105 transition"
        >
          {t("buttons.view")}
        </Link>
      </div>
    </div>
  );
}
