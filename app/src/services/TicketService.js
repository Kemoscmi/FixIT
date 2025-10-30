// ============================================================
//  Archivo: TicketService.js
// Descripción:
//   Este servicio centraliza todas las peticiones HTTP (API calls)
//   que se hacen desde el frontend hacia el backend PHP.
//   Usa la librería Axios para realizar solicitudes GET y POST.
// ============================================================

//  Importa la librería axios para hacer solicitudes HTTP (GET, POST, PUT, etc.)
import axios from "axios";

// ============================================================
//  BASE_URL
// ------------------------------------------------------------
// BASE_URL apunta al directorio principal de la API en PHP.
// Se obtiene desde el archivo .env (variable de entorno VITE_BASE_URL)
// y se concatena con el nombre del controlador "TicketController".
// ------------------------------------------------------------
// Ejemplo real en tu .env:
//   VITE_BASE_URL="http://localhost:81/Proyecto/api/"
// Por tanto, BASE_URL quedaría como:
//   "http://localhost:81/Proyecto/api/TicketController"
// ============================================================
const BASE_URL = import.meta.env.VITE_BASE_URL + "TicketController";

// ============================================================
// Clase: TicketService
// ------------------------------------------------------------
// Contiene métodos asincrónicos para interactuar con los endpoints
// del backend relacionados con los Tickets.
// Se exporta como un objeto único (Singleton) para usarlo en toda la app.
// ============================================================
class TicketService {

  /**
   *  MÉTODO: getTickets()
   * ----------------------------------------------------------
   * Descripción:
   *   Obtiene el listado de tickets según el rol del usuario.
   *   Cada rol tiene visibilidad diferente:
   *     - Admin (rolId = 1): ve todos los tickets.
   *     - Técnico (rolId = 2): ve solo los tickets asignados a él.
   *     - Cliente (rolId = 3): ve solo los tickets que él creó.
   * ----------------------------------------------------------
   * Parámetros esperados:
   *   { rolId, userId } → ambos son obligatorios
   * ----------------------------------------------------------
   * Retorna:
   *   La respuesta completa del servidor (objeto Axios Response).
   */
  async getTickets({ rolId, userId }) {
    try {
      //  Validación: si faltan parámetros, lanza error
      if (!rolId || !userId) {
        throw new Error("Faltan parámetros: rolId y userId");
      }

      //  Construye la URL exactamente como el backend la espera
      // Ejemplo: http://localhost:81/Proyecto/api/TicketController?rol_id=1&user_id=3
      const url = `${BASE_URL}?rol_id=${rolId}&user_id=${userId}`;

      // Realiza la solicitud GET usando axios
      const response = await axios.get(url);

      // Devuelve la respuesta al componente que la llamó
      return response;
    } catch (error) {
      //  Si algo falla, lo muestra en consola
      console.error(" Error en TicketService.getTickets:", error);
      throw error; // Propaga el error hacia el componente
    }
  }

  /**
   *  MÉTODO: getTicketById()
   * ----------------------------------------------------------
   * Descripción:
   *   Obtiene el detalle completo de un ticket específico.
   * ----------------------------------------------------------
   * Endpoint del backend:
   *   GET -> {BASE_URL}/{id}?rol_id=1&user_id=1
   * Ejemplo:
   *   http://localhost:81/Proyecto/api/TicketController/5?rol_id=2&user_id=4
   * ----------------------------------------------------------
   * Parámetros:
   *   - id: número de ticket
   *   - { rolId, userId }: datos del usuario logueado
   */
  async getTicketById(id, { rolId, userId }) {
    try {
      // Validación: si falta alguno, lanza error
      if (!id || !rolId || !userId) {
        throw new Error("Faltan parámetros: id, rolId y userId");
      }

      // Arma la URL como el backend la define (usa path variable)
      // Ejemplo: BASE_URL/5?rol_id=1&user_id=1
      const url = `${BASE_URL}/${id}?rol_id=${rolId}&user_id=${userId}`;

      //  Ejecuta la petición GET al servidor
      const response = await axios.get(url);

      //  Devuelve la respuesta
      return response;
    } catch (error) {
      console.error("❌ Error en TicketService.getTicketById:", error);
      throw error;
    }
  }

  /**
   *  MÉTODO: getRecientes()
   * ----------------------------------------------------------
   * Descripción:
   *   Obtiene los tickets más recientes (por ejemplo,
   *   los creados durante la semana actual o últimos días).
   * ----------------------------------------------------------
   * Endpoint del backend:
   *   GET -> {BASE_URL}/recientes
   * Ejemplo:
   *   http://localhost:81/Proyecto/api/TicketController/recientes
   */
  async getRecientes() {
    try {
      // Realiza la petición GET directa al endpoint /recientes
      const response = await axios.get(`${BASE_URL}/recientes`);
      return response;
    } catch (error) {
      console.error(" Error en TicketService.getRecientes:", error);
      throw error;
    }
  }

  /**
   *  MÉTODO: updateEstado()
   * ----------------------------------------------------------
   * Descripción:
   *   Permite actualizar el estado de un ticket,
   *   enviando observaciones e imágenes al backend.
   * ----------------------------------------------------------
   * Endpoint del backend:
   *   POST -> {BASE_URL}/updateEstado
   * ----------------------------------------------------------
   * Body (FormData):
   *   {
   *     ticket_id: number,
   *     nuevo_estado_id: number,
   *     usuario_id: number,
   *     observaciones: string,
   *     imagenes[]: archivos opcionales
   *   }
   * ----------------------------------------------------------
   * Nota:
   *   Se usa FormData porque se envían archivos (imágenes),
   *   y se debe incluir el encabezado "Content-Type: multipart/form-data"
   */
  async updateEstado(formData) {
    //  Envía la solicitud POST con el cuerpo formData
    //   formData se construye en el componente React (DetailTicket.jsx)
    return await axios.post(`${BASE_URL}/updateEstado`, formData, {
      headers: { "Content-Type": "multipart/form-data" }, // tipo de contenido
    });
  }

  /**
   *  MÉTODO FUTURO: subir imágenes del estado
   * ----------------------------------------------------------
   * Descripción:
   *   Endpoint que permitirá subir evidencias asociadas a un cambio de estado.
   *   Aún no implementado, pero documentado.
   * ----------------------------------------------------------
   * Endpoint esperado:
   *   POST -> {BASE_URL}/ImagenesEstado/upload
   * ----------------------------------------------------------
   * Body (FormData):
   *   {
   *     historial_id: number,
   *     imagenes[]: archivos de imagen
   *   }
   */
}

// ============================================================
//  Exportación
// ------------------------------------------------------------
// Exporta una única instancia de la clase TicketService.
// Así se puede importar como “new TicketService()” sin necesidad
// de instanciarla en cada componente (patrón Singleton).
// ============================================================
export default new TicketService();
