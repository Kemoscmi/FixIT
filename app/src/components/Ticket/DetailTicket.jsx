// ============================================================
// COMPONENTE: DetailTicket.jsx
// ============================================================

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TicketService from "../../services/TicketService";
import useAuthStore from "../../auth/store/auth.store";
import toast from "react-hot-toast";

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

// Dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

// Select
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// ⭐ i18n
import { useI18n } from "@/hooks/useI18n";

// ============================================================
// COMPONENTE
// ============================================================
export function DetailTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useI18n();

  const rolId = user?.rol_id;
  const userId = user?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [imagenes, setImagenes] = useState([]);
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await TicketService.getTicketById(id, { rolId, userId });
        setData(res.data?.data || {});
      } catch (err) {
        console.error(err);
        setError(t("tickets.detail.error"));
      } finally {
        setLoading(false);
      }
    };

    if (id && rolId && userId) fetchTicket();
  }, [id, rolId, userId, t]);

  if (loading) return <LoadingGrid />;
  if (error) return <ErrorAlert title={t("alerts.error")} message={error} />;
  if (!data)
    return (
      <ErrorAlert title={t("tickets.detail.notFound")} message={t("tickets.detail.noData")} />
    );

  const { basicos, sla, historial, valoracion } = data;

  const estadoColors = {
    Pendiente: "bg-blue-50 text-blue-800 border-blue-200",
    Asignado: "bg-sky-100 text-sky-800 border-sky-300",
    "En Proceso": "bg-indigo-100 text-indigo-800 border-indigo-300",
    Resuelto: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Cerrado: "bg-rose-100 text-rose-800 border-rose-300",
  };

  const handleActualizarEstado = async () => {
    if (!nuevoEstado)
      return toast.error(t("tickets.detail.mustSelectState"), {
        position: "top-center",
        duration: 3000,
      });

    try {
      const formData = new FormData();
      formData.append("ticket_id", basicos.id);
      formData.append("nuevo_estado_id", getEstadoId(nuevoEstado));
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
        setNuevoEstado("");

        toast.success(t("tickets.detail.stateUpdated"));
      } else {
        toast.error(t("tickets.detail.stateUpdateFail"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("tickets.detail.stateUpdateFail"));
    }
  };

  const getEstadoId = (estado) => {
    switch (estado) {
      case "Pendiente":
        return 1;
      case "Asignado":
        return 2;
      case "En Proceso":
        return 3;
      case "Resuelto":
        return 4;
      case "Cerrado":
        return 5;
      default:
        return 1;
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
                {t("tickets.detail.ticket")} #{basicos?.id}
              </h2>
              <p className="text-blue-100 italic">
                {basicos?.titulo || t("tickets.fields.title")}
              </p>
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="p-8 mt-6 space-y-8">
          {/* Estado */}
          <div className="flex justify-between items-center">
            <Badge
              className={`${
                estadoColors[basicos?.estado] || "bg-gray-200 text-gray-700 border-gray-300"
              } border font-semibold text-base px-4 py-1.5`}
            >
              {basicos?.estado}
            </Badge>

            <p className="text-gray-500 text-sm">
              {t("tickets.fields.createdAt")}{" "}
              {basicos?.fecha_creacion
                ? new Date(basicos.fecha_creacion).toLocaleString()
                : t("tickets.detail.unknownDate")}
            </p>
          </div>

          {/* Información básica */}
          <div className="grid md:grid-cols-2 gap-6 text-gray-700">
            <p>
              <strong>{t("tickets.fields.description")}:</strong> {basicos?.descripcion}
            </p>

            <p>
              <strong>{t("tickets.fields.category")}:</strong> {basicos?.categoria}
            </p>

            <p>
              <strong>{t("tickets.fields.priority")}:</strong> {basicos?.prioridad}
            </p>

            <p>
              <strong>{t("tickets.detail.requester")}:</strong> {basicos?.solicitante}
            </p>

            <p>
              <strong>{t("tickets.detail.resolutionDays")}:</strong>{" "}
              {basicos?.dias_resolucion ?? "—"}
            </p>
          </div>

          {/* SLA */}
          <div className="bg-blue-50 rounded-lg p-6 shadow-inner border border-blue-100">
            <h3 className="text-xl font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <Clock className="text-blue-600" /> {t("tickets.detail.slaMonitor")}
            </h3>

            <div className="grid md:grid-cols-2 gap-4 text-gray-700">
              <p>
                <strong>{t("tickets.detail.slaResp")}: </strong>
                {sla?.hrs_resp_restantes ?? "N/A"} h
              </p>

              <p>
                <strong>{t("tickets.detail.slaResol")}: </strong>
                {sla?.hrs_resol_restantes ?? "N/A"} h
              </p>

              <p>
                <strong>{t("tickets.detail.slaRespMet")}: </strong>
                {basicos?.cumplio_sla_respuesta ? "✅" : "❌"}
              </p>

              <p>
                <strong>{t("tickets.detail.slaResolMet")}: </strong>
                {basicos?.cumplio_sla_resolucion ? "✅" : "❌"}
              </p>
            </div>
          </div>

          {/* Historial */}
          <div className="bg-indigo-50 rounded-lg p-6 shadow-inner border border-indigo-100">
            <h3 className="text-xl font-semibold text-indigo-700 mb-3 flex items-center gap-2">
              <MessageSquare className="text-indigo-600" /> {t("tickets.detail.history")}
            </h3>

            {historial && historial.length > 0 ? (
              <div className="relative border-l-4 border-indigo-400 ml-4 space-y-6">
                {historial.map((h, i) => (
                  <div key={i} className="ml-6 relative">
                    <span className="absolute -left-3 top-1.5 w-5 h-5 rounded-full bg-indigo-500 border-2 border-white shadow"></span>

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {new Date(h.fecha).toLocaleString()}
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
                        “{h.observaciones || t("tickets.detail.noObservations")}”
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
                                alt="Evidencia"
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
              <p className="text-gray-500 text-sm italic">{t("tickets.detail.noHistory")}</p>
            )}
          </div>

          {/* Valoración */}
          {valoracion && (
            <div className="bg-yellow-50 rounded-lg p-6 shadow-inner border border-yellow-100">
              <h3 className="text-xl font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                <Star className="text-yellow-500" /> {t("tickets.detail.rating")}
              </h3>

              <p>
                <strong>{t("tickets.detail.score")}:</strong> {valoracion.puntaje}/5 ⭐
              </p>

              <p>
                <strong>{t("tickets.detail.comment")}:</strong>{" "}
                {valoracion.comentario || t("tickets.detail.noComment")}
              </p>
            </div>
          )}

          {/* BOTONES */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:scale-105 transition-all shadow-sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftCircle className="h-5 w-5 text-blue-700" /> {t("buttons.back")}
            </Button>

            {/* MODAL */}
            <Dialog open={openModal} onOpenChange={setOpenModal}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-700 to-blue-900 text-white flex items-center gap-2 hover:scale-105 transition-all shadow">
                  <RefreshCcw className="w-4 h-4" /> {t("tickets.detail.updateState")}
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t("tickets.detail.updateState")}</DialogTitle>
                  <DialogDescription>
                    {t("tickets.detail.updateStateDesc")}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  {/* Estado */}
                  <Select onValueChange={(value) => setNuevoEstado(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("tickets.detail.selectState")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Asignado">Asignado</SelectItem>
                      <SelectItem value="En Proceso">En Proceso</SelectItem>
                      <SelectItem value="Resuelto">Resuelto</SelectItem>
                      <SelectItem value="Cerrado">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Observaciones */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" /> {t("tickets.detail.observations")}
                    </label>

                    <textarea
                      rows="3"
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("tickets.detail.observationsPlaceholder")}
                    ></textarea>
                  </div>

                  {/* Imágenes */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" /> {t("tickets.detail.images")}
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setImagenes([...e.target.files])}
                      className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <p className="text-xs text-gray-400">
                      {t("tickets.detail.imagesHint")}
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenModal(false)}>
                    {t("buttons.cancel")}
                  </Button>

                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                    onClick={handleActualizarEstado}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t("tickets.detail.confirm")}
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
