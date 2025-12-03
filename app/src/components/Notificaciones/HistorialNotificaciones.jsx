import { useEffect, useState } from "react";
import { NotificationService } from "../../services/NotificationService";
import useAuth from "../../auth/store/auth.store";
import { format, isToday, isThisMonth, isThisYear, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Layers, LogIn, CheckCircle, ExternalLink, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HistorialNotificaciones() {
    const { user } = useAuth();
    const [historial, setHistorial] = useState([]);
    const [filtrado, setFiltrado] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filtroFecha, setFiltroFecha] = useState("todo");
    const [filtroTipo, setFiltroTipo] = useState("todos");

    const navigate = useNavigate();

    // =============================
    // Cargar historial
    // =============================
    useEffect(() => {
        if (!user?.id) return;

        async function load() {
            const data = await NotificationService.getByUser(user.id);
            const ordenado = agruparPorFecha(data);
            setHistorial(ordenado);
            setFiltrado(ordenado);
            setLoading(false);
        }

        load();
    }, [user?.id]);

    // =============================
    // Filtrar por fecha y tipo
    // =============================
    useEffect(() => {
        if (!historial.length) return;

        let resultado = historial.map(([fecha, items]) => {
            const itemsFiltrados = items.filter(n => {
                const fechaNoti = new Date(n.fecha);

                // --- FILTRO POR FECHA ---
                let pasaFecha = false;

                switch (filtroFecha) {
                    case "hoy":
                        pasaFecha = isToday(fechaNoti);
                        break;
                    case "7dias":
                        pasaFecha = fechaNoti >= subDays(new Date(), 7);
                        break;
                    case "30dias":
                        pasaFecha = fechaNoti >= subDays(new Date(), 30);
                        break;
                    case "mes":
                        pasaFecha = isThisMonth(fechaNoti);
                        break;
                    case "anio":
                        pasaFecha = isThisYear(fechaNoti);
                        break;
                    default:
                        pasaFecha = true;
                }

                // --- FILTRO POR TIPO ---
                let pasaTipo =
                    filtroTipo === "todos" ||
                    n.tipo === filtroTipo;

                return pasaFecha && pasaTipo;
            });

            return [fecha, itemsFiltrados];
        });

        resultado = resultado.filter(([, items]) => items.length > 0);

        setFiltrado(resultado);
    }, [filtroFecha, filtroTipo, historial]);


    // =============================
    // Agrupar por fecha
    // =============================
    function agruparPorFecha(lista) {
        const grupos = {};

        lista.forEach(n => {
            const fecha = format(new Date(n.fecha), "yyyy-MM-dd");
            if (!grupos[fecha]) grupos[fecha] = [];
            grupos[fecha].push(n);
        });

        return Object.entries(grupos).sort((a, b) => new Date(b[0]) - new Date(a[0]));
    }

    // =============================
    // Iconos
    // =============================
    function icono(tipo) {
        switch (tipo) {
            case "cambio_estado": return <Layers className="text-blue-600" />;
            case "login": return <LogIn className="text-green-600" />;
            default: return <CheckCircle className="text-gray-500" />;
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">

            <h1 className="text-2xl font-bold mb-4">Historial de actividad</h1>

            {/* ======================================================
                FILTROS SUPERIORES (fecha + tipo)
            ======================================================= */}
            <div className="flex flex-wrap items-center gap-4 mb-6">

                {/* Filtro por fecha */}
                <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm">
                    <Calendar size={18} className="text-gray-600" />
                    <select
                        value={filtroFecha}
                        onChange={(e) => setFiltroFecha(e.target.value)}
                        className="outline-none text-sm"
                    >
                        <option value="todo">Todo</option>
                        <option value="hoy">Hoy</option>
                        <option value="7dias">Últimos 7 días</option>
                        <option value="30dias">Últimos 30 días</option>
                        <option value="mes">Este mes</option>
                        <option value="anio">Este año</option>
                    </select>
                </div>

                {/* Filtro por tipo */}
                <div className="flex gap-2">

                    {/* TODOS */}
                    <button
                        onClick={() => setFiltroTipo("todos")}
                        className={`
                            px-3 py-2 rounded-lg text-sm border shadow-sm
                            ${filtroTipo === "todos"
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}
                        `}
                    >
                        Todos
                    </button>

                    {/* Cambios de estado */}
                    <button
                        onClick={() => setFiltroTipo("cambio_estado")}
                        className={`
                            px-3 py-2 rounded-lg text-sm border shadow-sm
                            ${filtroTipo === "cambio_estado"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}
                        `}
                    >
                        Cambios de estado
                    </button>

                    {/* Logins */}
                    <button
                        onClick={() => setFiltroTipo("login")}
                        className={`
                            px-3 py-2 rounded-lg text-sm border shadow-sm
                            ${filtroTipo === "login"
                                ? "bg-green-600 text-white border-green-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}
                        `}
                    >
                        Inicios de sesión
                    </button>
                </div>
            </div>

            {loading && <p className="text-center py-10">Cargando...</p>}

            {!loading && filtrado.length === 0 && (
                <p className="text-center text-gray-500">No hay actividad registrada.</p>
            )}

            {/* =============================
                HISTORIAL AGRUPADO POR DÍA
            ============================== */}
            <div className="space-y-8">
                {filtrado.map(([fecha, items]) => (
                    <div key={fecha}>

                        <h2 className="text-lg font-semibold text-gray-700 mb-3">
                            {format(new Date(fecha), "EEEE dd 'de' MMMM yyyy", { locale: es })}
                        </h2>

                        <div className="space-y-3">
                            {items.map(n => (
                                <div
                                    key={n.id}
                                    className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition"
                                >
                                    <div className="flex gap-3">

                                        <div className="pt-1">{icono(n.tipo)}</div>

                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">{n.mensaje}</h3>

                                            {n.remitente_nombre && (
                                                <p className="text-xs text-gray-500">
                                                    Realizado por: {n.remitente_nombre}
                                                </p>
                                            )}

                                            <p className="text-xs text-gray-500">
                                                {format(new Date(n.fecha), "dd/MM/yyyy HH:mm")}
                                            </p>

                                            <div className="flex gap-4 mt-2">

                                                <span className={`
                                                    text-xs px-2 py-1 rounded-full
                                                    ${n.estado === "no_leida"
                                                        ? "bg-blue-100 text-blue-600"
                                                        : "bg-gray-200 text-gray-600"}
                                                `}>
                                                    {n.estado === "no_leida" ? "No leída" : "Leída"}
                                                </span>

                                                {n.referencia_ticket && (
                                                    <button
                                                        onClick={() =>
                                                            navigate(`/tickets/${n.referencia_ticket}`)
                                                        }
                                                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        <ExternalLink size={14} /> Ver ticket
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}
