import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TicketService from "../../services/TicketService";
import useAuth from "../../auth/store/auth.store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { Clock, User, MessageSquare, Star, ArrowLeft } from "lucide-react";

export function DetailTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const rolId = user?.rol_id;
  const userId = user?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await TicketService.getTicketById(id, { rolId, userId });
        setData(res.data?.data || {});
      } catch (err) {
        console.error("Error al obtener ticket:", err);
        setError("Error al obtener el detalle del ticket.");
      } finally {
        setLoading(false);
      }
    };

    if (id && rolId && userId) fetchTicket();
  }, [id, rolId, userId]);

  if (loading) return <LoadingGrid />;
  if (error) return <ErrorAlert title="Error" message={error} />;
  if (!data) return <ErrorAlert title="Sin datos" message="Ticket no encontrado." />;

  const { basicos, sla, historial, valoracion } = data;

  // 🎨 Colores de estado
  const estadoColors = {
    Pendiente: "bg-gray-400",
    Asignado: "bg-blue-500",
    "En Proceso": "bg-yellow-500",
    Resuelto: "bg-green-500",
    Cerrado: "bg-gray-700",
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
          🧾 Ticket #{basicos?.id}
        </h1>
        <Badge className={`${estadoColors[basicos?.estado] || "bg-gray-500"} text-white text-base`}>
          {basicos?.estado}
        </Badge>
      </div>
      <p className="text-gray-600 text-sm">
        Creado el {new Date(basicos?.fecha_creacion).toLocaleString("es-CR")}
      </p>

      {/* Datos principales */}
      <Card className="border border-gray-200 shadow-md bg-gray-50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">
            Detalles del Ticket
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-gray-700">
          <p><strong>Título:</strong> {basicos?.titulo}</p>
          <p><strong>Descripción:</strong> {basicos?.descripcion}</p>
          <p><strong>Categoría:</strong> {basicos?.categoria}</p>
          <p><strong>Prioridad:</strong> {basicos?.prioridad}</p>
          <p><strong>Solicitante:</strong> {basicos?.solicitante}</p>
          <p><strong>Días de resolución:</strong> {basicos?.dias_resolucion ?? "—"}</p>
        </CardContent>
      </Card>

      {/* Sección SLA */}
      <Card className="border border-gray-200 shadow-md bg-blue-50">
        <CardHeader className="flex items-center gap-2">
          <Clock className="text-blue-700" />
          <CardTitle className="text-lg font-semibold text-blue-800">
            Monitoreo SLA
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-gray-700">
          <p> <strong>Horas restantes para respuesta:</strong> {sla?.hrs_resp_restantes ?? "N/A"} h</p>
          <p> <strong>Horas restantes para resolución:</strong> {sla?.hrs_resol_restantes ?? "N/A"} h</p>
          <p> <strong>Cumplió SLA de respuesta:</strong> {basicos?.cumplio_sla_respuesta ? "Sí" : "No"}</p>
          <p> <strong>Cumplió SLA de resolución:</strong> {basicos?.cumplio_sla_resolucion ? "Sí" : "No"}</p>
        </CardContent>
      </Card>

      {/* Historial como línea de tiempo */}
      <Card className="border border-gray-200 shadow-md">
        <CardHeader className="flex items-center gap-2">
          <MessageSquare className="text-purple-700" />
          <CardTitle className="text-lg font-semibold text-purple-800">
            Historial de Estados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historial && historial.length > 0 ? (
            <div className="relative border-l-4 border-purple-400 ml-4 space-y-6">
              {historial.map((h, i) => (
                <div key={i} className="ml-6 relative">
                  <span className="absolute -left-3 top-1.5 w-5 h-5 rounded-full bg-purple-500 border-2 border-white shadow"></span>
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {new Date(h.fecha).toLocaleString("es-CR")}
                      </span>
                      <Badge className={`${estadoColors[h.estado] || "bg-gray-400"} text-white`}>
                        {h.estado}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-700">
                      <User className="inline-block w-4 h-4 mr-1 text-gray-500" />
                      {h.usuario}
                    </p>
                    <p className="mt-2 text-gray-600 text-sm italic">
                      “{h.observaciones || "Sin observaciones"}”
                    </p>

                    {h.imagenes && h.imagenes.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {h.imagenes.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.ruta}
                            alt={img.descripcion || "Evidencia"}
                            className="rounded-lg border border-gray-300 shadow-sm hover:scale-105 transition-transform"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Sin historial registrado.</p>
          )}
        </CardContent>
      </Card>

      {/* Valoración */}
      {valoracion && (
        <Card className="border border-gray-200 shadow-md bg-yellow-50">
          <CardHeader className="flex items-center gap-2">
            <Star className="text-yellow-600" />
            <CardTitle className="text-lg font-semibold text-yellow-700">
              Valoración del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700">
            <p><strong>Puntaje:</strong> {valoracion.puntaje} / 5 ⭐</p>
            <p><strong>Comentario:</strong> {valoracion.comentario || "Sin comentario"}</p>
          </CardContent>
        </Card>
      )}

      {/* Botón de regreso */}
      <div className="flex justify-start mt-6">
        <Button
          variant="outline"
          className="bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" /> Regresar
        </Button>
      </div>
    </div>
  );
}
