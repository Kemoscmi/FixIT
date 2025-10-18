import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL + "categoria";

class CategoriaService {
  // LISTAR TODAS
  // GET -> /categoria
  getCategorias() {
    return axios.get(BASE_URL);
  }

  // OBTENER POR ID
  // GET -> /categoria/{id}
  getCategoriaById(id) {
    return axios.get(`${BASE_URL}/${id}`);
  }
}

export default new CategoriaService();