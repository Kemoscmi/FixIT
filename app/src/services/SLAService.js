import axios from "axios";

// Posible endpoint: http://localhost:81/Proyecto/api/sla
const BASE_URL = import.meta.env.VITE_BASE_URL + "sla";

class SlaService {
  getSlas() {
    return axios
      .get(BASE_URL)
      .then((res) => {
        const raw = res.data;
        // Soporta ambos casos: [ ... ] o { data: [ ... ] }
        if (Array.isArray(raw)) return raw;
        if (raw && Array.isArray(raw.data)) return raw.data;
        return [];
      })
      .catch((err) => {
        console.error("Error al cargar SLA:", err);
        return [];
      });
  }

  createSla(data) {
  return axios.post(BASE_URL, data);
}

}

export default new SlaService();
