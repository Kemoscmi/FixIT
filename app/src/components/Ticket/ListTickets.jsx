import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TicketService from "../../services/TicketService";
import { ListCardTickets } from "./ListCardTickets";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { EmptyState } from "../ui/custom/EmptyState";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import useAuthStore from "../../auth/store/auth.store";

// UI components
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function ListTickets() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const rolId = user?.rol_id;
  const userId = user?.id_usuario || user?.id;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  //  Determina si puede crear ticket
  const canCreate =
    user?.rol === "Administrador" ||
    user?.rol === "Cliente" ||
    rolId === 1 ||
    rolId === 3;

  useEffect(() => {
    if (!rolId || !userId) return;

    const fetchData = async () => {
      try {
        const response = await TicketService.getTickets({ rolId, userId });
        console.log(" Tickets cargados:", response.data);
        setData(response.data.data || response.data);
      } catch (err) {
        console.error(" Error al obtener tickets:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rolId, userId]);

  if (loading) return <LoadingGrid type="grid" />;
  if (error)
    return (
      <ErrorAlert title="Error al cargar tickets" message={error.toString()} />
    );

  // Si no hay datos
  if (!data || data.length === 0)
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Mis Tickets</h1>

          {/*  Botón visible solo para admin o cliente */}
          {canCreate && (
            <Button
              onClick={() => navigate("/tickets/create")}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="w-4 h-4" />
              Crear Ticket
            </Button>
          )}
        </div>

        <EmptyState message="No se encontraron tickets disponibles." />
      </div>
    );

  // Vista principal con listado
  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Mis Tickets</h1>

        {/* Botón visible solo para admin o cliente */}
        {canCreate && (
          <Button
            onClick={() => navigate("/tickets/create")}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4" />
            Crear Ticket
          </Button>
        )}
      </div>

      {/* Listado visual de tickets */}
      <ListCardTickets data={data} rolId={rolId} />
    </div>
  );
}
