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

import { useI18n } from "@/hooks/useI18n";
import { useLocaleDate } from "@/hooks/useLocaleDate";
import { format } from "date-fns";

export function DetailTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useI18n();
  const locale = useLocaleDate();

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
const [imgPreview, setImgPreview] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await TicketService.getTicketById(id, { rolId, userId });
        setData(res.data?.data || {});
      } catch (err) {
        console.error("Error al obtener ticket:", err);
        setError(t("tickets.detail.error"));
      } finally {
        setLoading(false);
      }
    };

    if (id && rolId && userId) fetchTicket();
  }, [id, rolId, userId, t]);

  if (loading) return <LoadingGrid />;
  if (error) return <ErrorAlert title={t("tickets.detail.error")} message={error} />;
  if (!data)
    return (
      <ErrorAlert
        title={t("tickets.detail.noData")}
        message={t("tickets.detail.notFound")}
      />
    );

  const { basicos, sla, historial, valoracion } = data;

//colores de los estados 
 const estadoColors = {
  Pendiente: "bg-blue-600 text-white border-blue-800",
  Asignado: "bg-sky-600 text-white border-sky-800",
  "En Proceso": "bg-indigo-600 text-white border-indigo-800",
  Resuelto: "bg-emerald-600 text-white border-emerald-800",
  Cerrado: "bg-rose-600 text-white border-rose-800",
};


  //ESTE es el metodo para obligue la sistema a seguir este flujo
  //se hace en el frontend porque el frontend es el que guia el flujo de todo 

  const getNextState = (estadoActual) => {
    const flujo = {
      Pendiente: { id: 2, nombre: "Asignado" },
      Asignado: { id: 3, nombre: "En Proceso" },
      "En Proceso": { id: 4, nombre: "Resuelto" },
      Resuelto: { id: 5, nombre: "Cerrado" },
      Cerrado: null,
    };

    return flujo[estadoActual] || null;
  };

  // Actualizar estado  

  const handleActualizarEstado = async () => {
  const siguiente = getNextState(basicos.estado);


  if (!siguiente) {
    return toast.error( t("tickets.detail.errors.noMoreStates"));
  }
  setOpenModal(false);

toast.loading(t("tickets.detail.updateDialog.updatingState"), { id: "upd" });

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

      setImagenes([]);
      setObservaciones("");

    } else {
      toast.error(t("tickets.detail.errors.updateFailed"), { id: "upd" });
    }
  } catch (err) {
    console.error(err);
    toast.error(t("tickets.detail.errors.updateError"), { id: "upd" });
  }
};


  // Cargar técnicos para asignación manual

  const cargarTecnicos = async () => {
    try {
      const res = await AsignacionService.getTecnicosByTicket(basicos.id);
      setTecnicos(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error(t("assignmentsManual.errorLoadTechs"));
    }
  };

  // Asignación manual

  const handleAsignacionManual = async () => {
    if (!tecnicoId) {
      return toast.error(t("assignmentsManual.selectTechnician"));
    }
    if (!justManual.trim()) {
      return toast.error(t("assignmentsManual.requireJustification"));
    }

    try {
      const res = await AsignacionService.asignarManual({
        ticket_id: basicos.id,
        tecnico_id: tecnicoId,
        justificacion: justManual,
      });

      if (res.data?.success) {
        toast.success(t("assignmentsManual.success"));
        setModalManual(false);
        setTecnicoId("");
        setJustManual("");

        const refreshed = await TicketService.getTicketById(id, { rolId, userId });
        setData(refreshed.data?.data || {});
      } else {
        toast.error(t("assignmentsManual.errorAssign"));
      }
    } catch {
      toast.error(t("assignmentsManual.errorAssignGeneric"));
    }
  };

  // RENDER

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
                {basicos?.titulo || t("tickets.create.noName")}
              </p>
            </div>
          </div>
        </div>

        {/* CUERPO */}
        <div className="p-8 mt-6 space-y-8">

          {/* Estado + fecha */}
          <div className="flex justify-between items-center">
           <Badge
  className={`
    ${estadoColors[basicos?.estado] || "bg-gray-200 text-gray-700 border-gray-300"}
    border-2 font-bold text-lg px-5 py-2 rounded-full shadow-md tracking-wide
  `}
>
  {basicos?.estado}
</Badge>


            <p className="text-gray-500 text-sm">
              {basicos?.fecha_creacion
                ? `${t("tickets.detail.createdOn")} ${
                    format(new Date(basicos.fecha_creacion), "Pp", { locale })
                  }`
                : t("tickets.detail.unknownDate")}
            </p>
          </div>

          {/* Datos básicos */}
          <div className="grid md:grid-cols-2 gap-6 text-gray-700">
            <p>
              <strong className="text-blue-900">
                {t("tickets.fields.description")}:
              </strong>{" "}
              {basicos?.descripcion}
            </p>

            <p>
              <strong className="text-blue-900">
                {t("tickets.fields.category")}:
              </strong>{" "}
              {basicos?.categoria}
            </p>

            <p>
              <strong className="text-blue-900">
                {t("tickets.fields.priority")}:
              </strong>{" "}
              {basicos?.prioridad}
            </p>

            <p>
              <strong className="text-blue-900">
                {t("tickets.detail.requester")}:
              </strong>{" "}
              {basicos?.solicitante}
            </p>

            <p>
              <strong className="text-blue-900">
                {t("tickets.detail.resolutionDays")}:
              </strong>{" "}
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
                <strong>{t("tickets.detail.slaResp")}:</strong>{" "}
                {sla?.hrs_resp_restantes ?? "N/A"} h
              </p>
              <p>
                <strong>{t("tickets.detail.slaResol")}:</strong>{" "}
                {sla?.hrs_resol_restantes ?? "N/A"} h
              </p>
              <p>
                <strong>{t("tickets.detail.slaRespMet")}:</strong>{" "}
                {basicos?.cumplio_sla_respuesta
                  ? `✅ ${t("common.yes")}`
                  : `❌ ${t("common.no")}`}
              </p>
              <p>
                <strong>{t("tickets.detail.slaResolMet")}:</strong>{" "}
                {basicos?.cumplio_sla_resolucion
                  ? `✅ ${t("common.yes")}`
                  : `❌ ${t("common.no")}`}
              </p>
            </div>
          </div>

          {/* Fórmulas SLA */}
          <div className="bg-white p-3 rounded-lg mt-4 border border-blue-200">
            <p>
              <strong>{t("tickets.detail.slaFormulas.maxTitle")}:</strong>
              <br />
              {t("tickets.detail.slaFormulas.maxText")}
            </p>

            <p className="mt-2">
              <strong>{t("tickets.detail.slaFormulas.realTitle")}:</strong>
              <br />
              {t("tickets.detail.slaFormulas.realText")}
            </p>

            <p className="mt-2">
              <strong>{t("tickets.detail.slaFormulas.remainingTitle")}:</strong>
              <br />
              {t("tickets.detail.slaFormulas.remainingText")}
            </p>
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
                          {format(new Date(h.fecha), "Pp", { locale })}
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
  alt={img.descripcion || "Evidencia"}
  onError={(e) => (e.target.src = "/no-image.png")}
  onClick={() => setImgPreview(`http://localhost:81/Proyecto/${img.ruta}`)}
  className="object-cover w-full h-28 cursor-pointer hover:scale-105 transition-transform rounded-lg"
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
                {t("tickets.detail.noHistory")}
              </p>
            )}
          </div>

          {/* Valoración */}
          {valoracion && (
            <div className="bg-yellow-50 rounded-lg p-6 shadow-inner border border-yellow-100">
              <h3 className="text-xl font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                <Star className="text-yellow-500" /> {t("tickets.detail.rating")}
              </h3>
              <p>
                <strong>{t("tickets.detail.score")}:</strong>{" "}
                {valoracion.puntaje} / 5 ⭐
              </p>
              <p>
                <strong>{t("tickets.detail.comment")}:</strong>{" "}
                {valoracion.comentario || t("tickets.detail.noComment")}
              </p>
            </div>
          )}

          {/* BOTONES FINALES */}
          <div className="flex justify-between items-center gap-3 mt-6">

            {/* Volver */}
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:scale-105 transition-all shadow-sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftCircle className="h-5 w-5 text-blue-700" />
              {t("buttons.back")}
            </Button>

            {/* ASIGNACIÓN MANUAL – solo si Pendiente y no cliente */}
            {rolId !== 3 && basicos?.estado === "Pendiente" && (
              <Dialog open={modalManual} onOpenChange={setModalManual}>
                <DialogTrigger asChild>
                  <Button
                    onClick={cargarTecnicos}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow"
                  >
                    <PlusCircle className="w-4 h-4" />
                    {t("assignmentsManual.button")}
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t("assignmentsManual.title")}</DialogTitle>
                    <DialogDescription>
                      {t("assignmentsManual.description")}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 mt-3">
                    <div>
                      <label className="text-sm font-medium">
                        {t("assignmentsManual.technicianLabel")}
                      </label>
                      <Select onValueChange={(v) => setTecnicoId(v)}>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("assignmentsManual.technicianPlaceholder")}
                          />
                        </SelectTrigger>

                        <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-lg p-2 text-gray-800">
                          {tecnicos.map((tTec) => (
                            <SelectItem
                              key={tTec.id}
                              value={tTec.id.toString()}
                              className="cursor-pointer hover:bg-gray-100 rounded-md px-3 py-2"
                            >
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-gray-900 text-sm">
                                  {tTec.nombre}
                                </span>

                                <div className="flex items-center gap-2 text-xs font-medium">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-white ${
                                      tTec.estado === "Disponible"
                                        ? "bg-green-600"
                                        : "bg-red-600"
                                    }`}
                                  >
                                    {tTec.estado}
                                  </span>

                                  <span
                                    className={`
                                      px-2 py-0.5 rounded-full text-white
                                      ${
                                        tTec.carga <= 1
                                          ? "bg-emerald-500"
                                          : tTec.carga <= 3
                                          ? "bg-amber-500"
                                          : "bg-red-700"
                                      }
                                    `}
                                  >
                                    {t("assignmentsManual.workloadLabel")}: {tTec.carga}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        {t("assignmentsManual.justificationLabel")}
                      </label>
                      <textarea
                        rows={3}
                        value={justManual}
                        onChange={(e) => setJustManual(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 text-sm"
                      ></textarea>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setModalManual(false)}>
                      {t("buttons.cancel")}
                    </Button>

                    <Button
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={handleAsignacionManual}
                    >
                      {t("tickets.detail.confirm")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* ACTUALIZAR ESTADO – oculto para clientes OCULTAR ACTUALIZAR ESTADOOOOOOOOOOO SI ESTA PENDIENTEEE*/}
           {rolId !== 3 && basicos?.estado !== "Pendiente" && basicos?.estado !== "Cerrado" && (
  <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-700 to-blue-900 text-white flex items-center gap-2 hover:scale-105 transition-all shadow">
                    <RefreshCcw className="w-4 h-4" />
                    {t("tickets.detail.updateState")}
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t("tickets.detail.updateDialog.title")}</DialogTitle>
                    <DialogDescription>
                      {t("tickets.detail.updateDialog.description")}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    <div className="bg-blue-50 p-3 rounded-lg border">
                      <p className="text-sm text-gray-700">
                        {t("tickets.detail.updateDialog.currentState")}:{" "}
                        <b>{basicos.estado}</b>
                      </p>

                      <p className="text-sm text-gray-700">
                        {t("tickets.detail.updateDialog.nextState")}:{" "}
                        <b>
                          {getNextState(basicos.estado)?.nombre ||
                            t("tickets.detail.updateDialog.nextStateNotAvailable")}
                        </b>
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />{" "}
                        {t("tickets.detail.observations")}
                      </label>

                      <textarea
                        rows={3}
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" />{" "}
                        {t("tickets.detail.updateDialog.evidence")}
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
                      {t("buttons.cancel")}
                    </Button>

                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                      onClick={handleActualizarEstado}
                    >
                      <CheckCircle className="w-4 h-4" />{" "}
                      {t("tickets.detail.confirm")}
                    </Button> 
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
      {imgPreview && (
  <div
    onClick={() => setImgPreview(null)}
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] cursor-pointer"
  >
    <img
      src={imgPreview}
      className="max-w-[90%] max-h-[90%] rounded-lg shadow-2xl transition-transform duration-300 hover:scale-105"
      alt="preview"
    />
  </div>
)}

    </div>
  );
}
