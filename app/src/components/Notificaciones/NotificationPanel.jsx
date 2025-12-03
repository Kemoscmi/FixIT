import { useEffect, useRef } from "react";
import { useNotification } from "./useNotification";
import { Layers, LogIn, CheckCircle, ExternalLink, Bell } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { useLocaleDate } from "@/hooks/useLocaleDate";

// TRADUCIR MENSAJE DINÁMICO
const translateDynamicMessage = (rawMessage, t) => {
    if (!rawMessage) return rawMessage;

    // Login
    const m1 = rawMessage.match(/^El usuario (.+) inició sesión$/);
    if (m1)
        return t("notifications.login", { user: m1[1] });

    // Cambio de estado
    const m2 = rawMessage.match(/^El ticket #(\d+) cambió a (.+)$/);
    if (m2)
        return t("notifications.ticketStateChanged", {
            id: m2[1],
            state: m2[2]
        });

    return rawMessage;
};

export default function NotificationPanel() {

    const { t } = useI18n();
    const locale = useLocaleDate();

    const {
        notificaciones,
        open,
        marcarLeida,
        marcarTodas,
        togglePanel
    } = useNotification();

    const panelRef = useRef(null);
    const navigate = useNavigate();

    // Cerrar al click afuera
    useEffect(() => {
        function handleClickOutside(e) {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                togglePanel();
            }
        }
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [open, togglePanel]);

    if (!open) return null;

    const gruposPorDia = agruparPorDia(notificaciones);

    return (
        <div
            ref={panelRef}
            className="absolute right-6 top-16 w-[420px] bg-white shadow-2xl border border-gray-200 rounded-xl p-4 z-50 animate-fade-slide"
        >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Bell className="text-indigo-600" size={18} />
                    {t("notifications.title")}
                </h2>

                <div className="flex items-center gap-4">

                    {notificaciones.length > 0 && (
                        <button
                            onClick={marcarTodas}
                            className="text-blue-600 text-xs font-semibold flex items-center gap-1 hover:text-blue-800"
                        >
                            <CheckCircle size={16} />
                            {t("notifications.markAll")}
                        </button>
                    )}

                    <button
                        onClick={() => {
                            togglePanel();
                            navigate("/historial");
                        }}
                        className="text-blue-600 text-xs font-semibold flex items-center gap-1 hover:text-blue-800"
                    >
                        {t("notifications.viewHistory")} →
                    </button>
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto pr-1 space-y-5">

                {notificaciones.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                        {t("notifications.empty")}
                    </p>
                )}

                {/* AGRUPACIÓN POR DÍA */}
                {gruposPorDia.map(([fecha, items]) => (
                    <div key={fecha}>

                        {/* Fecha TRADUCIDA */}
                        <p className="text-xs font-semibold text-gray-500 mb-1 px-1">
                            {format(new Date(fecha), "PPPP", { locale })}
                        </p>

                        <div className="space-y-2">
                            {items.map((n) => {

                                const mensajeTraducido =
                                    translateDynamicMessage(n.mensaje, t);

                                return (
                                    <div
                                        key={n.id}
                                        className={`p-3 rounded-lg border transition shadow-sm text-sm flex gap-3 ${
                                            n.estado === "no_leida"
                                                ? "bg-blue-50 border-blue-400"
                                                : "bg-gray-100 border-gray-300"
                                        }`}
                                    >
                                        <div className="pt-1">
                                            {n.tipo === "cambio_estado" &&
                                                <Layers className="text-blue-600" size={18} />}
                                            {n.tipo === "login" &&
                                                <LogIn className="text-green-600" size={18} />}
                                        </div>

                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800 text-sm">
                                                {mensajeTraducido}
                                            </p>

                                            <p className="text-[11px] text-gray-500 mt-1">
                                                {format(new Date(n.fecha), "Pp", { locale })}
                                            </p>

                                            <div className="flex gap-3 mt-1 items-center">
                                                {n.referencia_ticket && (
                                                    <button
                                                        onClick={() => navigate(`/tickets/${n.referencia_ticket}`)}
                                                        className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        <ExternalLink size={12} />
                                                        {t("notifications.viewTicket")}
                                                    </button>
                                                )}

                                                {n.estado === "no_leida" && (
                                                    <button
                                                        onClick={() => marcarLeida(n.id)}
                                                        className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                                                    >
                                                        <CheckCircle size={12} />
                                                        {t("notifications.markRead")}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// AGRUPAR DÍAS
function agruparPorDia(lista) {
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
