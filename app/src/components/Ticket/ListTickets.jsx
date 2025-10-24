import React, { useEffect, useState } from "react";
import TicketService from "../../services/TicketService";
import { ListCardTickets } from "./ListCardTickets";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { EmptyState } from "../ui/custom/EmptyState";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import useAuthStore from "../../auth/store/auth.store"; //  Corrección del import

/**
 * Componente que lista los tickets según el rol del usuario.
 * - rolId: 1 = Administrador | 2 = Técnico | 3 = Cliente
 * - userId: ID del usuario autenticado
 */
export function ListTickets() {
  //  obtiene el usuario logueado desde el store global
  const { user } = useAuthStore();

  //  variables de identificación
  const rolId = user?.rol_id; // 1=Admin, 2=Técnico, 3=Cliente
  const userId = user?.id_usuario || user?.id; // soporte doble

  //  estados locales
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  //  debug temporal: confirmar que el store funciona
  console.log("👤 Usuario logueado:", user);

  //  carga dinámica de tickets según rol
  useEffect(() => {
    if (!rolId || !userId) return;

    const fetchData = async () => {
      try {
        const response = await TicketService.getTickets({ rolId, userId });
        console.log("🎟️ Tickets cargados:", response.data);
        setData(response.data.data || response.data);
      } catch (err) {
        console.error("❌ Error al obtener tickets:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rolId, userId]);

  //  estados visuales
  if (loading) return <LoadingGrid type="grid" />;
  if (error)
    return (
      <ErrorAlert title="Error al cargar tickets" message={error.toString()} />
    );
  if (!data || data.length === 0)
    return <EmptyState message="No se encontraron tickets disponibles." />;

  //  render principal
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
