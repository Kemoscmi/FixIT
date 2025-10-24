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

// 🎨 Colores de estado
const estadoColors = {
  Pendiente: "bg-amber-100 text-amber-800 border-amber-400",        // 🟡 espera o sin atender
  Asignado: "bg-sky-100 text-sky-800 border-sky-400",               // 🔵 asignado a técnico
  "En Proceso": "bg-indigo-100 text-indigo-800 border-indigo-400",  // 🟣 en trabajo
  Resuelto: "bg-emerald-100 text-emerald-800 border-emerald-400",   // 🟢 solucionado exitosamente
  Cerrado: "bg-rose-100 text-rose-800 border-rose-400",             // 🔴 cerrado (fin del ciclo)
};

// 🧩 Validación de props
ListCardTickets.propTypes = {
  data: PropTypes.array,
  rolId: PropTypes.number.isRequired, // 1=Admin, 2=Técnico, 3=Cliente
};

// 🧠 Componente principal
export function ListCardTickets({ data, rolId }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No hay tickets disponibles.
      </p>
    );
  }

  return (
    <div className="grid gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((item) => {
        const colorEstado =
          estadoColors[item.estado] || "bg-gray-100 text-gray-700 border-gray-200";

        return (
          <Card
            key={item.id}
            className="flex flex-col border border-gray-200 shadow-md hover:shadow-xl transition-all hover:scale-[1.02] rounded-xl overflow-hidden bg-white"
          >
            {/* 🟩 Encabezado */}
            <CardHeader className="bg-gradient-to-r from-[#f9fafb] to-[#eef2ff] border-b border-gray-100 text-center py-4">
              <CardTitle className="text-lg font-semibold text-gray-800 truncate">
                {item.titulo || "Sin título"}
              </CardTitle>
              <p className="text-xs text-gray-500">
                {item.fecha_creacion
                  ? new Date(item.fecha_creacion).toLocaleDateString()
                  : "Fecha no disponible"}
              </p>
            </CardHeader>

            {/* 🟩 Contenido */}
            <CardContent className="flex-1 space-y-3 p-5">
              {/* Categoría */}
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <Layers className="h-4 w-4 text-blue-500" />
                <span className="font-semibold">Categoría:</span>{" "}
                {item.categoria || "Sin categoría"}
              </p>

              {/* Estado */}
              <div
                className={`flex items-center gap-2 text-sm font-semibold border rounded-md px-2 py-1 ${colorEstado}`}
              >
                <Circle className="h-3 w-3 fill-current" />
                {item.estado || "Desconocido"}
              </div>

              {/* Prioridad */}
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">Prioridad:</span>{" "}
                {item.prioridad || "No definida"}
              </p>

              {/* ID visual */}
              <p className="text-xs text-gray-400 mt-2">
                <strong>ID:</strong> #{item.id}
              </p>
            </CardContent>

            {/* 🟩 Footer */}
            <div className="flex justify-end gap-2 border-t p-3 bg-gray-50">
              {/* Botón ver detalle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className="size-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all"
                    >
                      <Link to={`/tickets/${item.id}`}>
                        <Info />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ver detalle</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Solo Admin puede eliminar */}
              {rolId === 1 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8 hover:bg-red-50 text-red-600 border-red-200 hover:border-red-400 transition-colors"
                      >
                        <Trash2 />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Eliminar ticket</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </Card>
        );
      })}
    </div>
    
  );
  
}
