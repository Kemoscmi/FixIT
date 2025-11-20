import * as React from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Eye, Trash2, ArrowLeft, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import TicketService from "@/services/TicketService";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";

// Columnas visibles de la tabla de tickets
const ticketColumns = [
  { key: "titulo", label: "Título" },
  { key: "fecha_creacion", label: "Fecha de Creación" },
  { key: "estado", label: "Estado" },
  { key: "prioridad", label: "Prioridad" },
  { key: "acciones", label: "Acciones" },
];

export default function TableTickets() {
  // Datos desde la API
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Simulación de administrador autenticado
  const rolId = 1;
  const userId = 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await TicketService.getTickets({ rolId, userId });
        console.log("Tickets admin:", response.data);

        if (!response.data.success) {
          setError(response.data.message);
        } else {
          setData(response.data.data || response.data);
        }
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Estados de carga, error y vacíos
  if (loading) return <LoadingGrid type="grid" />;
  if (error)
    return (
      <ErrorAlert title="Error al cargar tickets" message={error.toString()} />
    );
  if (!data || data.length === 0)
    return <EmptyState message="No se encontraron tickets." />;

  return (
    <div className="container mx-auto py-8">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Listado General de Tickets
        </h1>

        {/* 🔥 Nuevo botón (reemplaza el ojo) */}
        <Button
          asChild
          className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90"
        >
          <Link to="/tickets/create">
            <Plus className="w-4 h-4" />
            Crear Ticket
          </Link>
        </Button>
      </div>

      {/* Tabla principal */}
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-primary/10">
            <TableRow>
              {ticketColumns.map((column) => (
                <TableHead
                  key={column.key}
                  className="text-left font-semibold text-primary"
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{row.titulo}</TableCell>
                <TableCell>{row.fecha_creacion}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      row.estado === "Cerrado"
                        ? "bg-green-200 text-green-700"
                        : row.estado === "En Progreso"
                        ? "bg-yellow-200 text-yellow-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {row.estado}
                  </span>
                </TableCell>
                <TableCell>
                  {row.prioridad || (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>

                {/* Botones de acciones */}
                <TableCell className="flex justify-start items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-accent/20"
                        >
                          <Link to={`/tickets/${row.id}`}>
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ver detalle</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-accent/20"
                        >
                          <Edit className="h-4 w-4 text-primary" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar ticket</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-accent/20"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Eliminar ticket</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Botón regresar */}
      <Button
        type="button"
        onClick={() => window.history.back()}
        className="flex items-center gap-2 bg-accent text-white hover:bg-accent/90 mt-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Regresar
      </Button>
    </div>
  );
}
