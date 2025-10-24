// 📁 components/Asignaciones/AsignacionesView.jsx
import React, { useEffect, useState } from "react";
import AsignacionService from "../../services/AsignacionService";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import useAuth from "../../auth/store/auth.store";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { EmptyState } from "../ui/custom/EmptyState";
import { ErrorAlert } from "../ui/custom/ErrorAlert";

/**
 * Vista de Asignaciones (PASO 5 - Avance 3)
 * -------------------------------------------------------------
 * Muestra las asignaciones del técnico activo o administrador.
 * - Organizadas por semana
 * - Colores y estilo profesional azul
 * - Tarjetas con datos clave (ID, categoría, estado, SLA)
 * - Botón “Ver detalle” funcional
 */
export default function AsignacionesView() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados principales
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState("");

  const [showAsignar, setShowAsignar] = useState(null);
  const [tecnicos, setTecnicos] = useState([]);
  const [selectedTecnico, setSelectedTecnico] = useState("");

  const rolId = user?.rol_id;
  const userId = user?.id;

  // 🎨 Colores de estado
  const estadoColors = {
    Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Asignado: "bg-blue-100 text-blue-800 border-blue-300",
    "En Proceso": "bg-indigo-100 text-indigo-800 border-indigo-300",
    Resuelto: "bg-green-100 text-green-800 border-green-300",
    Cerrado: "bg-red-100 text-red-800 border-red-300",
  };

  // 🔹 Cargar asignaciones
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await AsignacionService.getAsignaciones({ rolId, userId });
        const asignaciones = response.data?.data?.asignaciones || {};

        const all = Object.entries(asignaciones).flatMap(([fecha, items]) =>
          items.map((i) => ({
            ...i,
            fecha_asignacion: i.fecha_asignacion || fecha || null,
          }))
        );

        setData(all);
        setFiltered(all);
      } catch (err) {
        console.error("Error al cargar asignaciones:", err);
        setError("Error al cargar las asignaciones.");
      } finally {
        setLoading(false);
      }
    };
    if (rolId && userId) fetchData();
  }, [rolId, userId]);

  // 🔹 Filtro por semana
  const getWeekNumber = (date) => {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + firstJan.getDay() + 1) / 7);
  };

  const handleFilterWeek = (value) => {
    setSelectedWeek(value);
    if (!value || value.trim() === "") {
      setFiltered(data);
      return;
    }

    const [year, week] = value.split("-W");
    const filteredByWeek = data.filter((a) => {
      const date = new Date(a.fecha_asignacion);
      if (isNaN(date)) return false;
      const weekNumber = getWeekNumber(date);
      const yearNumber = date.getFullYear();
      return weekNumber === parseInt(week) && yearNumber === parseInt(year);
    });
    setFiltered(filteredByWeek);
  };

  // 🔹 Cargar técnicos disponibles
  const loadTecnicos = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_BASE_URL + "TecnicoController/disponibles"
      );
      setTecnicos(response.data?.data || []);
    } catch (error) {
      console.error("Error al cargar técnicos:", error);
      alert("Error al cargar la lista de técnicos.");
    }
  };

  // 🔹 Asignar técnico
  const handleAsignar = async (ticketId) => {
    if (!selectedTecnico) {
      alert("Selecciona un técnico antes de asignar.");
      return;
    }

    try {
      const payload = {
        ticket_id: ticketId,
        tecnico_id: selectedTecnico,
        metodo: "Manual",
      };

      const response = await axios.post(
        import.meta.env.VITE_BASE_URL + "AsignacionController/asignar",
        payload
      );

      if (response.data?.success) {
        alert("✅ Ticket asignado correctamente.");
        setShowAsignar(null);
        setSelectedTecnico("");
        window.location.reload();
      } else {
        alert(response.data?.message || "Error al asignar ticket.");
      }
    } catch (error) {
      console.error("Error al asignar:", error);
      alert("Error al asignar el ticket.");
    }
  };

  // 🔹 Agrupar por día
  const groupedByDay = filtered.reduce((acc, a) => {
    const rawDate = a.fecha_asignacion || a.hora;
    let dateLabel = "Sin fecha";

    if (rawDate) {
      const dateObj = new Date(rawDate);
      if (!isNaN(dateObj)) {
        dateLabel = dateObj.toISOString().split("T")[0];
      }
    }

    if (dateLabel === "Sin fecha" && rolId !== 1) return acc;
    if (!acc[dateLabel]) acc[dateLabel] = [];
    acc[dateLabel].push(a);
    return acc;
  }, {});

  // 🔹 Estados visuales
  if (loading) return <LoadingGrid />;
  if (error) return <ErrorAlert title="Error" message={error} />;
  if (!filtered || filtered.length === 0)
    return <EmptyState message="No hay asignaciones registradas." />;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2 text-blue-900">
        {rolId === 1 ? "Asignaciones Generales" : "Mis Asignaciones Semanales"}
      </h1>
      <p className="text-gray-600 mb-6">
        Visualiza tus tickets asignados por fecha y estado. Usa el filtro de semana
        para concentrarte en tus asignaciones actuales.
      </p>

      {/* 🔸 Filtro de semana */}
      <div className="flex items-center gap-3 mb-8">
        <label className="text-sm font-medium text-gray-700">
          Filtrar por semana:
        </label>
        <input
          type="week"
          value={selectedWeek}
          onChange={(e) => handleFilterWeek(e.target.value)}
          className="border p-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedWeek("");
            setFiltered(data);
          }}
        >
          Mostrar todas
        </Button>
      </div>

      {/* 🔸 Tablero tipo agenda semanal */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(groupedByDay).map(([day, asignaciones]) => (
          <Card
            key={day}
            className="border border-blue-100 shadow-md rounded-xl hover:shadow-lg transition-all"
          >
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-t-xl">
              <CardTitle className="text-lg font-semibold capitalize">
                {day === "Sin fecha"
                  ? "🟡 Tickets sin asignar"
                  : new Date(day).toLocaleDateString("es-CR", {
                      weekday: "long",
                      day: "2-digit",
                      month: "short",
                    })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 bg-white rounded-b-xl">
              {asignaciones.map((a, idx) => (
                <div
                  key={idx}
                  className={`p-4 border-l-4 ${
                    estadoColors[a.estado] || "border-gray-300"
                  } rounded-lg bg-blue-50 hover:bg-blue-100 transition`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-900">
                      #{a.id} — {a.titulo}
                    </span>
                    <Badge
                      className={
                        estadoColors[a.estado] ||
                        "bg-gray-200 text-gray-700 border-gray-300"
                      }
                    >
                      {a.estado}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-700">
                    Categoría: <span className="font-medium">{a.categoria}</span>
                  </p>

                  {rolId === 1 && (
                    <p className="text-xs text-gray-500">
                      Técnico: {a.tecnico || "N/A"}
                    </p>
                  )}

                  <p className="text-xs text-gray-500">
                    SLA: {a.sla_status || "N/A"} ({a.sla_hrs ?? "N/A"}h)
                  </p>

                  {/* Botones */}
                  <div className="flex justify-between items-center mt-3">
                    <Button
                      size="sm"
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => navigate(a.ver_detalle)}
                    >
                      Ver detalle
                    </Button>

                    {/* Asignar técnico (solo admin) */}
                    {rolId === 1 && day === "Sin fecha" && (
                      <>
                        {showAsignar === a.ticket_id ? (
                          <div className="flex flex-col gap-2 mt-2">
                            <select
                              className="border p-2 rounded-md"
                              value={selectedTecnico}
                              onChange={(e) => setSelectedTecnico(e.target.value)}
                            >
                              <option value="">-- Seleccionar técnico --</option>
                              {tecnicos.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.nombre} ({t.disponibilidad})
                                </option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              className="bg-green-600 text-white hover:bg-green-700"
                              onClick={() => handleAsignar(a.ticket_id)}
                            >
                              Guardar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-green-600 text-white hover:bg-green-700"
                            onClick={() => {
                              loadTecnicos();
                              setShowAsignar(a.ticket_id);
                            }}
                          >
                            Asignar técnico
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      
    </div>
  );
}
