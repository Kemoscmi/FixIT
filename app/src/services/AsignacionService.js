import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL + "AsignacionController";

class AsignacionService {
  // TABLERO SEMANAL DEL TÉCNICO
  // GET -> /AsignacionController/semana?rol_id=2&user_id=2&date=YYYY-MM-DD
  getSemana({ rolId, userId, date }) {
    if (!rolId || !userId)
      return Promise.reject("Faltan parámetros: rolId y userId");
    return axios.get(`${BASE_URL}/semana`, {
      params: { rol_id: rolId, user_id: userId, date },
    });
  }
}

export default new AsignacionService();