import React, { useState, useEffect } from "react";
import AsignacionService from "../../services/AsignacionService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";

export default function AsignacionesAuto() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [pendientes, setPendientes] = useState([]);
  const [filtro, setFiltro] = useState({ prioridad: "", categoria: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // CARGAR TICKETS PENDIENTES
  // ============================================================
  const cargarPendientes = async () => {
    try {
      const res = await AsignacionService.getTicketsPendientes();
      setPendientes(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setError(t("assignmentsAuto.errors.loadPendings"));
    }
  };

  useEffect(() => {
    setLoading(true);
    cargarPendientes().finally(() => setLoading(false));
  }, []);

  // ============================================================
  // APLICAR FILTROS
  // ============================================================
  const filtrados = pendientes.filter((t) => {
    const p = String(t.prioridad).toLowerCase();

    let prioridadTicket = "";

    if (p.includes("alta") || p.includes("high")) prioridadTicket = "1";
    else if (p.includes("media") || p.includes("medium")) prioridadTicket = "2";
    else if (p.includes("baja") || p.includes("low")) prioridadTicket = "3";

    if (filtro.prioridad && prioridadTicket !== filtro.prioridad) return false;
    if (filtro.categoria && t.categoria !== filtro.categoria) return false;

    return true;
  });

  // ============================================================
  // EJECUTAR ASIGNACIÓN AUTOMÁTICA
  // ============================================================
  const ejecutarAsignacion = async () => {
    try {
      setProcesando(true);
      setError("");
      setResult(null);

      const response = await AsignacionService.asignarPendientes();

      if (!response.data?.success) {
        setError(response.data?.message || t("assignmentsAuto.errors.runFail"));
        setProcesando(false);
        return;
      }

      setResult(response.data.data);
      await cargarPendientes();
    } catch (err) {
      console.error(err);
      setError(t("assignmentsAuto.errors.runAuto"));
    } finally {
      setProcesando(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (loading) return <LoadingGrid />;

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* TITULO */}
      <h1 className="text-3xl font-bold text-blue-900">
        {t("assignmentsAuto.title")}
      </h1>

      <p className="text-gray-600 mt-2 mb-6">
        {t("assignmentsAuto.description")}
      </p>

      {/* ======================================================
          FILTROS
      ======================================================= */}
      <Card className="mb-6 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">
            {t("assignmentsAuto.filters.title")}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex gap-6">

          {/* PRIORIDAD */}
          <div>
            <label className="text-sm font-medium">
              {t("assignmentsAuto.filters.priority")}:
            </label>

            <select
              className="border p-2 rounded ml-2"
              value={filtro.prioridad}
              onChange={(e) => setFiltro({ ...filtro, prioridad: e.target.value })}
            >
              <option value="">{t("assignmentsAuto.filters.all")}</option>
              <option value="1">{t("assignmentsAuto.filters.high")}</option>
              <option value="2">{t("assignmentsAuto.filters.medium")}</option>
              <option value="3">{t("assignmentsAuto.filters.low")}</option>
            </select>
          </div>

          {/* CATEGORIA */}
          <div>
            <label className="text-sm font-medium">
              {t("assignmentsAuto.filters.category")}:
            </label>

            <select
              className="border p-2 rounded ml-2"
              value={filtro.categoria}
              onChange={(e) => setFiltro({ ...filtro, categoria: e.target.value })}
            >
              <option value="">{t("assignmentsAuto.filters.all")}</option>

              {[...new Set(pendientes.map((p) => p.categoria))].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </CardContent>
      </Card>

      {/* ======================================================
          TABLA DE TICKETS
      ======================================================= */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">
            {t("assignmentsAuto.table.title", { count: filtrados.length })}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {filtrados.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              {t("assignmentsAuto.table.noTickets")}
            </p>
          ) : (
            <table className="w-full border text-center text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">{t("assignmentsAuto.table.id")}</th>
                  <th className="p-2">{t("assignmentsAuto.table.titleColumn")}</th>
                  <th className="p-2">{t("assignmentsAuto.table.category")}</th>
                  <th className="p-2">{t("assignmentsAuto.table.priority")}</th>
                  <th className="p-2">{t("assignmentsAuto.table.slaRemaining")}</th>
                  <th className="p-2">{t("assignmentsAuto.table.actions")}</th>
                </tr>
              </thead>

              <tbody>
  {filtrados.map((ticket) => {
    const mins = ticket.sla_min_restantes;

    let slaTexto = "";
    if (mins === null || mins === undefined)
      slaTexto = t("assignmentsAuto.sla.na");
    else if (mins >= 0)
      slaTexto = t("assignmentsAuto.sla.remaining", { min: mins });
    else
      slaTexto = t("assignmentsAuto.sla.expired", { min: Math.abs(mins) });

    return (
      <tr key={ticket.id} className="border-t">
        <td className="p-2">{ticket.id}</td>
        <td className="p-2">{ticket.titulo}</td>
        <td className="p-2">{ticket.categoria}</td>

        <td className="p-2">
          <Badge className="bg-blue-50 text-blue-800">
            {ticket.prioridad}
          </Badge>
        </td>

        <td className="p-2">{slaTexto}</td>

        <td className="p-2">
          <Link
            to={`/tickets/${ticket.id}`}
            className="text-blue-700 hover:underline font-medium"
          >
            {t("assignmentsAuto.table.viewDetail")}
          </Link>
        </td>
      </tr>
    );
  })}
</tbody>

            </table>
          )}
        </CardContent>
      </Card>

      {/* ======================================================
          BOTONES
      ======================================================= */}
      <div className="mt-4 flex justify-between items-center">

        <Button
          onClick={() => navigate(-1)}
          className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2"
        >
          {t("assignmentsAuto.buttons.back")}
        </Button>

        <Button
          onClick={ejecutarAsignacion}
          className="bg-blue-700 text-white px-6 py-3 hover:bg-blue-800"
          disabled={procesando}
        >
          {procesando
            ? t("assignmentsAuto.buttons.processing")
            : t("assignmentsAuto.buttons.run")}
        </Button>

      </div>

      {/* ======================================================
          ERRORES
      ======================================================= */}
      {error && (
        <div className="mt-4">
          <ErrorAlert title="Error" message={error} />
        </div>
      )}

      {/* ======================================================
          RESULTADOS
      ======================================================= */}
      {result && (
        <Card className="mt-8 border-blue-300 shadow-md">
          <CardHeader className="bg-blue-600 text-white rounded-t-xl">
            <CardTitle>
              {t("assignmentsAuto.results.title", { count: result.asignados })}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {result.detalles.map((item, idx) => (
              <div key={idx} className="border p-4 rounded-lg bg-white shadow-sm">

                <div className="flex justify-between">
                  <div>
                    <p className="font-bold">Ticket #{item.ticket_id}</p>
                    <p className="text-sm text-gray-600">
                      {t("assignmentsAuto.results.assignedTech")}:{" "}
                      <b>{item.tecnico}</b>
                    </p>
                  </div>

                  <Badge className="bg-blue-100 text-blue-800 border">
                    {t("assignmentsAuto.results.assigned")}
                  </Badge>
                </div>

                <div className="mt-3 text-sm">
                  <p><b>{t("assignmentsAuto.results.score")}:</b> {item.puntaje}</p>
                  <p><b>{t("assignmentsAuto.results.rule")}:</b> {item.regla_aplicada}</p>

                  <p className="mt-2">
                    <b>{t("assignmentsAuto.results.justification")}:</b><br />
                    <span className="text-gray-700 whitespace-pre-line">
                      {item.justificacion}
                    </span>
                  </p>
                </div>

              </div>
            ))}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
