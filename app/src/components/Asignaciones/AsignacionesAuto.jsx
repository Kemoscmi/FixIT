// ============================================================
//  COMPONENTE: AsignacionesAuto.jsx
// ------------------------------------------------------------
// Pantalla completa del AUTOTRIAGE:
//  - Lista de tickets pendientes
//  - Filtros
//  - Cálculo de puntaje
//  - Ejecución del proceso automático
//  - Mostrar reglas aplicadas
// ============================================================

import React, { useState, useEffect } from "react";
import AsignacionService from "../../services/AsignacionService"; 
import TicketService from "../../services/TicketService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


export default function AsignacionesAuto() {

  const navigate = useNavigate();
  // ESTADOS
  const [pendientes, setPendientes] = useState([]);
  const [filtro, setFiltro] = useState({ prioridad: "", categoria: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // CARGA INICIAL → Obtener tickets PENDIENTES
  // ============================================================
 useEffect(() => {
  const cargarPendientes = async () => {
    try {
      // Usamos el servicio correcto: AsignacionService
      const res = await AsignacionService.getTicketsPendientes();

      // La API de AsignacionController/pendientes devuelve { success, data }
      setPendientes(res.data?.data || []);
    } catch (err) {
      console.error("❌ Error cargando pendientes:", err);
      setError("Error cargando los tickets pendientes.");
    } finally {
      setLoading(false);
    }
  };

  cargarPendientes();
}, []);

  // ============================================================
  // FILTRO DE TICKETS
  // ============================================================

  const filtrados = pendientes.filter((t) => {
    if (filtro.prioridad && String(t.prioridad) !== filtro.prioridad) return false;
    if (filtro.categoria && t.categoria !== filtro.categoria) return false;
    return true;
  });

  // ============================================================
  // EJECUTAR AUTOTRIAGE
  // ============================================================
  const ejecutarAsignacion = async () => {
    try {
      setProcesando(true);
      setError("");
      setResult(null);

      const response = await AsignacionService.asignarPendientes();

      if (!response.data?.success) {
        setError(response.data?.message || "No se pudo completar la asignación");
        setProcesando(false);
        return;
      }

      setResult(response.data.data);
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Error al procesar la asignación automática.");
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
      <h1 className="text-3xl font-bold text-blue-900">Asignación Automática </h1>

      <p className="text-gray-600 mt-2 mb-6">
        Revisa y filtra los tickets pendientes. Luego ejecuta el algoritmo automático según:
        <b> prioridad, SLA, especialidad y carga laboral.</b>
      </p>

      {/* ===================== FILTROS ===================== */}
      <Card className="mb-6 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>

        <CardContent className="flex gap-6">

          {/* Filtro de prioridad */}
          <div>
            <label className="text-sm font-medium">Prioridad:</label>
            <select
              className="border p-2 rounded ml-2"
              value={filtro.prioridad}
              onChange={(e) => setFiltro({ ...filtro, prioridad: e.target.value })}
            >
              <option value="">Todas</option>
              <option value="1">Alta (1)</option>
              <option value="2">Media (2)</option>
              <option value="3">Baja (3)</option>
            </select>
          </div>

          {/* Filtro categoría */}
          <div>
            <label className="text-sm font-medium">Categoría:</label>
            <select
              className="border p-2 rounded ml-2"
              value={filtro.categoria}
              onChange={(e) => setFiltro({ ...filtro, categoria: e.target.value })}
            >
              <option value="">Todas</option>
              {[...new Set(pendientes.map((p) => p.categoria))].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* ===================== TABLA DE TICKETS ===================== */}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Tickets Pendientes ({filtrados.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {filtrados.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No hay tickets pendientes con esos filtros.</p>
          ) : (
            <table className="w-full border text-center text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Título</th>
                  <th className="p-2">Categoría</th>
                  <th className="p-2">Prioridad</th>
                  <th className="p-2">SLA Restante</th>
                   <th className="p-2">Acciones</th> 
                </tr>
              </thead>
            <tbody>
  {filtrados.map((t) => {
    const mins = t.sla_min_restantes;

    let slaTexto;
    if (mins === null || mins === undefined) {
      slaTexto = "N/A";
    } else if (mins >= 0) {
      slaTexto = `${mins} min`;
    } else {
      slaTexto = `Vencido hace ${Math.abs(mins)} min`;
    }

    return (
      <tr key={t.id} className="border-t">
        <td className="p-2">{t.id}</td>
        <td className="p-2">{t.titulo}</td>
        <td className="p-2">{t.categoria}</td>
        <td className="p-2">
          <Badge className="bg-blue-50 text-blue-800">{t.prioridad}</Badge>
        </td>
        <td className="p-2">{slaTexto}</td>

        <td className="p-2">
          <Link
            to={`/tickets/${t.id}`}
            className="text-blue-700 hover:underline font-medium"
          >
            Ver detalle
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


    {/* ===================== BOTONES ===================== */}
<div className="mt-4 flex justify-between items-center">

  {/* Botón Volver atrás (izquierda) */}
  <Button
    onClick={() => navigate(-1)}
    className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2"
  >
    ← Volver atrás
  </Button>

  {/* Botón Ejecutar Autotriage (derecha) */}
  <Button
    onClick={ejecutarAsignacion}
    className="bg-blue-700 text-white px-6 py-3 hover:bg-blue-800"
    disabled={procesando}
  >
    {procesando ? "Procesando..." : "Ejecutar Asignación Automática"}
  </Button>

</div>



      {/* ===================== ERRORES ===================== */}
      {error && (
        <div className="mt-4">
          <ErrorAlert title="Error" message={error} />
        </div>
      )}

      {/* ===================== RESULTADOS ===================== */}
      {result && (
        <Card className="mt-8 border-blue-300 shadow-md">
          <CardHeader className="bg-blue-600 text-white rounded-t-xl">
            <CardTitle>
              Resultados del Autotriage — {result.asignados} tickets asignados
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {result.detalles.map((item, idx) => (
              <div key={idx} className="border p-4 rounded-lg bg-white shadow-sm">
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold">Ticket #{item.ticket_id}</p>
                    <p className="text-sm text-gray-600">
                      Técnico asignado: <b>{item.tecnico}</b>
                    </p>
                  </div>

                  <Badge className="bg-blue-100 text-blue-800 border">
                    Asignado
                  </Badge>
                </div>

                <div className="mt-3 text-sm">
                  <p><b>Puntaje:</b> {item.puntaje}</p>
                  <p><b>Regla aplicada:</b> {item.regla}</p>

                  <p className="mt-2">
                    <b>Justificación:</b><br/>
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
