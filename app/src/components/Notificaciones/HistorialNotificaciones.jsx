import { useEffect, useState } from "react";
import { NotificationService } from "../../services/NotificationService";
import useAuth from "../../auth/store/auth.store";
import { format, isToday, isThisMonth, isThisYear, subDays } from "date-fns";
import { Layers, LogIn, CheckCircle, ExternalLink, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { useLocaleDate } from "@/hooks/useLocaleDate";
import { useNotification } from "../../components/Notificaciones/useNotification";


export default function HistorialNotificaciones() {

    const { t } = useI18n();
    const locale = useLocaleDate();
    const { user } = useAuth();

    const [historial, setHistorial] = useState([]);
    const [filtrado, setFiltrado] = useState([]);
    const [loading, setLoading] = useState(true);

    const { marcarLeida } = useNotification();

    const [filtroFecha, setFiltroFecha] = useState("todo");
    const [filtroTipo, setFiltroTipo] = useState("todos");

    const navigate = useNavigate();

    // Cargar historial
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

    // Filtrar
    useEffect(() => {
        if (!historial.length) return;

        let resultado = historial.map(([fecha, items]) => {
            const itemsFiltrados = items.filter(n => {
                const f = new Date(n.fecha);

                // Filtrar por fecha
                let pasaFecha = false;
                switch (filtroFecha) {
                    case "hoy": pasaFecha = isToday(f); break;
                    case "7dias": pasaFecha = f >= subDays(new Date(), 7); break;
                    case "30dias": pasaFecha = f >= subDays(new Date(), 30); break;
                    case "mes": pasaFecha = isThisMonth(f); break;
                    case "anio": pasaFecha = isThisYear(f); break;
                    default: pasaFecha = true;
                }

                const pasaTipo =
                    filtroTipo === "todos" ||
                    n.tipo === filtroTipo;

                return pasaFecha && pasaTipo;
            });

            return [fecha, itemsFiltrados];
        });

        resultado = resultado.filter(([, items]) => items.length > 0);
        setFiltrado(resultado);
    }, [filtroFecha, filtroTipo, historial]);

    // Agrupación
    function agruparPorFecha(lista) {
        const grupos = {};
        lista.forEach(n => {
            const fecha = format(new Date(n.fecha), "yyyy-MM-dd");
            if (!grupos[fecha]) grupos[fecha] = [];
            grupos[fecha].push(n);
        });
        return Object.entries(grupos).sort(
            (a, b) => new Date(b[0]) - new Date(a[0])
        );
    }

    function icono(tipo) {
        switch (tipo) {
            case "cambio_estado": return <Layers className="text-blue-600" />;
            case "login": return <LogIn className="text-green-600" />;
            default: return <CheckCircle className="text-gray-500" />;
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">

            <h1 className="text-2xl font-bold mb-4">
                {t("notificationsHistory.title")}
            </h1>

            {/* FILTROS */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                {/* FECHA */}
                <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm">
                    <Calendar size={18} className="text-gray-600" />
                    <select
                        value={filtroFecha}
                        onChange={(e) => setFiltroFecha(e.target.value)}
                        className="outline-none text-sm"
                    >
                        <option value="todo">{t("notificationsHistory.filters.all")}</option>
                        <option value="hoy">{t("notificationsHistory.filters.today")}</option>
                        <option value="7dias">{t("notificationsHistory.filters.last7")}</option>
                        <option value="30dias">{t("notificationsHistory.filters.last30")}</option>
                        <option value="mes">{t("notificationsHistory.filters.thisMonth")}</option>
                        <option value="anio">{t("notificationsHistory.filters.thisYear")}</option>
                    </select>
                </div>

                {/* TIPO */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFiltroTipo("todos")}
                        className={`px-3 py-2 rounded-lg text-sm border shadow-sm ${filtroTipo === "todos" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                            }`}
                    >
                        {t("notificationsHistory.filters.types.all")}
                    </button>

                    <button
                        onClick={() => setFiltroTipo("cambio_estado")}
                        className={`px-3 py-2 rounded-lg text-sm border shadow-sm ${filtroTipo === "cambio_estado" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                            }`}
                    >
                        {t("notificationsHistory.filters.types.stateChanges")}
                    </button>

                    <button
                        onClick={() => setFiltroTipo("login")}
                        className={`px-3 py-2 rounded-lg text-sm border shadow-sm ${filtroTipo === "login" ? "bg-green-600 text-white" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                            }`}
                    >
                        {t("notificationsHistory.filters.types.logins")}
                    </button>
                </div>
            </div>

            {loading && (
                <p className="text-center py-10">
                    {t("notificationsHistory.loading")}
                </p>
            )}

            {!loading && filtrado.length === 0 && (
                <p className="text-center text-gray-500">
                    {t("notificationsHistory.empty")}
                </p>
            )}

            {/* HISTORIAL */}
            <div className="space-y-8">
                {filtrado.map(([fecha, items]) => (
                    <div key={fecha}>

                        {/* FECHA TRADUCIDA */}
                        <h2 className="text-lg font-semibold text-gray-700 mb-3">
                            {format(new Date(fecha), "PPPP", { locale })}
                        </h2>

                        <div className="space-y-3">
                            {items.map(n => (
                                <div key={n.id} className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition">

                                    <div className="flex gap-3">
                                        <div className="pt-1">{icono(n.tipo)}</div>

                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">{n.mensaje}</h3>

                                            {n.remitente_nombre && (
                                                <p className="text-xs text-gray-500">
                                                    {t("notificationsHistory.by")} {n.remitente_nombre}
                                                </p>
                                            )}

                                            <p className="text-xs text-gray-500">
                                                {format(new Date(n.fecha), "Pp", { locale })}
                                            </p>

                                            <div className="flex gap-4 mt-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${n.estado === "no_leida"
                                                        ? "bg-blue-100 text-blue-600"
                                                        : "bg-gray-200 text-gray-600"
                                                    }`}>
                                                    {n.estado === "no_leida"
                                                        ? t("notificationsHistory.states.unread")
                                                        : t("notificationsHistory.states.read")}
                                                </span>

                                                {n.estado === "no_leida" && (
                                                    <button
                                                        onClick={async () => {
                                                            await marcarLeida(n.id);

                                                            setHistorial(prev =>
                                                                prev.map(([fecha, items]) => [
                                                                    fecha,
                                                                    items.map(item =>
                                                                        item.id === n.id ? { ...item, estado: "leida" } : item
                                                                    )
                                                                ])
                                                            );

                                                            setFiltrado(prev =>
                                                                prev.map(([fecha, items]) => [
                                                                    fecha,
                                                                    items.map(item =>
                                                                        item.id === n.id ? { ...item, estado: "leida" } : item
                                                                    )
                                                                ])
                                                            );
                                                        }}
                                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                                                    >
                                                        <CheckCircle size={14} />
                                                        {t("notifications.markRead")}
                                                    </button>
                                                )}


                                                {n.referencia_ticket && (
                                                    <button
                                                        onClick={() => navigate(`/tickets/${n.referencia_ticket}`)}
                                                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        <ExternalLink size={14} />
                                                        {t("notificationsHistory.viewTicket")}
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
