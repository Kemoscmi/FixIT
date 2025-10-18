import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Clock, Layers, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

ListCardTickets.propTypes = {
  data: PropTypes.array,
  rolId: PropTypes.number.isRequired, // 1=Admin, 2=Técnico, 3=Cliente
};
export function ListCardTickets({ data, rolId }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No hay tickets disponibles.
      </p>
    );
  }

  return (
    <div className="grid gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((item) => (
        <Card
          key={item.id}
          className="flex flex-col overflow-hidden border border-primary/20 shadow-md hover:shadow-lg transition-shadow"
        >
          <CardHeader className="text-secondary text-center">
            <CardTitle className="text-lg font-semibold">{item.titulo}</CardTitle>
            <p className="text-sm opacity-80">{item.fecha_creacion}</p>
          </CardHeader>

          <CardContent className="flex-1 space-y-2 pt-2">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="h-4 w-4 text-primary" />
              <span className="font-semibold">Categoría:</span> {item.categoria}
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-secondary" />
              <span className="font-semibold">Estado:</span> {item.estado}
            </p>
          </CardContent>

          <div className="flex justify-end gap-2 border-t p-3 bg-muted/30">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" className="size-8">
                    <Link to={`/tickets/${item.id}`}>
                      <Info />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ver detalle</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Ejemplo de uso del rol */}
            {rolId === 1 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline" className="size-8">
                      <Trash2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Eliminar ticket</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}