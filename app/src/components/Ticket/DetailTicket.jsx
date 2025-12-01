// ============================================================
// COMPONENTE: DetailTicket.jsx
// Descripción:
//   Muestra la información detallada de un ticket específico.
//   Incluye descripción, historial de estados, monitoreo de SLA,
//   valoración del cliente, y permite actualizar el estado
//   (con observaciones e imágenes de evidencia).
// ============================================================

import React, { useEffect, useState } from "react"; 
import { useParams, useNavigate } from "react-router-dom"; 
import TicketService from "../../services/TicketService"; 
import useAuthStore from "../../auth/store/auth.store"; 
import toast from "react-hot-toast";
import AsignacionService from "../../services/AsignacionService";
import { PlusCircle } from "lucide-react";

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
  MessageCircle,
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
  const [imagenes, setImagenes] = useState([]);
  const [observaciones, setObservaciones] = useState("");

  const [modalManual, setModalManual] = useState(false);
  const [tecnicos, setTecnicos] = useState([]);
  const [tecnicoId, setTecnicoId] = useState("");
  const [justManual, setJustManual] = useState("");

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

  const estadoColors = {
    Pendiente: "bg-blue-50 text-blue-800 border-blue-200",
    Asignado: "bg-sky-100 text-sky-800 border-sky-300",
    "En Proceso": "bg-indigo-100 text-indigo-800 border-indigo-300",
    Resuelto: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Cerrado: "bg-rose-100 text-rose-800 border-rose-300",
  };

  const handleActualizarEstado = async () => {
    const siguiente = getNextState(basicos.estado);

    if (!siguiente) return toast.error("⚠️ No hay más estados disponibles.");
    if (!observaciones.trim()) return toast.error("⚠️ Debes agregar observaciones.");
    if (imagenes.length === 0) return toast.error("⚠️ Debes subir mínimo una imagen.");

    try {
      const formData = new FormData();
      formData.append("ticket_id", basicos.id);
      formData.append("nuevo_estado_id", siguiente.id);
      formData.append("usuario_id", userId);
      formData.append("observaciones", observaciones);

      imagenes.forEach((file) => formData.append("imagenes[]", file));

      const res = await TicketService.updateEstado(formData);

      if (res.data?.success) {
        const refreshed = await TicketService.getTicketById(id, { rolId, userId });
        setData(refreshed.data?.data || {});
        setOpenModal(false);
        setImagenes([]);
        setObservaciones("");

        toast.success("Estado actualizado");
      } else {
        toast.error("No se pudo actualizar el estado");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error en la actualización");
    }
  };

  const getNextState = (estadoActual) => {
    const flujo = {
      "Pendiente": { id: 2, nombre: "Asignado" },
      "Asignado": { id: 3, nombre: "En Proceso" },
      "En Proceso": { id: 4, nombre: "Resuelto" },
      "Resuelto": { id: 5, nombre: "Cerrado" },
      "Cerrado": null,
    };

    return flujo[estadoActual] || null;
  };

  const cargarTecnicos = async () => {
    try {
      const res = await AsignacionService.getTecnicosByTicket(basicos.id);

      console.log("Tecnicos cargados:", res.data);

      setTecnicos(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando técnicos");
    }
  };

  const handleAsignacionManual = async () => {
    if (!tecnicoId) return toast.error("Seleccione un técnico");
    if (!justManual.trim()) return toast.error("Debe agregar justificación");

    try {
      const res = await AsignacionService.asignarManual({
        ticket_id: basicos.id,
        tecnico_id: tecnicoId,
        justificacion: justManual,
      });

      if (res.data?.success) {
        toast.success("Asignación manual realizada");
        setModalManual(false);
        setTecnicoId("");
        setJustManual("");

        const refreshed = await TicketService.getTicketById(id, { rolId, userId });
        setData(refreshed.data?.data || {});
      } else {
        toast.error("No se pudo asignar manualmente");
      }
    } catch {
      toast.error("Error en asignación manual");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 py-12">
      <div className="max-w-5xl mx-auto bg-white/70 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border border-blue-100">

        {/* ENCABEZADO */}
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

        {/* CUERPO */}
        <div className="p-8 mt-6 space-y-8">

          {/* Estado */}
          <div className="flex justify-between items-center">
            <Badge
              className={`${estadoColors[basicos?.estado] ||
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

          {/* Datos básicos */}
          <div className="grid md:grid-cols-2 gap-6 text-gray-700">
            <p><strong className="text-blue-900">Descripción:</strong> {basicos?.descripcion}</p>
            <p><strong className="text-blue-900">Categoría:</strong> {basicos?.categoria}</p>
            <p><strong className="text-blue-900">Prioridad:</strong> {basicos?.prioridad}</p>
            <p><strong className="text-blue-900">Solicitante:</strong> {basicos?.solicitante}</p>
            <p><strong className="text-blue-900">Días de resolución:</strong> {basicos?.dias_resolucion ?? "—"}</p>
          </div>

          {/* SLA */}
          <div className="bg-blue-50 rounded-lg p-6 shadow-inner border border-blue-100">
            <h3 className="text-xl font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <Clock className="text-blue-600" /> Monitoreo SLA
            </h3>

            <div className="grid md:grid-cols-2 gap-4 text-gray-700">
              <p><strong>Horas restantes para respuesta:</strong> {sla?.hrs_resp_restantes ?? "N/A"} h</p>
              <p><strong>Horas restantes para resolución:</strong> {sla?.hrs_resol_restantes ?? "N/A"} h</p>
              <p><strong>Cumplió SLA de respuesta:</strong> {basicos?.cumplio_sla_respuesta ? "✅ Sí" : "❌ No"}</p>
              <p><strong>Cumplió SLA de resolución:</strong> {basicos?.cumplio_sla_resolucion ? "✅ Sí" : "❌ No"}</p>
            </div>
          </div>

{/* Fórmulas SLA */}
<div className="bg-white p-3 rounded-lg mt-4 border border-blue-200">
  <p>
    <strong>Fórmula Tiempo Máximo Permitido:</strong><br />
    (Fecha límite − Fecha de creación) ÷ 60 = minutos permitidos
  </p>

  <p className="mt-2">
    <strong>Fórmula Tiempo Real:</strong><br />
    (Fecha de respuesta/resolución − Fecha de creación) ÷ 60 = minutos reales
  </p>

  <p className="mt-2">
    <strong>Fórmula Horas Restantes:</strong><br />
    (Fecha límite − Fecha actual) ÷ 60 = minutos restantes → ÷ 60 = horas restantes
  </p>
</div>

          {/* Historial */}
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
                          className={`${estadoColors[h.estado] || "bg-gray-300"} text-white`}
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
                                onError={(e) => (e.target.src = "/no-image.png")}
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
              <p className="text-gray-500 text-sm italic">Sin historial registrado.</p>
            )}
          </div>

          {/* Valoración */}
          {valoracion && (
            <div className="bg-yellow-50 rounded-lg p-6 shadow-inner border border-yellow-100">
              <h3 className="text-xl font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                <Star className="text-yellow-500" /> Valoración del Cliente
              </h3>
              <p><strong>Puntaje:</strong> {valoracion.puntaje} / 5 ⭐</p>
              <p><strong>Comentario:</strong> {valoracion.comentario || "Sin comentario"}</p>
            </div>
          )}

          {/* Botones finales */}
<div className="flex justify-between items-center gap-3 mt-6">

  {/* Volver */}
  <Button
    variant="outline"
    className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:scale-105 transition-all shadow-sm"
    onClick={() => navigate(-1)}
  >
    <ArrowLeftCircle className="h-5 w-5 text-blue-700" /> Volver
  </Button>

  {/* ⭐⭐⭐ ASIGNACIÓN MANUAL — SOLO SI EL TICKET ESTÁ PENDIENTE ⭐⭐⭐ */}
  {basicos?.estado === "Pendiente" && (
    <Dialog open={modalManual} onOpenChange={setModalManual}>
      <DialogTrigger asChild>
        <Button
          onClick={cargarTecnicos}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow"
        >
          <PlusCircle className="w-4 h-4" />
          Asignación Manual
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asignación Manual</DialogTitle>
          <DialogDescription>
            Seleccione un técnico y agregue una justificación.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-3">

          <div>
            <label className="text-sm font-medium">Técnico</label>
            <Select onValueChange={(v) => setTecnicoId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un técnico" />
              </SelectTrigger>

              <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-lg p-2 text-gray-800">
                {tecnicos.map((t) => (
                  <SelectItem
                    key={t.id}
                    value={t.id.toString()}
                    className="cursor-pointer hover:bg-gray-100 rounded-md px-3 py-2"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-gray-900 text-sm">
                        {t.nombre}
                      </span>

                      <div className="flex items-center gap-2 text-xs font-medium">

                        <span
                          className={`
                            px-2 py-0.5 rounded-full text-white 
                            ${t.estado === "Disponible" ? "bg-green-600" : "bg-red-600"}
                          `}
                        >
                          {t.estado}
                        </span>

                        <span
                          className={`
                            px-2 py-0.5 rounded-full text-white
                            ${
                              t.carga <= 1
                                ? "bg-emerald-500"
                                : t.carga <= 3
                                ? "bg-amber-500"
                                : "bg-red-700"
                            }
                          `}
                        >
                          Carga: {t.carga}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Justificación</label>
            <textarea
              rows="3"
              value={justManual}
              onChange={(e) => setJustManual(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 text-sm"
            ></textarea>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setModalManual(false)}>
            Cancelar
          </Button>

          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={handleAsignacionManual}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )}

  {/* Actualizar estado */}
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
          El flujo de estado es automático. Agregue observaciones e imágenes.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">

        <div className="bg-blue-50 p-3 rounded-lg border">
          <p className="text-sm text-gray-700">
            Estado actual: <b>{basicos.estado}</b>
          </p>

          <p className="text-sm text-gray-700">
            Siguiente estado permitido:{" "}
            <b>{getNextState(basicos.estado)?.nombre || "No disponible"}</b>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
            <MessageCircle className="w-4 h-4" /> Observaciones
          </label>

          <textarea
            rows="3"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
            <ImageIcon className="w-4 h-4" /> Evidencia
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImagenes([...e.target.files])}
            className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
          />
        </div>
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
