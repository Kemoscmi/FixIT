// ============================================================
//  COMPONENTE: AsignacionesView.jsx
// ------------------------------------------------------------
// Este componente muestra las asignaciones semanales del técnico o administrador
// en forma de calendario (lunes a domingo). Permite filtrar por semana,
// calcular el avance del SLA de cada ticket y ver detalles individuales.
// ============================================================

//  Importaciones principales de React
import React, { useEffect, useState } from "react"; // useState y useEffect son hooks
import AsignacionService from "../../services/AsignacionService"; // servicio que obtiene las asignaciones desde la API

//  Componentes UI reutilizables (diseño de tarjeta, botones, badges, etc.)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Navegación interna y autenticación del usuario
import { useNavigate } from "react-router-dom";
import useAuth from "../../auth/store/auth.store"; // almacén de datos del usuario autenticado

//  Componentes de estado visual
import { LoadingGrid } from "../ui/custom/LoadingGrid"; // muestra carga animada
import { ErrorAlert } from "../ui/custom/ErrorAlert"; // muestra errores

// ============================================================
// Componente principal: AsignacionesView
// ============================================================
export default function AsignacionesView() {

  //  Hook para redirigir entre vistas
  const navigate = useNavigate();

  // Extrae los datos del usuario autenticado
  const { user } = useAuth();

  // ============================================================
  // Estados internos del componente
  // ------------------------------------------------------------
  // data: todas las asignaciones cargadas
  // filtered: asignaciones filtradas según semana seleccionada
  // error: mensaje de error (si ocurre)
  // loading: indica si los datos se están cargando
  // selectedWeek: semana seleccionada en el filtro tipo calendario
  // ============================================================
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState("");

  // Extrae los valores del usuario (rol e id)
  const rolId = user?.rol_id;
  const userId = user?.id;

  // ============================================================
  //  Colores de estado (badge visual)
  // ------------------------------------------------------------
  // Define un color diferente para cada estado de asignación.
  // Se usan clases Tailwind para definir bordes, fondo y texto.
  // ============================================================
  const estadoColors = {
    Pendiente: "border-yellow-400 bg-yellow-50 text-yellow-800",
    Asignado: "border-blue-400 bg-blue-50 text-blue-800",
    "En Proceso": "border-indigo-400 bg-indigo-50 text-indigo-800",
    Resuelto: "border-green-400 bg-green-50 text-green-800",
    Cerrado: "border-red-400 bg-red-50 text-red-800",
  };

  // ============================================================
  // useEffect → carga de datos al montar el componente
  // ------------------------------------------------------------
  // Llama al servicio AsignacionService para obtener las asignaciones
  // del usuario según su rol. Los datos se agrupan por fecha.
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Llama al endpoint del backend
        const response = await AsignacionService.getAsignaciones({ rolId, userId });

        console.log("🔍 Respuesta del backend:", response.data); // <-- importante para ver la estructura

        // Puede venir como objeto agrupado o como arreglo plano
        const raw = response.data?.data?.asignaciones;

        let all = [];

        if (Array.isArray(raw)) {
          // ✅ Si viene como arreglo plano
          all = raw.map((i) => ({
            ...i,
            fecha_asignacion: i.fecha_asignacion
              ? new Date(i.fecha_asignacion.replace(" ", "T") + "Z")
                .toISOString()
                .split("T")[0]
              : null,
          }));
        } else if (raw && typeof raw === "object") {
          // ✅ Si viene agrupado por fechas
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

        // Actualiza los estados locales
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


  // ============================================================
  // handleFilterWeek → filtra las asignaciones por semana
  // ------------------------------------------------------------
  // Convierte el valor del input tipo "week" en un rango de fechas
  // (lunes a domingo) y filtra las asignaciones dentro de ese rango.
  // ============================================================
  const handleFilterWeek = (value) => {
    setSelectedWeek(value);
    if (!value) {
      setFiltered(data);
      return;
    }

    // Separa año y número de semana (ejemplo: "2025-W43")
    const [year, week] = value.split("-W").map(Number);

    // Calcula el primer día del año y el inicio de la semana seleccionada
    const firstDayOfYear = new Date(year, 0, 1);
    const firstWeekStart = new Date(firstDayOfYear);
    firstWeekStart.setDate(firstDayOfYear.getDate() - firstDayOfYear.getDay() + 1 + (week - 1) * 7);

    // Calcula el último día (domingo) de esa semana
    const lastWeekEnd = new Date(firstWeekStart);
    lastWeekEnd.setDate(firstWeekStart.getDate() + 6);

    // Filtra las asignaciones dentro de ese rango de fechas
    const filteredByWeek = data.filter((a) => {
      if (!a.fecha_asignacion) return false;
      const fecha = new Date(a.fecha_asignacion + "T00:00:00");
      return (
        fecha.getTime() >= firstWeekStart.setHours(0, 0, 0, 0) &&
        fecha.getTime() <= lastWeekEnd.setHours(23, 59, 59, 999)
      );
    });

    // Actualiza el estado con el nuevo filtro
    setFiltered(filteredByWeek);
  };

  // ============================================================
  //  Estados de carga y error
  // ============================================================
  if (loading) return <LoadingGrid />; // muestra animación de carga
  if (error) return <ErrorAlert title="Error" message={error} />; // muestra mensaje de error

  // ============================================================
  //  Determinar la semana base (por defecto, la actual)
  // ------------------------------------------------------------
  // Si el usuario selecciona una semana, se usa esa como referencia.
  // Si no, se calcula automáticamente la semana actual (lunes a domingo).
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
      const day = today.getDay() === 0 ? 7 : today.getDay(); // Si es domingo, se toma como día 7
      const monday = new Date(today);
      monday.setDate(today.getDate() - day + 1); // retrocede hasta el lunes
      return monday;
    })();

  // ============================================================
  //  Crear arreglo de días (lunes a domingo)
  // ------------------------------------------------------------
  // Genera un arreglo con 7 objetos (uno por día),
  // incluyendo nombre, fecha ISO y formato corto para mostrar.
  // ============================================================
  const diasSemana = Array.from({ length: 7 }).map((_, i) => {
    const fecha = new Date(baseDate);
    fecha.setDate(baseDate.getDate() + i);
    const fechaISO = fecha.toLocaleDateString("sv-SE"); // formato ISO local YYYY-MM-DD
    return {
      nombre: fecha.toLocaleDateString("es-CR", { weekday: "long" }),
      fechaISO,
      fechaMostrar: `${fecha.getDate()} ${fecha.toLocaleString("es-CR", { month: "short" })}`,
    };
  });

  // ============================================================
  // Agrupar asignaciones por fecha real
  // ------------------------------------------------------------
  // Convierte el arreglo de asignaciones en un objeto donde
  // cada clave es una fecha, y su valor es un arreglo de tickets.
  // ============================================================
  const asignacionesPorFecha = filtered.reduce((acc, asignacion) => {
    const fecha = asignacion.fecha_asignacion
      ? new Date(asignacion.fecha_asignacion).toISOString().split("T")[0]
      : "Sin fecha";
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(asignacion);
    return acc;
  }, {});

  // Variables auxiliares para mostrar el rango de la semana actual
  const inicioSemana = diasSemana[0].fechaMostrar;
  const finSemana = diasSemana[6].fechaMostrar;

  // ============================================================
  //  Renderizado principal de la interfaz
  // ============================================================
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Título y descripción general */}
      <h1 className="text-3xl font-bold mb-2 text-blue-900">
        {rolId === 1 ? "Asignaciones Generales" : "Mis Asignaciones Semanales"}
      </h1>
      <p className="text-gray-600 mb-2">
        Vista tipo calendario semanal (lunes a domingo), con agrupación diaria.
      </p>
      <p className="text-sm text-gray-700 italic mb-6">
        Semana del <b>{inicioSemana}</b> al <b>{finSemana}</b>
      </p>

      {/*  Filtro de semana */}
      <div className="flex items-center gap-3 mb-8">
        <label className="text-sm font-medium text-gray-700">Filtrar por semana:</label>
        <input
          type="week"
          value={selectedWeek}
          onChange={(e) => handleFilterWeek(e.target.value)}
          className="border p-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/*  Vista completa tipo calendario */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {diasSemana.map((dia) => {
          // Obtiene todas las asignaciones del día actual
          const asignacionesDelDia = asignacionesPorFecha[dia.fechaISO] || [];

          return (
            <Card
              key={dia.fechaISO}
              className="border border-blue-100 shadow-md rounded-xl hover:shadow-lg transition-all bg-white/90 backdrop-blur-sm"
            >
              {/*  Encabezado del día (nombre + fecha) */}
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-t-xl">
                <CardTitle className="flex justify-between items-center">
                  <span className="capitalize">{dia.nombre}</span>
                  <span className="text-sm text-white/80">{dia.fechaMostrar}</span>
                </CardTitle>
              </CardHeader>

              {/*  Contenido de asignaciones del día */}
              <CardContent className="space-y-3 bg-white rounded-b-xl min-h-[160px] p-4">
                {asignacionesDelDia.length > 0 ? (
                  asignacionesDelDia.map((a, idx) => {
                    //  Cálculo real de SLA (porcentaje de tiempo restante)
                    //  Normalización de fechas (convierte MySQL -> formato ISO correcto)
                    const parseToLocalDate = (str) => {
                      if (!str) return null;
                      // Si la cadena viene como 'YYYY-MM-DD HH:mm:ss'
                      return new Date(str.replace(" ", "T"));
                    };

                    const fechaInicio = parseToLocalDate(a.fecha_creacion);
                    const fechaLimite = parseToLocalDate(a.sla_resol_limite);
                    const ahora = new Date();


                    // Diferencia total y tiempo transcurrido
                    const totalMs = fechaLimite - fechaInicio;
                    const transcurridoMs = ahora - fechaInicio;

                    // Porcentaje de SLA restante
                    let slaProgress = 100 - (transcurridoMs / totalMs) * 100;
                    if (slaProgress < 0) slaProgress = 0;
                    if (slaProgress > 100) slaProgress = 100;

                    // Estado textual del SLA
                    const slaStatus = ahora > fechaLimite ? "Vencido" : "En curso";

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border-l-4 ${estadoColors[a.estado] || "border-gray-300"
                          } shadow-sm hover:shadow-md transition`}
                      >
                        {/*  Encabezado de ticket */}
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              #{a.ticket_id} — {a.titulo}
                            </p>
                            <p className="text-xs text-gray-600">
                              Categoría: <strong>{a.categoria}</strong>
                            </p>
                            <p
                              className={`text-xs font-medium ${slaStatus === "Vencido" ? "text-black-600" : "text-gray-500"
                                }`}
                            >
                              SLA: {slaStatus} ({Math.round(slaProgress)}%)
                            </p>

                          </div>

                          {/* Etiqueta de estado visual */}
                          <Badge
                            className={`${estadoColors[a.estado] || "bg-gray-200 text-gray-700 border-gray-300"
                              } flex-shrink-0 inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-xs font-medium rounded-full shadow-sm`}
                          >
                            {a.estado}
                          </Badge>
                        </div>

                        {/*  Barra visual del SLA */}
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${slaStatus === "Vencido"
                              ? "bg-red-600"       // 🔴 rojo fuerte cuando está vencido
                              : "bg-green-500"     // 🟢 verde normal si está en curso
                              }`}
                            style={{
                              width: `${slaStatus === "Vencido" ? 100 : slaProgress}%`, // <-- fuerza barra roja completa
                              opacity: slaStatus === "Vencido" ? 1 : 0.9,               // mejora el contraste
                            }}
                          ></div>

                        </div>

                        {/*  Botón para ver detalle del ticket */}
                        <div className="text-right">
                          <Button
                            size="sm"
                            className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
                            onClick={() => navigate(a.ver_detalle)}
                          >
                            Ver detalle
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Si no hay asignaciones para ese día
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
