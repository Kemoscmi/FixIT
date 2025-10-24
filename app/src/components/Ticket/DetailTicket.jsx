import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TicketService from "../../services/TicketService";
import useAuthStore from "../../auth/store/auth.store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import {
  Clock,
  User,
  MessageSquare,
  Star,
  ArrowLeft,
  FileText,
  RefreshCcw,
  CheckCircle,
} from "lucide-react";

// ✅ Shadcn modal components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function DetailTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const rolId = user?.rol_id;
  const userId = user?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState("");

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
  if (!data)
    return (
      <ErrorAlert title="Sin datos" message="Ticket no encontrado o no accesible." />
    );

  const { basicos, sla, historial, valoracion } = data;

  // 💙 Colores profesionales
  const estadoColors = {
    Pendiente: "bg-blue-50 text-blue-800 border-blue-200",
    Asignado: "bg-sky-100 text-sky-800 border-sky-300",
    "En Proceso": "bg-indigo-100 text-indigo-800 border-indigo-300",
    Resuelto: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Cerrado: "bg-rose-100 text-rose-800 border-rose-300",
  };

  // 💾 Simulación del cambio de estado
 const handleActualizarEstado = async () => {
  if (!nuevoEstado) return;

  try {
    const res = await TicketService.updateEstado({
      ticket_id: basicos.id,
      nuevo_estado_id:
        nuevoEstado === "Pendiente" ? 1 :
        nuevoEstado === "Asignado" ? 2 :
        nuevoEstado === "En Proceso" ? 3 :
        nuevoEstado === "Resuelto" ? 4 :
        nuevoEstado === "Cerrado" ? 5 : 1,
      usuario_id: userId,
    });

    if (res.status === 200) {
      setData((prev) => ({
        ...prev,
        basicos: { ...prev.basicos, estado: nuevoEstado },
      }));
      setOpenModal(false);
      alert("✅ Estado actualizado correctamente");
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error al actualizar el estado del ticket");
  }
};

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 bg-gradient-to-b from-white to-blue-50 rounded-2xl shadow-sm">
      {/* 🧾 ENCABEZADO */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-[#0A2540] flex items-center gap-2">
          <FileText className="w-7 h-7 text-blue-600" />
          Ticket #{basicos?.id}
        </h1>
        <Badge
          className={`${estadoColors[basicos?.estado] || "bg-gray-200 text-gray-700"} border font-semibold text-base px-4 py-1.5`}
        >
          {basicos?.estado}
        </Badge>
      </div>
      <p className="text-gray-500 text-sm">
        Creado el{" "}
        {basicos?.fecha_creacion
          ? new Date(basicos.fecha_creacion).toLocaleString("es-CR")
          : "fecha desconocida"}
      </p>

      {/* 📘 DETALLES */}
      <Card className="border border-blue-100 shadow-lg bg-white/90 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-blue-800 flex items-center gap-2">
            <FileText className="text-blue-600" /> Detalles del Ticket
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 text-gray-700 leading-relaxed">
          <p><strong className="text-blue-900">Título:</strong> {basicos?.titulo}</p>
          <p><strong className="text-blue-900">Descripción:</strong> {basicos?.descripcion}</p>
          <p><strong className="text-blue-900">Categoría:</strong> {basicos?.categoria}</p>
          <p><strong className="text-blue-900">Prioridad:</strong> {basicos?.prioridad}</p>
          <p><strong className="text-blue-900">Solicitante:</strong> {basicos?.solicitante}</p>
          <p><strong className="text-blue-900">Días de resolución:</strong> {basicos?.dias_resolucion ?? "—"}</p>
        </CardContent>
      </Card>

      {/* ⏱️ SLA */}
      <Card className="border border-blue-200 shadow-md bg-gradient-to-r from-blue-50 to-sky-100">
        <CardHeader className="flex items-center gap-2">
          <Clock className="text-blue-600" />
          <CardTitle className="text-lg font-semibold text-blue-900">
            Monitoreo SLA
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-gray-700">
          <p><strong>Horas restantes para respuesta:</strong> {sla?.hrs_resp_restantes ?? "N/A"} h</p>
          <p><strong>Horas restantes para resolución:</strong> {sla?.hrs_resol_restantes ?? "N/A"} h</p>
          <p><strong>Cumplió SLA de respuesta:</strong> {basicos?.cumplio_sla_respuesta ? "✅ Sí" : "❌ No"}</p>
          <p><strong>Cumplió SLA de resolución:</strong> {basicos?.cumplio_sla_resolucion ? "✅ Sí" : "❌ No"}</p>
        </CardContent>
      </Card>

      {/* 💬 HISTORIAL */}
      <Card className="border border-indigo-100 shadow-md bg-white/95">
        <CardHeader className="flex items-center gap-2">
          <MessageSquare className="text-indigo-600" />
          <CardTitle className="text-lg font-semibold text-indigo-800">
            Historial de Estados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historial && historial.length > 0 ? (
            <div className="relative border-l-4 border-indigo-400 ml-4 space-y-6">
              {historial.map((h, i) => (
                <div key={i} className="ml-6 relative">
                  <span className="absolute -left-3 top-1.5 w-5 h-5 rounded-full bg-indigo-500 border-2 border-white shadow"></span>
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {new Date(h.fecha).toLocaleString("es-CR")}
                      </span>
                      <Badge
                        className={`${estadoColors[h.estado] || "bg-gray-400"} text-white font-medium`}
                      >
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">Sin historial registrado.</p>
          )}
        </CardContent>
      </Card>

      {/* ⭐ VALORACIÓN */}
      {valoracion && (
        <Card className="border border-blue-100 shadow-md bg-gradient-to-r from-sky-50 to-indigo-50">
          <CardHeader className="flex items-center gap-2">
            <Star className="text-yellow-500" />
            <CardTitle className="text-lg font-semibold text-blue-900">
              Valoración del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700">
            <p><strong>Puntaje:</strong> {valoracion.puntaje} / 5 ⭐</p>
            <p><strong>Comentario:</strong> {valoracion.comentario || "Sin comentario"}</p>
          </CardContent>
        </Card>
      )}

      {/* 🔙 BOTONES */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          className="bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2 border border-gray-300"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Button>

        {/* 🔵 MODAL DE ACTUALIZAR ESTADO */}
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2">
              <RefreshCcw className="w-4 h-4" />
              Actualizar estado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Actualizar estado del Ticket</DialogTitle>
              <DialogDescription>
                Selecciona un nuevo estado para el ticket #{basicos?.id}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <Select onValueChange={(value) => setNuevoEstado(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un nuevo estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Asignado">Asignado</SelectItem>
                  <SelectItem value="En Proceso">En Proceso</SelectItem>
                  <SelectItem value="Resuelto">Resuelto</SelectItem>
                  <SelectItem value="Cerrado">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenModal(false)}>
                Cancelar
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                onClick={handleActualizarEstado}
              >
                <CheckCircle className="w-4 h-4" />
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

}
