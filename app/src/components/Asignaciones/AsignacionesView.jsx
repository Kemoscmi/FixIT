// ============================================================
//  COMPONENTE: AsignacionesView.jsx
// ============================================================

import React, { useEffect, useState } from "react";
import AsignacionService from "../../services/AsignacionService";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useNavigate } from "react-router-dom";
import useAuth from "../../auth/store/auth.store";

import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";

import { useI18n } from "@/hooks/useI18n"; // ✅ AGREGADO

export default function AsignacionesView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang } = useI18n();

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
  // CARGA DE ASIGNACIONES
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
                  : new Date(fecha.replace(" ", "T") + "Z").toISOString().split("T")[0],
            }))
          );
        }

        setData(all);
        setFiltered(all);
     // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError(t("alerts.loadError"));
      } finally {
        setLoading(false);
      }
    };

    if (rolId && userId) fetchData();
  }, [rolId, userId, t]);

  // ============================================================
  // FILTRAR POR SEMANA
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
    firstWeekStart.setDate(
      firstDayOfYear.getDate() - firstDayOfYear.getDay() + 1 + (week - 1) * 7
    );

    const lastWeekEnd = new Date(firstWeekStart);
    lastWeekEnd.setDate(firstWeekStart.getDate() + 6);

    const filteredByWeek = data.filter((a) => {
      if (!a.fecha_asignacion) return false;
      const fecha = new Date(a.fecha_asignacion + "T00:00:00");
      return (
        fecha >= new Date(firstWeekStart.setHours(0, 0, 0, 0)) &&
        fecha <= new Date(lastWeekEnd.setHours(23, 59, 59, 999))
      );
    });

    setFiltered(filteredByWeek);
  };

  if (loading) return <LoadingGrid />;
  if (error) return <ErrorAlert title={t("alerts.error")} message={error} />;

  // ============================================================
  // SEMANA BASE
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

const locale = lang === "en" ? "en-US" : "es-CR";

  // ============================================================
  // DÍAS DE LA SEMANA
  // ============================================================
  const diasSemana = Array.from({ length: 7 }).map((_, i) => {
    const fecha = new Date(baseDate);
    fecha.setDate(baseDate.getDate() + i);

    return {
      nombre: fecha.toLocaleDateString(locale, { weekday: "long" }),
      fechaISO: fecha.toLocaleDateString("sv-SE"),
      fechaMostrar: `${fecha.getDate()} ${fecha.toLocaleString(locale, { month: "short" })}`,
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
        {rolId === 1
          ? t("assignmentsView.titleAdmin")
          : t("assignmentsView.titleTech")}
      </h1>

      <p className="text-gray-600 mb-2">{t("assignmentsView.description")}</p>

      <p className="text-sm text-gray-700 italic mb-6">
        {t("assignmentsView.weekRange", { start: inicioSemana, end: finSemana })}
      </p>

      <div className="flex items-center gap-3 mb-8">
        <label className="text-sm font-medium text-gray-700">
          {t("assignmentsView.filterWeek")}
        </label>

        <input
          type="week"
          value={selectedWeek}
          onChange={(e) => handleFilterWeek(e.target.value)}
          className="border p-2 rounded-md shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {diasSemana.map((dia) => {
          const asignacionesDelDia = asignacionesPorFecha[dia.fechaISO] || [];

          return (
            <Card
              key={dia.fechaISO}
              className="border border-blue-100 shadow-md rounded-xl hover:shadow-lg transition-all"
            >
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-t-xl">
                <CardTitle className="flex justify-between items-center">
                  <span className="capitalize">{dia.nombre}</span>
                  <span className="text-sm text-white/80">{dia.fechaMostrar}</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 p-4 min-h-[160px]">
                {asignacionesDelDia.length > 0 ? (
                  asignacionesDelDia.map((a, idx) => {
                    const inicio = new Date(a.fecha_creacion);
                    const limite = new Date(a.sla_resol_limite);
                    const ahora = new Date();

                    const totalMs = limite - inicio;
                    const transMs = ahora - inicio;

                    let slaProgress = 100 - (transMs / totalMs) * 100;
                    slaProgress = Math.max(0, Math.min(100, slaProgress));

                    const slaStatus =
                      ahora > limite
                        ? t("assignmentsView.slaExpired")
                        : t("assignmentsView.slaInProgress");

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border-l-4 ${
                          estadoColors[a.estado] || "border-gray-300"
                        } shadow-sm`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-sm">
                              #{a.ticket_id} — {a.titulo}
                            </p>

                            <p className="text-xs text-gray-600">
                              {t("assignmentsView.ticketCategory")}{" "}
                              <strong>{a.categoria}</strong>
                            </p>

                            <p
                              className={`text-xs font-medium ${
                                slaStatus === t("assignmentsView.slaExpired")
                                  ? "text-red-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {t("assignmentsView.sla")} {slaStatus} (
                              {Math.round(slaProgress)}%)
                            </p>
                          </div>

                          <Badge>
                            {a.estado}
                          </Badge>
                        </div>

                        <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                          <div
                            className={`h-2 ${
                              slaStatus === t("assignmentsView.slaExpired")
                                ? "bg-red-600"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${slaProgress}%` }}
                          ></div>
                        </div>

                        <div className="text-right">
                          <Button
                            size="sm"
                            className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
                            onClick={() => navigate(a.ver_detalle)}
                          >
                            {t("assignmentsView.btnViewDetail")}
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
