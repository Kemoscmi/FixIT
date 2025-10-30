// components/Tickets/DetailTicket.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TicketService from "../../services/TicketService";
import useAuthStore from "../../auth/store/auth.store";
import {
  FileText,
  User,
  MessageSquare,
  Star,
  Clock,
  RefreshCcw,
  CheckCircle,
  ArrowLeftCircle,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
  const [imagenes, setImagenes] = useState([]); // 🖼️ imágenes a subir

  // 🔹 Cargar ticket
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

  // 🎨 Colores según estado
  const estadoColors = {
    Pendiente: "bg-blue-50 text-blue-800 border-blue-200",
    Asignado: "bg-sky-100 text-sky-800 border-sky-300",
    "En Proceso": "bg-indigo-100 text-indigo-800 border-indigo-300",
    Resuelto: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Cerrado: "bg-rose-100 text-rose-800 border-rose-300",
  };

  // 🔄 Actualizar estado con carga opcional de imágenes
  const handleActualizarEstado = async () => {
    if (!nuevoEstado)
      return alert("⚠️ Selecciona un estado antes de confirmar.");

    try {
      // 1️⃣ Actualizar estado
      const res = await TicketService.updateEstado({
        ticket_id: basicos.id,
        nuevo_estado_id:
          nuevoEstado === "Pendiente"
            ? 1
            : nuevoEstado === "Asignado"
            ? 2
            : nuevoEstado === "En Proceso"
            ? 3
            : nuevoEstado === "Resuelto"
            ? 4
            : nuevoEstado === "Cerrado"
            ? 5
            : 1,
        usuario_id: userId,
      });

      // 2️⃣ Subir imágenes si existen
      if (imagenes.length > 0 && res.data?.historial_id) {
        await TicketService.uploadImagenes(res.data.historial_id, imagenes);
      }

      // 3️⃣ Refrescar ticket actualizado
      const refreshed = await TicketService.getTicketById(id, { rolId, userId });
      setData(refreshed.data?.data || {});
      setOpenModal(false);
      setImagenes([]);
      alert("✅ Estado actualizado correctamente");
    } catch (err) {
      console.error(err);
      alert("❌ Error al actualizar el estado del ticket");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 py-12">
      <div className="max-w-5xl mx-auto bg-white/70 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border border-blue-100">
        {/* 🔹 Encabezado */}
        <div className="relative h-40 bg-gradient-to-r from-blue-700 to-blue-900">
          <div className="absolute bottom-0 left-8 translate-y-[20%] flex items-center gap-4">
            <div className="w-28 h-28 bg-white border-4 border-blue-800 rounded-full flex items-center justify-center shadow-lg">
              <FileText className="h-12 w-12 text-blue-700" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-3xl font-bold text-white drop-shadow">
                Ticket #{basicos?.id}
              </h2>
              <p className="text-blue-100 italic">
                {basicos?.titulo || "Sin título"}
              </p>
            </div>
          </div>
        </div>

        {/* 🔹 Contenido */}
        <div className="p-8 mt-6 space-y-8">
          {/* Estado principal */}
          <div className="flex justify-between items-center">
            <Badge
              className={`${
                estadoColors[basicos?.estado] ||
                "bg-gray-200 text-gray-700 border-gray-300"
              } border font-semibold text-base px-4 py-1.5`}
            >
              {basicos?.estado}
            </Badge>
            <p className="text-gray-500 text-sm">
              Creado el{" "}
              {basicos?.fecha_creacion
                ? new Date(basicos.fecha_creacion).toLocaleString("es-CR")
                : "fecha desconocida"}
            </p>
          </div>

          {/* 📋 Datos del Ticket */}
          <div className="grid md:grid-cols-2 gap-6 text-gray-700">
            <p>
              <strong className="text-blue-900">Descripción:</strong>{" "}
              {basicos?.descripcion}
            </p>
            <p>
              <strong className="text-blue-900">Categoría:</strong>{" "}
              {basicos?.categoria}
            </p>
            <p>
              <strong className="text-blue-900">Prioridad:</strong>{" "}
              {basicos?.prioridad}
            </p>
            <p>
              <strong className="text-blue-900">Solicitante:</strong>{" "}
              {basicos?.solicitante}
            </p>
            <p>
              <strong className="text-blue-900">Días de resolución:</strong>{" "}
              {basicos?.dias_resolucion ?? "—"}
            </p>
          </div>

          {/* ⏱️ SLA */}
          <div className="bg-blue-50 rounded-lg p-6 shadow-inner border border-blue-100">
            <h3 className="text-xl font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <Clock className="text-blue-600" /> Monitoreo SLA
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-gray-700">
              <p>
                <strong>Horas restantes para respuesta:</strong>{" "}
                {sla?.hrs_resp_restantes ?? "N/A"} h
              </p>
              <p>
                <strong>Horas restantes para resolución:</strong>{" "}
                {sla?.hrs_resol_restantes ?? "N/A"} h
              </p>
              <p>
                <strong>Cumplió SLA de respuesta:</strong>{" "}
                {basicos?.cumplio_sla_respuesta ? "✅ Sí" : "❌ No"}
              </p>
              <p>
                <strong>Cumplió SLA de resolución:</strong>{" "}
                {basicos?.cumplio_sla_resolucion ? "✅ Sí" : "❌ No"}
              </p>
            </div>
          </div>

          {/* 🧩 Historial */}
          <div className="bg-indigo-50 rounded-lg p-6 shadow-inner border border-indigo-100">
            <h3 className="text-xl font-semibold text-indigo-700 mb-3 flex items-center gap-2">
              <MessageSquare className="text-indigo-600" /> Historial de Estados
            </h3>
            {historial && historial.length > 0 ? (
              <div className="relative border-l-4 border-indigo-400 ml-4 space-y-6">
                {historial.map((h, i) => (
                  <div key={i} className="ml-6 relative">
                    <span className="absolute -left-3 top-1.5 w-5 h-5 rounded-full bg-indigo-500 border-2 border-white shadow"></span>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {new Date(h.fecha).toLocaleString("es-CR")}
                        </span>
                        <Badge
                          className={`${
                            estadoColors[h.estado] || "bg-gray-300"
                          } text-white`}
                        >
                          {h.estado}
                        </Badge>
                      </div>

                      <p className="mt-1 text-sm text-gray-700 flex items-center gap-1">
                        <User className="w-4 h-4 text-gray-500" /> {h.usuario}
                      </p>

                      <p className="mt-2 text-gray-600 text-sm italic">
                        “{h.observaciones || "Sin observaciones"}”
                      </p>

                      {/* 🖼️ Mostrar imágenes del historial */}
                      {h.imagenes && h.imagenes.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {h.imagenes.map((img, idx) => (
                            <div
                              key={idx}
                              className="border rounded-lg overflow-hidden hover:scale-105 transition-transform"
                            >
                              <img
                                src={`http://localhost:81/Proyecto/${img.ruta}`}
                                alt={img.descripcion || "Evidencia"}
                                className="object-cover w-full h-28"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                Sin historial registrado.
              </p>
            )}
          </div>

          {/* ⭐ Valoración */}
          {valoracion && (
            <div className="bg-yellow-50 rounded-lg p-6 shadow-inner border border-yellow-100">
              <h3 className="text-xl font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                <Star className="text-yellow-500" /> Valoración del Cliente
              </h3>
              <p>
                <strong>Puntaje:</strong> {valoracion.puntaje} / 5 ⭐
              </p>
              <p>
                <strong>Comentario:</strong>{" "}
                {valoracion.comentario || "Sin comentario"}
              </p>
            </div>
          )}

          {/* 🔙 Botones */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:scale-105 transition-all shadow-sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftCircle className="h-5 w-5 text-blue-700" /> Volver
            </Button>

            {/* 🟦 Modal actualizar estado */}
            <Dialog open={openModal} onOpenChange={setOpenModal}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-700 to-blue-900 text-white flex items-center gap-2 hover:scale-105 transition-all shadow">
                  <RefreshCcw className="w-4 h-4" /> Actualizar estado
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Actualizar estado del Ticket</DialogTitle>
                  <DialogDescription>
                    Selecciona un nuevo estado y evidencia (opcional).
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

                {/* 🖼️ Subida de imágenes */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" /> Imágenes del estado
                    (opcional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImagenes([...e.target.files])}
                    className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400">
                    Puedes subir capturas o evidencias del estado actual del
                    ticket.
                  </p>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenModal(false)}>
                    Cancelar
                  </Button>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                    onClick={handleActualizarEstado}
                  >
                    <CheckCircle className="w-4 h-4" /> Confirmar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
