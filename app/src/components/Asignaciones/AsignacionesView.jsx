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
 * Vista de Asignaciones
 * -------------------------------------------------------------
 * Muestra las asignaciones del técnico o administrador,
 * con opción de filtrar por semana (input type="week").
 * Si el rol es Admin, permite asignar técnicos desde la misma vista.
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

  // Estados para asignación en línea
  const [showAsignar, setShowAsignar] = useState(null); // ticket_id activo
  const [tecnicos, setTecnicos] = useState([]);
  const [selectedTecnico, setSelectedTecnico] = useState("");

  const rolId = user?.rol_id;
  const userId = user?.id;

  // 🔹 Cargar TODAS las asignaciones al iniciar
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

  // 🔹 Obtener número de semana
  const getWeekNumber = (date) => {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + firstJan.getDay() + 1) / 7);
  };

  // 🔹 Filtro por semana
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
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">
        {rolId === 1 ? "Asignaciones Generales" : "Mis Asignaciones"}
      </h1>

      {/* 🔸 Filtro de semana */}
      <div className="flex items-center gap-3 mb-6">
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
          onClick={async () => {
            setSelectedWeek("");
            setLoading(true);
            try {
              const response = await AsignacionService.getAsignaciones({
                rolId,
                userId,
              });
              const asignaciones = response.data?.data?.asignaciones || {};
              const all = Object.entries(asignaciones).flatMap(([fecha, items]) =>
                items.map((i) => ({
                  ...i,
                  fecha_asignacion: i.fecha_asignacion || fecha || null,
                }))
              );
              setData(all);
              setFiltered(all);
            } catch (error) {
              console.error("Error al recargar asignaciones:", error);
              setError("Error al recargar asignaciones.");
            } finally {
              setLoading(false);
            }
          }}
        >
          Mostrar todas
        </Button>
      </div>

      {/* 🔸 Tablero tipo calendario */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(groupedByDay).map(([day, asignaciones]) => (
          <Card key={day} className="border border-gray-200 shadow-md">
            <CardHeader>
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
            <CardContent className="space-y-3">
              {asignaciones.map((a, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border bg-white hover:bg-blue-50 transition"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">{a.titulo}</span>
                    <Badge
                      style={{
                        backgroundColor: a.estado_color || "#9ca3af",
                        color: "white",
                      }}
                    >
                      {a.estado}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600">{a.categoria}</p>

                  {rolId === 1 && (
                    <p className="text-xs text-gray-500">
                      Técnico: {a.tecnico || "N/A"}
                    </p>
                  )}

                  <p className="text-xs text-gray-500">
                    SLA: {a.sla_status || "N/A"} ({a.sla_hrs ?? "N/A"}h)
                  </p>

                  {/* 🔹 Botones de acción */}
                  <div className="flex flex-col gap-2 mt-2">
                    <Button
                      size="sm"
                      className="bg-blue-700 text-white hover:bg-blue-800"
                      onClick={() => navigate(a.ver_detalle)}
                    >
                      Ver Detalle
                    </Button>

                    {/* 🔹 Solo admin y sin técnico */}
                    {rolId === 1 && day === "Sin fecha" && (
                      <>
                        {showAsignar === a.ticket_id ? (
                          <div className="flex flex-col gap-2 mt-2 border p-2 rounded-md bg-gray-50">
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

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 text-white hover:bg-green-700"
                                onClick={() => handleAsignar(a.ticket_id)}
                              >
                                Guardar
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setShowAsignar(null);
                                  setSelectedTecnico("");
                                }}
                              >
                                Cancelar
                              </Button>
                            </div>
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
