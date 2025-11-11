// ============================================================
// COMPONENTE: DetailTicket.jsx
// Descripción:
//   Muestra la información detallada de un ticket específico.
//   Incluye descripción, historial de estados, monitoreo de SLA,
//   valoración del cliente, y permite actualizar el estado
//   (con observaciones e imágenes de evidencia).
// ============================================================

import React, { useEffect, useState } from "react"; // Importa React y hooks para estado y ciclo de vida
import { useParams, useNavigate } from "react-router-dom"; // Permite acceder al parámetro :id de la URL y navegar
import TicketService from "../../services/TicketService"; // Servicio encargado de las peticiones al backend
import useAuthStore from "../../auth/store/auth.store"; // Hook global que contiene datos del usuario autenticado
import toast from "react-hot-toast";
//  Importación de iconos visuales desde lucide-react
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

//  Componentes de interfaz reutilizables (botones, badges, alertas, etc.)
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingGrid } from "../ui/custom/LoadingGrid"; // Pantalla de carga
import { ErrorAlert } from "../ui/custom/ErrorAlert"; // Alerta de error

//  Componentes de Dialog (ventana modal)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

//  Componentes de Select (lista desplegable)
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// ============================================================
//  COMPONENTE PRINCIPAL: DetailTicket
// ============================================================
export function DetailTicket() {
  // Extrae el parámetro "id" del ticket desde la URL
  const { id } = useParams();

  // Permite volver a la página anterior o navegar a otra
  const navigate = useNavigate();

  // Obtiene los datos del usuario actual desde el store global
  const { user } = useAuthStore();

  // Extrae el rol e ID del usuario logueado
  const rolId = user?.rol_id;
  const userId = user?.id;

  // Estados locales del componente
  const [data, setData] = useState(null); // Datos del ticket
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(""); // Mensaje de error
  const [openModal, setOpenModal] = useState(false); // Controla apertura del modal
  const [nuevoEstado, setNuevoEstado] = useState(""); // Nuevo estado seleccionado
  const [imagenes, setImagenes] = useState([]); // Imágenes a subir
  const [observaciones, setObservaciones] = useState(""); // Observaciones escritas por el técnico o admin

  // ============================================================
  //  useEffect: carga inicial del ticket
  // ============================================================
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        // Solicita los datos del ticket al backend
        const res = await TicketService.getTicketById(id, { rolId, userId });
        setData(res.data?.data || {}); // Guarda los datos si la respuesta es válida
      } catch (err) {
        console.error("Error al obtener ticket:", err);
        setError("Error al obtener el detalle del ticket."); // Muestra error en pantalla
      } finally {
        setLoading(false); // Finaliza la carga
      }
    };

    // Ejecuta la carga solo si todos los parámetros requeridos existen
    if (id && rolId && userId) fetchTicket();
  }, [id, rolId, userId]); // Se vuelve a ejecutar si cambian los parámetros

  // ============================================================
  //  Render condicional: manejo de carga, errores y datos vacíos
  // ============================================================
  if (loading) return <LoadingGrid />; // Si está cargando, muestra animación
  if (error) return <ErrorAlert title="Error" message={error} />; // Si hay error, muestra alerta
  if (!data) return <ErrorAlert title="Sin datos" message="Ticket no encontrado." />;

  // Desestructura el contenido del ticket
  const { basicos, sla, historial, valoracion } = data;

  // ============================================================
  //  Colores visuales según estado del ticket
  // ============================================================
  const estadoColors = {
    Pendiente: "bg-blue-50 text-blue-800 border-blue-200",
    Asignado: "bg-sky-100 text-sky-800 border-sky-300",
    "En Proceso": "bg-indigo-100 text-indigo-800 border-indigo-300",
    Resuelto: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Cerrado: "bg-rose-100 text-rose-800 border-rose-300",
  };

  // ============================================================
  //  Función: handleActualizarEstado
  // Descripción:
  //   Permite cambiar el estado del ticket, añadir observaciones
  //   y subir imágenes al backend.
  // ============================================================
const handleActualizarEstado = async () => {
  if (!nuevoEstado)
    return toast.error("⚠️ Selecciona un estado antes de confirmar", {
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

      toast.success(" Estado actualizado correctamente", {
        position: "top-center",
        duration: 3000,
      });
    } else {
      toast.error(" No se pudo actualizar el estado del ticket", {
        position: "top-center",
        duration: 3000,
      });
    }
  } catch (err) {
    console.error(err);
    toast.error(" Error al actualizar el estado del ticket", {
      position: "top-center",
      duration: 3000,
    });
  }
};


  // ============================================================
  //  Función auxiliar: getEstadoId
  // Convierte nombre del estado en su identificador numérico.
  // ============================================================
  const getEstadoId = (estado) => {
    switch (estado) {
      case "Pendiente": return 1;
      case "Asignado": return 2;
      case "En Proceso": return 3;
      case "Resuelto": return 4;
      case "Cerrado": return 5;
      default: return 1;
    }
  };

  // ============================================================
  //  Renderización visual del componente
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 py-12">
      <div className="max-w-5xl mx-auto bg-white/70 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border border-blue-100">

        {/*  Encabezado superior con icono y nombre del ticket */}
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

        {/*  Cuerpo principal del ticket */}
        <div className="p-8 mt-6 space-y-8">

          {/* Estado actual del ticket */}
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

          {/*  Información básica */}
          <div className="grid md:grid-cols-2 gap-6 text-gray-700">
            <p><strong className="text-blue-900">Descripción:</strong> {basicos?.descripcion}</p>
            <p><strong className="text-blue-900">Categoría:</strong> {basicos?.categoria}</p>
            <p><strong className="text-blue-900">Prioridad:</strong> {basicos?.prioridad}</p>
            <p><strong className="text-blue-900">Solicitante:</strong> {basicos?.solicitante}</p>
            <p><strong className="text-blue-900">Días de resolución:</strong> {basicos?.dias_resolucion ?? "—"}</p>
          </div>

          {/* ⏱ Sección de monitoreo SLA */}
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

          {/*  Historial de cambios de estado */}
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

                      {/*  Imágenes del historial */}
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

          {/*  Valoración del cliente */}
          {valoracion && (
            <div className="bg-yellow-50 rounded-lg p-6 shadow-inner border border-yellow-100">
              <h3 className="text-xl font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                <Star className="text-yellow-500" /> Valoración del Cliente
              </h3>
              <p><strong>Puntaje:</strong> {valoracion.puntaje} / 5 ⭐</p>
              <p><strong>Comentario:</strong> {valoracion.comentario || "Sin comentario"}</p>
            </div>
          )}

          {/*  Botones finales */}
          <div className="flex justify-between mt-6">
            {/* Botón para volver a la lista */}
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:scale-105 transition-all shadow-sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftCircle className="h-5 w-5 text-blue-700" /> Volver
            </Button>

            {/*  Modal para actualizar estado */}
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
                    Selecciona un nuevo estado, agrega observaciones y evidencias opcionalmente.
                  </DialogDescription>
                </DialogHeader>

                {/* Formulario dentro del modal */}
                <div className="space-y-4 py-2">
                  {/* Selector de estado */}
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

                  {/* Campo de observaciones */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" /> Observaciones
                    </label>
                    <textarea
                      rows="3"
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Agrega una observación o comentario (opcional)"
                    ></textarea>
                  </div>

                  {/* Subida de imágenes */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" /> Imágenes del estado (opcional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setImagenes([...e.target.files])}
                      className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-400">
                      Puedes subir capturas o evidencias del estado actual del ticket.
                    </p>
                  </div>
                </div>

                {/* Footer del modal */}
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
