// components/Asignaciones/AsignacionesView.jsx
import React, { useEffect, useState } from "react";
import AsignacionService from "../../services/AsignacionService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import useAuth from "../../auth/store/auth.store";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";

export default function AsignacionesView() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState("");

  const rolId = user?.rol_id;
  const userId = user?.id;

  const estadoColors = {
    Pendiente: "border-yellow-400 bg-yellow-50",
    Asignado: "border-blue-400 bg-blue-50",
    "En Proceso": "border-indigo-400 bg-indigo-50",
    Resuelto: "border-green-400 bg-green-50",
    Cerrado: "border-red-400 bg-red-50",
  };

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

  if (loading) return <LoadingGrid />;
  if (error) return <ErrorAlert title="Error" message={error} />;

  // ---------- VISTA CALENDARIO ----------
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const hoy = new Date();
  const diaActual = hoy.getDay() === 0 ? 7 : hoy.getDay();
  const primerDiaSemana = new Date(hoy);
  primerDiaSemana.setDate(hoy.getDate() - diaActual + 1);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2 text-blue-900">
        {rolId === 1 ? "Asignaciones Generales" : "Mis Asignaciones Semanales"}
      </h1>
      <p className="text-gray-600 mb-6">
        Visualiza tus tickets asignados por día de la semana. Si un día no tiene asignaciones, se mostrará vacío.
      </p>

      {/* Filtro de semana */}
      <div className="flex items-center gap-3 mb-8">
        <label className="text-sm font-medium text-gray-700">Filtrar por semana:</label>
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

      {/* Calendario semanal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {diasSemana.map((nombreDia, index) => {
          const fechaDia = new Date(primerDiaSemana);
          fechaDia.setDate(primerDiaSemana.getDate() + index);

          const asignacionesDelDia = filtered.filter((a) => {
            const fecha = new Date(a.fecha_asignacion);
            return (
              !isNaN(fecha) &&
              fecha.getDate() === fechaDia.getDate() &&
              fecha.getMonth() === fechaDia.getMonth() &&
              fecha.getFullYear() === fechaDia.getFullYear()
            );
          });

          const numeroDia = fechaDia.getDate();
          const mes = fechaDia.toLocaleString("es-CR", { month: "short" });

          return (
            <Card
              key={nombreDia}
              className="border border-blue-100 shadow-md rounded-xl hover:shadow-lg transition-all bg-white/90 backdrop-blur-sm"
            >
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-t-xl">
                <CardTitle className="flex justify-between items-center">
                  <span>{nombreDia}</span>
                  <span className="text-sm text-white/80">{numeroDia} {mes}</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 bg-white rounded-b-xl min-h-[160px] p-4">
                {asignacionesDelDia.length > 0 ? (
                  asignacionesDelDia.map((a, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-l-4 ${estadoColors[a.estado] || "border-gray-300"} shadow-sm hover:shadow-md transition`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            #{a.id} — {a.titulo}
                          </p>
                          <p className="text-xs text-gray-600">
                            Categoría: <strong>{a.categoria}</strong>
                          </p>
                          <p className="text-xs text-gray-500">
                            SLA: {a.sla_status || "N/A"} ({a.sla_hrs ?? "N/A"}h)
                          </p>
                        </div>
             <Badge
  className={`${
    estadoColors[a.estado] || "bg-gray-200 text-gray-700 border-gray-300"
  } flex-shrink-0 inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-xs font-medium rounded-full shadow-sm`}
  style={{ maxWidth: "none" }}
>
  {a.estado}
</Badge>
                      </div>

                      <div className="text-right mt-1">
                        <Button
                          size="sm"
                          className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
                          onClick={() => navigate(a.ver_detalle)}
                        >
                          Ver detalle
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center italic mt-8">
                    — Sin asignaciones —
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
