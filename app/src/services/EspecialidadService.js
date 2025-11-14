import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "especialidad";

class EspecialidadService {
  getEspecialidades() {
    return axios
      .get(BASE_URL)
      .then((res) => res.data.data) // <-- ESTA ES LA DATA REAL
      .catch((err) => {
        console.error("Error al cargar especialidades:", err);
        return [];
      });
  }
}

export default new EspecialidadService();
