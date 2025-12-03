import { useState, useEffect, useCallback, useRef } from "react";
import NotificationContext from "./NotificationContext";
import { NotificationService } from "../../services/NotificationService";
import useAuth from "../../auth/store/auth.store";
import toast from "react-hot-toast";
import { useI18n } from "@/hooks/useI18n";

// Traducción dinámica solo para mostrar (NO para guardar)
const translateDynamicMessage = (rawMessage, t) => {
  if (!rawMessage) return rawMessage;

  const loginRegex = /^El usuario (.+) inició sesión$/;
  const matchLogin = rawMessage.match(loginRegex);

  if (matchLogin) {
    return t("notifications.login", { user: matchLogin[1] });
  }

  const stateRegex = /^El ticket #(\d+) cambió a (.+)$/;
  const matchState = rawMessage.match(stateRegex);

  if (matchState) {
    return t("notifications.ticketStateChanged", {
      id: matchState[1],
      state: matchState[2]
    });
  }

  return rawMessage;
};

export function NotificationProvider({ children }) {

  const { user } = useAuth();
  const { t } = useI18n();

  const [notificaciones, setNotificaciones] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const prevRef = useRef([]);
  const pendingReadRef = useRef(new Set());

  const sinLeer = notificaciones.filter(n => n.estado === "no_leida").length;

  // =====================================================
  // Cargar notificaciones (OPTIMIZADO)
  // =====================================================
  const loadNotificaciones = useCallback(async () => {
    if (!user?.id) return;

    const data = await NotificationService.getByUser(user.id);

    const filtered = data.map(n =>
      pendingReadRef.current.has(n.id)
        ? { ...n, estado: "leida" }
        : n
    );

    const prev = prevRef.current;

    const nuevas = filtered.filter(n => !prev.some(old => old.id === n.id));

    nuevas
      .filter(n => n.estado === "no_leida")
      .forEach(n => {
        toast(`🔔 ${translateDynamicMessage(n.mensaje, t)}`, {
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
  // Mark read
  // =====================================================
  const marcarLeida = async (id) => {
    pendingReadRef.current.add(id);

    setNotificaciones(prev =>
      prev.map(n =>
        n.id === id ? { ...n, estado: "leida" } : n
      )
    );

    await NotificationService.markAsRead(id, user.id);

    setTimeout(() => {
      pendingReadRef.current.delete(id);
      loadNotificaciones();
    }, 500);
  };

  const marcarTodas = async () => {
    notificaciones.forEach(n => pendingReadRef.current.add(n.id));

    setNotificaciones(prev =>
      prev.map(n => ({ ...n, estado: "leida" }))
    );

    await NotificationService.markAllAsRead(user.id);

    setTimeout(() => {
      pendingReadRef.current.clear();
      loadNotificaciones();
    }, 500);
  };

  const togglePanel = () => setOpen(prev => !prev);

  // =====================================================
  // AUTO-REFRESH
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
