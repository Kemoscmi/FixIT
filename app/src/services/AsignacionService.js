import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "AsignacionController";

class AsignacionService {
  // GET -> /AsignacionController/semana?rol_id=2&user_id=3&date=YYYY-MM-DD
  getAsignaciones({ rolId, userId, date }) {
    if (!rolId || !userId)
      return Promise.reject("Faltan parámetros obligatorios: rolId y userId");

    const params = date
      ? { rol_id: rolId, user_id: userId, date }
      : { rol_id: rolId, user_id: userId };

    return axios.get(`${BASE_URL}/semana`, { params });
  }

  // GET -> /AsignacionController/auto?ticket_id=123
  asignarAuto(ticketId) {
    if (!ticketId) return Promise.reject("Ticket no válido");
    return axios.get(`${BASE_URL}/auto`, {
      params: { ticket_id: ticketId },
    });
  }
// GET → Asignación automática de TODOS los tickets pendientes
// /AsignacionController/asignarPendientes
asignarPendientes() {
  return axios.get(`${BASE_URL}/asignarPendientes`);
}



getTecnicosByTicket(ticketId) {
  return axios.get(`${BASE_URL}/tecnicos`, {
    params: { ticket_id: ticketId }
  });
}


  // GET -> /AsignacionController/tecnicos?ticket_id=123
  getTecnicosManual(ticketId) {
    if (!ticketId) return Promise.reject("Ticket no válido");
    return axios.get(`${BASE_URL}/tecnicos`, {
      params: { ticket_id: ticketId },
    });
  }

  // POST -> /AsignacionController/manual
  // Body (FormData o x-www-form-urlencoded):
  //  ticket_id, tecnico_id, justificacion
  asignarManual({ ticket_id, tecnico_id, justificacion }) {
    if (!ticket_id || !tecnico_id || !justificacion) {
      return Promise.reject("Datos incompletos para asignación manual");
    }

    const formData = new FormData();
    formData.append("ticket_id", ticket_id);
    formData.append("tecnico_id", tecnico_id);
    formData.append("justificacion", justificacion);

    return axios.post(`${BASE_URL}/manual`, formData);
  }
  getTicketsPendientes(filters = {}) {
  return axios.get(`${BASE_URL}/pendientes`, { params: filters });
}
}

export default new AsignacionService();
