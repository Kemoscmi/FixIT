import axios from "axios"; // Importa Axios para realizar peticiones HTTP

// Define la URL base del endpoint de categorías usando la variable de entorno
const BASE_URL = import.meta.env.VITE_BASE_URL + "categoria"; // Ej: http://localhost:81/Proyecto/api/categoria

class CategoriaService {
  // 🔹 Obtener todas las categorías
  getCategorias() {
    return axios
      .get(BASE_URL) // Realiza la solicitud GET al endpoint principal
      .then((response) => response.data) // Devuelve solo los datos de la respuesta
      .catch((error) => { // Si ocurre un error
        console.error("Error al obtener categorías:", error); // Muestra el error en consola
        throw new Error("No se pudieron obtener las categorías"); // Lanza mensaje amigable al usuario
      });
  }

  // 🔹 Obtener una categoría específica por su ID
  getCategoriaById(id) {
    return axios
      .get(`${BASE_URL}/${id}`) // Realiza GET con el ID al final de la URL
      .then((response) => response.data) // Retorna los datos obtenidos
      .catch((error) => { // Manejo de errores
        console.error("Error al obtener categoría:", error);
        throw new Error("No se pudo obtener la categoría");
      });
  }
}

// Exporta una instancia del servicio lista para usar en cualquier componente
export default new CategoriaService();
