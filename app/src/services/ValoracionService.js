import axios from 'axios'; // Importa Axios para hacer solicitudes HTTP

// Define la URL base usando la variable del entorno .env
const BASE_URL = import.meta.env.VITE_BASE_URL + 'valoracion'; // Ejemplo: http://localhost:81/Proyecto/api/valoraciones

class ValoracionService {
  // 🔹 Método para obtener todas las valoraciones
  getValoraciones() {
    return axios.get(BASE_URL) // Hace una solicitud GET al endpoint de valoraciones
      .then(response => response.data) // Retorna solo los datos de la respuesta
      .catch(error => { // Manejo de errores
        if (error.response) { // Si el servidor respondió con un error (status 4xx o 5xx)
          console.error('Error al obtener valoraciones:', error.response.data);
          throw new Error(error.response.data.message || 'Error al obtener valoraciones');
        } else if (error.request) { // Si no hubo respuesta del servidor
          console.error('No se recibió respuesta del servidor:', error.request);
          throw new Error('No se recibió respuesta del servidor');
        } else { // Error en la configuración o ejecución de la solicitud
          console.error('Error al configurar la solicitud:', error.message);
          throw new Error('Error al configurar la solicitud');
        }
      });
  }

getValoracionById(id, rolId, userId) {
  return axios.get(`${BASE_URL}/${id}?rol_id=${rolId}&user_id=${userId}`) 
    .then(response => response.data) 
    .catch(error => { 
      console.error('Error al obtener valoración:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al obtener valoración');
    });
}


  // 🔹 Método para crear una nueva valoración
  createValoracion(data) {
    return axios.post(BASE_URL, data) // Realiza una solicitud POST con los datos para crear la valoración
      .then(res => res.data) // Retorna los datos de la respuesta
      .catch(error => {
        console.error('Error al crear valoración:', error); // Manejo de errores
        throw new Error('Error al crear valoración');
      });
  }

  // 🔹 Método para actualizar una valoración existente
  updateValoracion(id, data) {
    return axios.put(`${BASE_URL}/${id}`, data) // Realiza una solicitud PUT para actualizar la valoración
      .then(res => res.data) // Retorna los datos de la respuesta
      .catch(error => {
        console.error('Error al actualizar valoración:', error); // Manejo de errores
        throw new Error('Error al actualizar valoración');
      });
  }

  // 🔹 Método para eliminar una valoración
  deleteValoracion(id) {
    return axios.delete(`${BASE_URL}/${id}`) // Realiza una solicitud DELETE para eliminar la valoración
      .then(res => res.data) // Retorna los datos de la respuesta
      .catch(error => {
        console.error('Error al eliminar valoración:', error); // Manejo de errores
        throw new Error('Error al eliminar valoración');
      });
  }

getValoracionesPorRol(userId, roleId) {
  // Usar query parameters en lugar de la URL como en la configuración actual
  return axios.get(`${BASE_URL}?rol_id=${roleId}&user_id=${userId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error al obtener valoraciones filtradas por rol:', error);
      throw new Error('Error al obtener valoraciones filtradas');
    });
}


}

// Exporta una instancia del servicio lista para usarse
export default new ValoracionService();
