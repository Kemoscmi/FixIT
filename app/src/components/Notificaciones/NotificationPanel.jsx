import { useEffect, useRef } from "react";
import { useNotification } from "./useNotification";
import { Layers, LogIn, CheckCircle, ExternalLink, Bell } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export default function NotificationPanel() {

    const {
        notificaciones,
        open,
        marcarLeida,
        marcarTodas,
        togglePanel
    } = useNotification();

    const panelRef = useRef(null);
    const navigate = useNavigate();

    // Cerrar al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(e) {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                togglePanel();
            }
        }

        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open, togglePanel]);

    if (!open) return null;

    // Agrupar notificaciones por día
    const gruposPorDia = agruparPorDia(notificaciones);

    return (
        <div
            ref={panelRef}
            className="
                absolute right-6 top-16 w-[420px]
                bg-white shadow-2xl border border-gray-200 rounded-xl 
                p-4 z-50 animate-fade-slide
            "
        >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-3">

                {/* Título */}
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Bell className="text-indigo-600" size={18} />
                    Notificaciones
                </h2>

                {/* BOTONES DERECHA - agrupados */}
                <div className="flex items-center gap-4">

                    {notificaciones.length > 0 && (
                        <button
                            onClick={marcarTodas}
                            className="text-blue-600 text-xs font-semibold 
                           flex items-center gap-1 hover:text-blue-800"
                        >
                            <CheckCircle size={16} /> Marcar todas
                        </button>
                    )}

                    <button
                        onClick={() => {
                            togglePanel();
                            navigate("/historial");
                        }}
                        className="text-blue-600 text-xs font-semibold 
                       flex items-center gap-1 hover:text-blue-800"
                    >
                        Ver historial →
                    </button>

                </div>
            </div>


            <div className="max-h-96 overflow-y-auto pr-1 space-y-5">

                {notificaciones.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                        No hay notificaciones
                    </p>
                )}

                {/* AGRUPACIÓN POR DÍA */}
                {gruposPorDia.map(([fecha, items]) => (
                    <div key={fecha}>
                        {/* Encabezado de fecha */}
                        <p className="text-xs font-semibold text-gray-500 mb-1 px-1">
                            {format(new Date(fecha), "EEEE dd 'de' MMMM", { locale: es })}
                        </p>

                        <div className="space-y-2">
                            {items.map((n) => (
                                <div
                                    key={n.id}
                                    className={`
                                        p-3 rounded-lg border transition shadow-sm text-sm
                                        flex gap-3
                                        ${n.estado === "no_leida"
                                            ? "bg-blue-50 border-blue-400"
                                            : "bg-gray-100 border-gray-300"}
                                    `}
                                >
                                    {/* Ícono */}
                                    <div className="pt-1">
                                        {n.tipo === "cambio_estado" && (
                                            <Layers className="text-blue-600" size={18} />
                                        )}
                                        {n.tipo === "login" && (
                                            <LogIn className="text-green-600" size={18} />
                                        )}
                                    </div>

                                    {/* Contenido */}
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800 text-sm">
                                            {n.mensaje}
                                        </p>

                                        <p className="text-[11px] text-gray-500 mt-1">
                                            {format(new Date(n.fecha), "dd/MM/yyyy HH:mm")}
                                        </p>

                                        <div className="flex gap-3 mt-1 items-center">

                                            {/* Ver ticket */}
                                            {n.referencia_ticket && (
                                                <button
                                                    onClick={() => navigate(`/tickets/${n.referencia_ticket}`)}
                                                    className="flex items-center gap-1 text-[11px] 
                                                               text-indigo-600 hover:text-indigo-800"
                                                >
                                                    <ExternalLink size={12} />
                                                    Ver ticket
                                                </button>
                                            )}

                                            {/* Marcar como leída */}
                                            {n.estado === "no_leida" && (
                                                <button
                                                    onClick={() => marcarLeida(n.id)}
                                                    className="
                                                        flex items-center gap-1 text-[11px] 
                                                        text-blue-600 hover:text-blue-800 font-semibold
                                                    "
                                                >
                                                    <CheckCircle size={12} />
                                                    Marcar leída
                                                </button>
                                            )}

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

// Helper para agrupar por día (yyyy-MM-dd)
function agruparPorDia(lista) {
    const grupos = {};

    lista.forEach(n => {
        const fecha = format(new Date(n.fecha), "yyyy-MM-dd");
        if (!grupos[fecha]) grupos[fecha] = [];
        grupos[fecha].push(n);
    });

    // Orden descendente por fecha
    return Object.entries(grupos).sort(
        (a, b) => new Date(b[0]) - new Date(a[0])
    );
}
