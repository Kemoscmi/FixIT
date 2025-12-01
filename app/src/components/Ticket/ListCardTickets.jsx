// ============================================================
// COMPONENTE: ListCardTickets.jsx
// ============================================================

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { Layers, AlertTriangle, Info, Trash2, Circle } from "lucide-react";

import { Link } from "react-router-dom";
import PropTypes from "prop-types";

// ⭐ i18n
import { useI18n } from "@/hooks/useI18n";

// ============================================================
//  Diccionario de colores visuales según el estado
// ============================================================
const estadoColors = {
  Pendiente: "bg-amber-100 text-amber-800 border-amber-400",
  Asignado: "bg-sky-100 text-sky-800 border-sky-400",
  "En Proceso": "bg-indigo-100 text-indigo-800 border-indigo-400",
  Resuelto: "bg-emerald-100 text-emerald-800 border-emerald-400",
  Cerrado: "bg-rose-100 text-rose-800 border-rose-400",
};

// ============================================================
//  PropTypes
// ============================================================
ListCardTickets.propTypes = {
  data: PropTypes.array,
  rolId: PropTypes.number.isRequired,
};

// ============================================================
//  COMPONENTE PRINCIPAL
// ============================================================
export function ListCardTickets({ data, rolId }) {
  const { t } = useI18n();

  if (!data || data.length === 0) {
    return (
      <p className="text-center text-gray-500 italic py-10">
        {t("tickets.list.empty")}
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] via-white to-[#f0f6ff] py-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((item) => {
            const colorEstado =
              estadoColors[item.estado] ||
              "bg-gray-100 text-gray-700 border-gray-200";

            return (
              <Card
                key={item.id}
                className="flex flex-col rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 bg-white/90 backdrop-blur-sm"
              >
                {/* Encabezado */}
                <CardHeader className="bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] text-white py-4 px-5 flex justify-between items-center">

                  <CardTitle className="text-base font-semibold truncate">
                    {item.titulo || t("tickets.fields.title")}
                  </CardTitle>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={`/tickets/${item.id}`}
                          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                        >
                          <Info className="h-4 w-4 text-white" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>{t("buttons.view")}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardHeader>

                {/* Contenido */}
                <CardContent className="flex-1 p-6 space-y-4 text-gray-700">

                  {/* Categoría */}
                  <div className="flex items-start gap-2 text-sm leading-snug">
                    <Layers className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800 block">
                        {t("tickets.fields.category")}
                      </span>
                      <span className="block break-words">
                        {item.categoria?.nombre ||
                          item.categoria ||
                          t("categories.noCategories")}
                      </span>
                    </div>
                  </div>

                  {/* Prioridad */}
                  <div className="flex items-start gap-2 text-sm leading-snug">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800 block">
                        {t("tickets.fields.priority")}
                      </span>
                      <span className="block">
                        {item.prioridad?.nombre ||
                          item.prioridad ||
                          t("common.notDefined")}
                      </span>
                    </div>
                  </div>

                  {/* Estado */}
                  <div
                    className={`flex items-center gap-2 text-sm font-semibold border rounded-lg px-3 py-1 w-fit ${colorEstado}`}
                  >
                    <Circle className="h-3 w-3 fill-current" />
                    {item.estado}
                  </div>
                </CardContent>

                {/* Footer */}
                <div className="flex justify-between items-center border-t bg-[#f8faff] px-5 py-3 rounded-b-3xl">
                  <div className="flex gap-2">

                    {/* Ver detalle */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-[#2563eb] to-[#4f46e5] text-white hover:scale-105 hover:shadow transition-all text-xs px-4"
                            asChild
                          >
                            <Link to={`/tickets/${item.id}`}>
                              {t("buttons.view")}
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("buttons.view")}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Eliminar — solo admin */}
                    {rolId === 1 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              className="size-8 bg-white hover:bg-red-50 text-red-500 border border-red-200 hover:border-red-400 transition-all rounded-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t("buttons.delete")}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
