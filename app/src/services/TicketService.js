import axios from 'axios';

// BASE: apunta al directorio de tu API PHP (termina en '/')
// Ejemplo en .env:  VITE_BASE_URL="http://localhost:81/Proyecto/api/"
const BASE_URL = import.meta.env.VITE_BASE_URL + 'TicketController';

class TicketService {
  /**
   * LISTADO POR ROL
   * GET -> {BASE_URL}?rol_id=1&user_id=1
   * Params:
   *  - rolId: 1=Admin | 2=Tecnico | 3=Cliente (obligatorio)
   *  - userId: ID del usuario (obligatorio)
   */
  getTickets({ rolId, userId }) {
    if (!rolId || !userId) {
      return Promise.reject(new Error('Faltan parámetros: rolId y userId'));
    }
    return axios.get(BASE_URL, {
      params: { rol_id: rolId, user_id: userId },
    });
  }

  /**
   * DETALLE DE TICKET
   * GET -> {BASE_URL}/{id}?rol_id=1&user_id=1
   * Params:
   *  - id: ID del ticket (obligatorio)
   *  - rolId: 1=Admin | 2=Tecnico | 3=Cliente (obligatorio)
   *  - userId: ID del usuario (obligatorio)
   */
  getTicketById(id, { rolId, userId }) {
    if (!id || !rolId || !userId) {
      return Promise.reject(new Error('Faltan parámetros: id, rolId y userId'));
    }
    return axios.get(`${BASE_URL}/${id}`, {
      params: { rol_id: rolId, user_id: userId },
    });
  }

  /**
   * 🔹 OBTENER TICKETS RECIENTES
   * GET -> {BASE_URL}/recientes
   * Devuelve los últimos tickets creados en el sistema.
   */
  getRecientes() {
    return axios.get(`${BASE_URL}/recientes`);
  }

  // --- Métodos futuros (cuando los tengas en tu API) ---
  // createTicket(payload) { ... }
  // updateEstado(id, body) { ... }
  // cerrar(id, body) { ... }
  // uploadImagen(id, formData) { ... }
  // getAsignacionesSemana({ tecnico_id, base }) { ... }
  // getNotificaciones() { ... }
  // valorar(id, body) { ... }
}

export default new TicketService();
