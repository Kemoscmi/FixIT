// src/services/CategoriaService.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "categoria"; // ✅ igual que en Postman

class CategoriaService {
  // Obtener todas las categorías
  getCategorias() {
    return axios
      .get(BASE_URL)
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error al obtener categorías:", error);
        throw new Error("No se pudieron obtener las categorías");
      });
  }

  // Obtener categoría por ID
  getCategoriaById(id) {
    return axios
      .get(`${BASE_URL}/${id}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error al obtener categoría:", error);
        throw new Error("No se pudo obtener la categoría");
      });
  }
}

export default new CategoriaService();
