import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:81/Proyecto/api";

export const NotificationService = {

    async getByUser(userId) {
        const res = await axios.get(`${API_URL}/notificacion/${userId}`);
        return res.data.data;
    },

    async create(data) {
        const res = await axios.post(`${API_URL}/notificacion`, data);
        return res.data;
    },

    async markAsRead(id, usuarioActual) {
        const res = await axios.put(`${API_URL}/notificacion/${id}`, {
            usuario_actual: usuarioActual
        });
        return res.data;
    },

    async markAllAsRead(usuarioActual) {
    const res = await axios.put(`${API_URL}/notificacion`, {
        usuario_actual: usuarioActual,
        marcar_todas: true
    });
    return res.data;
}
};
