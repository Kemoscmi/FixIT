import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TicketService from "../../services/TicketService";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { EmptyState } from "../ui/custom/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  Layers,
  Clock,
  ChevronRight,
  ArrowLeft,
  ImageIcon,
  MessageSquare,
  Star,
} from "lucide-react";

export function DetailTicket() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simula rol y user activo (luego se obtiene del login)
  const rolId = 2; // 1=Admin, 2=Técnico, 3=Cliente
  const userId = 3;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await TicketService.getTicketById(id, { rolId, userId });
        console.log(response.data);
        setTicket(response.data);
        if (!response.data.success) setError(response.data.message);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <LoadingGrid count={1} type="grid" />;
  if (error) return <ErrorAlert title="Error al cargar ticket" message={error} />;
  if (!ticket || !ticket.data) return <EmptyState message="Ticket no encontrado." />;

  const t = ticket.data;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-6">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sección de información básica */}
        <div className="flex-1 space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">{t.titulo}</h1>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Calendar className="text-primary" />
                  <span className="font-semibold">Fecha creación:</span>
                  <p className="text-muted-foreground">{t.fecha_creacion}</p>
                </div>
                <div className="flex items-center gap-3">
                  <User className="text-primary" />
                  <span className="font-semibold">Solicitante:</span>
                  <p className="text-muted-foreground">{t.usuario_solicitante}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Layers className="text-primary" />
                  <span className="font-semibold">Categoría:</span>
                  <p className="text-muted-foreground">{t.categoria}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-primary" />
                  <span className="font-semibold">Estado:</span>
                  <Badge variant="secondary">{t.estado}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historial de estados */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="text-primary" /> Historial de estados
          </h2>
          {t.historial && t.historial.length > 0 ? (
            <ul className="space-y-4">
              {t.historial.map((h, idx) => (
                <li key={idx} className="border-b pb-2">
                  <p className="font-semibold">{h.estado}</p>
                  <p className="text-sm text-muted-foreground">{h.observacion}</p>
                  {h.imagenes && h.imagenes.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {h.imagenes.map((img, i) => (
                        <img
                          key={i}
                          src={`${import.meta.env.VITE_BASE_URL}uploads/${img}`}
                          alt={`Evidencia ${i + 1}`}
                          className="h-24 w-24 rounded object-cover border"
                        />
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState message="Sin historial registrado." />
          )}
        </CardContent>
      </Card>

      {/* Valoración */}
      {t.valoracion && (
        <Card>
          <CardContent className="p-6 space-y-2">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Star className="text-primary" /> Valoración del cliente
            </h2>
            <p>Puntaje: ⭐ {t.valoracion.puntaje}/5</p>
            <p className="text-muted-foreground">{t.valoracion.comentario}</p>
          </CardContent>
        </Card>
      )}

      <Button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 bg-accent text-white hover:bg-accent/90"
      >
        <ArrowLeft className="w-4 h-4" />
        Regresar
      </Button>
    </div>
  );
}