import { useState, useEffect, useCallback, useRef } from "react";
import NotificationContext from "./NotificationContext";
import { NotificationService } from "../../services/NotificationService";
import useAuth from "../../auth/store/auth.store";
import toast from "react-hot-toast";

export function NotificationProvider({ children }) {

    const { user } = useAuth();
    const [notificaciones, setNotificaciones] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const prevRef = useRef([]);
    const pendingReadRef = useRef(new Set()); 

    const sinLeer = notificaciones.filter(n => n.estado === "no_leida").length;


    // =====================================================
    // Cargar notificaciones
    // =====================================================
    const loadNotificaciones = useCallback(async () => {
        if (!user?.id) return;

        const data = await NotificationService.getByUser(user.id);

        // ❗ EXCLUSIÓN: Si una notificación está "pendiente" de lectura, NO sobreescribir
        const filtered = data.map(n => {
            if (pendingReadRef.current.has(n.id)) {
                return { ...n, estado: "leida" };
            }
            return n;
        });

        // Detectar nuevas
        const prev = prevRef.current;

        const nuevas = filtered.filter(n =>
            !prev.some(old => old.id === n.id)
        );

        nuevas
            .filter(n => n.estado === "no_leida")
            .forEach(n => {
                toast(`🔔 ${n.mensaje}`, {
                    duration: 3500,
                    style: {
                        background: "#1e3a8a",
                        color: "white",
                        borderRadius: "10px",
                        padding: "10px"
                    }
                });
            });

        prevRef.current = filtered;
        setNotificaciones(filtered);
        setLoading(false);

    }, [user?.id]);


    // =====================================================
    // Marcar UNA como leída
    // =====================================================
    const marcarLeida = async (id) => {

        // 🔒 PROTEGER ESTA NOTIFICACIÓN DEL AUTO-REFRESH
        pendingReadRef.current.add(id);

        // UI inmediata
        setNotificaciones(prev =>
            prev.map(n =>
                n.id === id ? { ...n, estado: "leida" } : n
            )
        );

        // Actualizar BD
        await NotificationService.markAsRead(id, user.id);

        // ⏳ Esperar a que BD se sincronice
        setTimeout(() => {
            pendingReadRef.current.delete(id);
            loadNotificaciones();
        }, 800);
    };


    // =====================================================
    // Marcar TODAS como leídas
    // =====================================================
    const marcarTodas = async () => {

        // Marcar todas como pendientes
        notificaciones.forEach(n => pendingReadRef.current.add(n.id));

        // UI inmediata
        setNotificaciones(prev =>
            prev.map(n => ({ ...n, estado: "leida" }))
        );

        // Actualizar BD
        await NotificationService.markAllAsRead(user.id);

        // Sincronizar suave
        setTimeout(() => {
            pendingReadRef.current.clear();
            loadNotificaciones();
        }, 800);
    };


    const togglePanel = () => setOpen(prev => !prev);


    // =====================================================
    // Auto-refresh cada 5 segundos
    // =====================================================
    useEffect(() => {
        if (!user?.id) return;

        loadNotificaciones();

        const interval = setInterval(loadNotificaciones, 5000);
        return () => clearInterval(interval);

    }, [user?.id, loadNotificaciones]);


    return (
        <NotificationContext.Provider value={{
            notificaciones,
            sinLeer,
            open,
            loading,
            togglePanel,
            loadNotificaciones,
            marcarLeida,
            marcarTodas
        }}>
            {children}
        </NotificationContext.Provider>
    );
}
