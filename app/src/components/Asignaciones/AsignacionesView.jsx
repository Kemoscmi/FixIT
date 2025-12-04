import React, { useEffect, useState } from "react";
import AsignacionService from "../../services/AsignacionService";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useNavigate } from "react-router-dom";
import useAuth from "../../auth/store/auth.store";

import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";

import { useI18n } from "@/hooks/useI18n";

export default function AsignacionesView() {

  const { t } = useI18n();
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
    Pendiente: "border-yellow-400 bg-yellow-50 text-yellow-800",
    Asignado: "border-blue-400 bg-blue-50 text-blue-800",
    "En Proceso": "border-indigo-400 bg-indigo-50 text-indigo-800",
    Resuelto: "border-green-400 bg-green-50 text-green-800",
    Cerrado: "border-red-400 bg-red-50 text-red-800",
  };

  // ============================================================
  // Cargar asignaciones
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await AsignacionService.getAsignaciones({ rolId, userId });

        const raw = response.data?.data?.asignaciones;
        let all = [];

        if (Array.isArray(raw)) {
          all = raw.map((i) => ({
            ...i,
            fecha_asignacion: i.fecha_asignacion
              ? new Date(i.fecha_asignacion.replace(" ", "T") + "Z")
                  .toISOString()
                  .split("T")[0]
              : null,
          }));
        } else if (raw && typeof raw === "object") {
          all = Object.entries(raw).flatMap(([fecha, items]) =>
            items.map((i) => ({
              ...i,
              fecha_asignacion:
                fecha === "Sin fecha"
                  ? null
                  : new Date(fecha.replace(" ", "T") + "Z")
                      .toISOString()
                      .split("T")[0],
            }))
          );
        }

        setData(all);
        setFiltered(all);
      } catch {
        setError(t("assignmentsView.errors.load"));
      } finally {
        setLoading(false);
      }
    };

    if (rolId && userId) fetchData();
  }, [rolId, userId, t]);

  // ============================================================
  // Filtro por semana
  // ============================================================
  const handleFilterWeek = (value) => {
    setSelectedWeek(value);
    if (!value) {
      setFiltered(data);
      return;
    }

    const [year, week] = value.split("-W").map(Number);

    const firstDayOfYear = new Date(year, 0, 1);
    const firstWeekStart = new Date(firstDayOfYear);
    firstWeekStart.setDate(firstDayOfYear.getDate() - firstDayOfYear.getDay() + 1 + (week - 1) * 7);

    const lastWeekEnd = new Date(firstWeekStart);
    lastWeekEnd.setDate(firstWeekStart.getDate() + 6);

    const filteredByWeek = data.filter((a) => {
      if (!a.fecha_asignacion) return false;
      const fecha = new Date(a.fecha_asignacion + "T00:00:00");

      return (
        fecha.getTime() >= firstWeekStart.setHours(0, 0, 0, 0) &&
        fecha.getTime() <= lastWeekEnd.setHours(23, 59, 59, 999)
      );
    });

    setFiltered(filteredByWeek);
  };

  if (loading) return <LoadingGrid />;
  if (error) return <ErrorAlert title="Error" message={error} />;

  // ============================================================
  // Semana base
  // ============================================================
  const baseDate = selectedWeek
    ? (() => {
        const [year, week] = selectedWeek.split("-W").map(Number);
        const d = new Date(year, 0, 1);
        d.setDate(d.getDate() - d.getDay() + 1 + (week - 1) * 7);
        return d;
      })()
    : (() => {
        const today = new Date();
        const day = today.getDay() === 0 ? 7 : today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - day + 1);
        return monday;
      })();

  // ============================================================
  // Traducción de días y meses
  // ============================================================
  const diasSemana = Array.from({ length: 7 }).map((_, i) => {
    const fecha = new Date(baseDate);
    fecha.setDate(baseDate.getDate() + i);

    const weekdayIndex = fecha.getDay();
    const weekdayMap = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    const weekdayKey = weekdayMap[weekdayIndex];

    const monthIndex = fecha.getMonth();
    const monthMap = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    const monthKey = monthMap[monthIndex];

    const fechaISO = fecha.toLocaleDateString("sv-SE");

    return {
      nombre: t(`days.${weekdayKey}`),
      fechaISO,
      fechaMostrar: `${fecha.getDate()} ${t(`months.short.${monthKey}`)}`
    };
  });

  const asignacionesPorFecha = filtered.reduce((acc, asignacion) => {
    const fecha = asignacion.fecha_asignacion
      ? new Date(asignacion.fecha_asignacion).toISOString().split("T")[0]
      : "Sin fecha";

    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(asignacion);
    return acc;
  }, {});

  const inicioSemana = diasSemana[0].fechaMostrar;
  const finSemana = diasSemana[6].fechaMostrar;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="max-w-7xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-2 text-blue-900">
        {rolId === 1 ? t("assignmentsView.titleAdmin") : t("assignmentsView.titleTech")}
      </h1>

      <p className="text-gray-600 mb-2">
        {t("assignmentsView.description")}
      </p>

      <p className="text-sm text-gray-700 italic mb-6">
        {t("assignmentsView.weekRange", { start: inicioSemana, end: finSemana })}
      </p>

      <div className="flex items-center gap-4 mb-8">
        
        <Button
          onClick={() => navigate("/asignaciones/autotriage")}
          className="bg-indigo-600 text-white hover:bg-indigo-700"
        >
          {t("assignmentsView.buttonAuto")}
        </Button>

        <label className="text-sm font-medium text-gray-700">
          {t("assignmentsView.filterWeek")}
        </label>

        <input
          type="week"
          value={selectedWeek}
          onChange={(e) => handleFilterWeek(e.target.value)}
          className="border p-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {diasSemana.map((dia) => {
          const asignacionesDelDia = asignacionesPorFecha[dia.fechaISO] || [];

          return (
            <Card
              key={dia.fechaISO}
              className="border border-blue-100 shadow-md rounded-xl hover:shadow-lg transition-all bg-white/90 backdrop-blur-sm"
            >
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-t-xl">
                <CardTitle className="flex justify-between items-center">
                  <span className="capitalize">{dia.nombre}</span>
                  <span className="text-sm text-white/80">{dia.fechaMostrar}</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 bg-white rounded-b-xl min-h-[160px] p-4">

                {asignacionesDelDia.length > 0 ? (
                  asignacionesDelDia.map((a, idx) => {
                    const parseToLocalDate = (str) => {
                      if (!str) return null;
                      return new Date(str.replace(" ", "T"));
                    };

                    const fechaInicio = parseToLocalDate(a.fecha_creacion);
                    const fechaLimite = parseToLocalDate(a.sla_resol_limite);
                    const ahora = new Date();

                    const totalMs = fechaLimite - fechaInicio;
                    const transcurridoMs = ahora - fechaInicio;

                    let slaProgress = 100 - (transcurridoMs / totalMs) * 100;
                    if (slaProgress < 0) slaProgress = 0;
                    if (slaProgress > 100) slaProgress = 100;

                    const slaStatus =
                      ahora > fechaLimite ? t("sla.expired") : t("sla.inProgress");

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border-l-4 ${
                          estadoColors[a.estado] || "border-gray-300"
                        } shadow-sm hover:shadow-md transition`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              #{a.ticket_id} — {a.titulo}
                            </p>

                            <p className="text-xs text-gray-600">
                              {t("assignmentsView.ticketCategory")}{" "}
                              <strong>{a.categoria}</strong>
                            </p>

                            <p className="text-xs text-gray-500 font-medium">
                              SLA: {slaStatus} ({Math.round(slaProgress)}%)
                            </p>
                          </div>

                          <Badge
                            className={`${
                              estadoColors[a.estado] ||
                              "bg-gray-200 text-gray-700 border-gray-300"
                            } px-3 py-1 text-xs font-medium rounded-full shadow-sm`}
                          >
                            {a.estado}
                          </Badge>
                        </div>

                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              slaStatus === t("sla.expired")
                                ? "bg-red-600"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${
                                slaStatus === t("sla.expired")
                                  ? 100
                                  : slaProgress
                              }%`,
                              opacity: slaStatus === t("sla.expired") ? 1 : 0.9,
                            }}
                          ></div>
                        </div>

                        <div className="text-right">
                          <Button
                            size="sm"
                            className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
                            onClick={() => navigate(a.ver_detalle)}
                          >
                            {t("assignmentsView.viewDetail")}
                          </Button>
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-400 text-center italic mt-8">
                    {t("assignmentsView.noAssignments")}
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
