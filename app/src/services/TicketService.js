import axios from "axios";

// BASE: apunta al directorio de tu API PHP (termina en '/')
// Ejemplo en .env: VITE_BASE_URL="http://localhost:81/Proyecto/api/"
const BASE_URL = import.meta.env.VITE_BASE_URL + "TicketController";

class TicketService {
  /**
   * ✅ LISTADO DE TICKETS SEGÚN ROL
   *  - Admin (rolId = 1): todos los tickets
   *  - Técnico (rolId = 2): solo los asignados a él
   *  - Cliente (rolId = 3): solo los creados por él
   */
  async getTickets({ rolId, userId }) {
    try {
      if (!rolId || !userId) {
        throw new Error("Faltan parámetros: rolId y userId");
      }

      // ✅ construye exactamente lo que el backend espera
      const url = `${BASE_URL}?rol_id=${rolId}&user_id=${userId}`;
      const response = await axios.get(url);
      return response;
    } catch (error) {
      console.error("❌ Error en TicketService.getTickets:", error);
      throw error;
    }
  }

  /**
   * ✅ DETALLE DE TICKET POR ID
   * GET -> {BASE_URL}/{id}?rol_id=1&user_id=1
   */
  async getTicketById(id, { rolId, userId }) {
    try {
      if (!id || !rolId || !userId) {
        throw new Error("Faltan parámetros: id, rolId y userId");
      }

      // ✅ backend usa /TicketController/{id}
      const url = `${BASE_URL}/${id}?rol_id=${rolId}&user_id=${userId}`;
      const response = await axios.get(url);
      return response;
    } catch (error) {
      console.error("❌ Error en TicketService.getTicketById:", error);
      throw error;
    }
  }

  /**
   * ✅ OBTENER TICKETS RECIENTES
   * GET -> {BASE_URL}/recientes
   */
  async getRecientes() {
    try {
      const response = await axios.get(`${BASE_URL}/recientes`);
      return response;
    } catch (error) {
      console.error("❌ Error en TicketService.getRecientes:", error);
      throw error;
    }
  }

  /**
 * ACTUALIZAR ESTADO DEL TICKET
 * PUT -> {BASE_URL}/updateEstado
 * Body:
 * {
 *   ticket_id: number,
 *   nuevo_estado_id: number,
 *   usuario_id: number
 * }
 */
updateEstado(payload) {
  return axios.put(`${BASE_URL}/updateEstado`, payload);
}
/**
 * ✅ SUBIR IMÁGENES DEL ESTADO
 * POST -> {BASE_URL}/ImagenesEstado/upload
 * Body: FormData con:
 *   - historial_id
 *   - imagenes[] (múltiples archivos)
 */
async uploadImagenes(historialId, imagenes) {
  try {
    const formData = new FormData();
    formData.append("historial_id", historialId);
    imagenes.forEach((file) => formData.append("imagenes[]", file));

    const response = await axios.post(
      import.meta.env.VITE_BASE_URL + "ImagenesEstado/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error al subir imágenes:", error);
    throw error;
  }
}




}

export default new TicketService();
