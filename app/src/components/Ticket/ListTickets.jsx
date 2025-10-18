import React, { useEffect, useState } from "react";
import TicketService from "../../services/TicketService";
import { ListCardTickets } from "./ListCardTickets";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { EmptyState } from "../ui/custom/EmptyState";
import { ErrorAlert } from "../ui/custom/ErrorAlert";

/**
 * Componente que lista los tickets según el rol del usuario.
 * - rolId: 1=Administrador | 2=Técnico | 3=Cliente
 * - userId: ID del usuario autenticado
 */
export function ListTickets({ rolId = 3, userId = 4 }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await TicketService.getTickets({ rolId, userId });
        console.log("Tickets:", response.data);

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
  }, [rolId, userId]);

  // Estados de carga y errores
  if (loading) return <LoadingGrid type="grid" />;
  if (error)
    return (
      <ErrorAlert title="Error al cargar tickets" message={error.toString()} />
    );
  if (!data || data.length === 0)
    return <EmptyState message="No se encontraron tickets disponibles." />;

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        {rolId === 1
          ? "Listado general de Tickets"
          : rolId === 2
          ? "Mis Asignaciones Activas"
          : "Mis Tickets"}
      </h1>

      {/* Listado visual de tickets */}
      <ListCardTickets data={data} rolId={rolId} />
    </div>
  );
}