import axios from 'axios'; // Importa Axios para hacer solicitudes HTTP

// Define la URL base usando la variable del entorno .env
const BASE_URL = import.meta.env.VITE_BASE_URL + 'tecnico'; // Ejemplo: http://localhost:81/Proyecto/api/tecnico

class TecnicoService {
  // 🔹 Método para obtener todos los técnicos
  getTecnicos() {
    return axios.get(BASE_URL) // Hace una solicitud GET al endpoint de técnicos
      .then(response => response.data) // Retorna solo los datos de la respuesta
      .catch(error => { // Manejo de errores
        if (error.response) { // Si el servidor respondió con un error (status 4xx o 5xx)
          console.error('Error al obtener técnicos:', error.response.data);
          throw new Error(error.response.data.message || 'Error al obtener técnicos');
        } else if (error.request) { // Si no hubo respuesta del servidor
          console.error('No se recibió respuesta del servidor:', error.request);
          throw new Error('No se recibió respuesta del servidor');
        } else { // Error en la configuración o ejecución de la solicitud
          console.error('Error al configurar la solicitud:', error.message);
          throw new Error('Error al configurar la solicitud');
        }
      });
  }

  // 🔹 Método para obtener un técnico específico por ID
  getTecnicoById(id) {
    return axios.get(`${BASE_URL}/${id}`) // Solicitud GET con el ID del técnico
      .then(response => response.data) // Retorna solo los datos de la respuesta
      .catch(error => { // Manejo de errores
        if (error.response) { // Error de respuesta del servidor
          console.error('Error al obtener técnico:', error.response.data);
          throw new Error(error.response.data.message || 'Error al obtener técnico');
        } else if (error.request) { // No hubo respuesta del servidor
          console.error('No se recibió respuesta del servidor:', error.request);
          throw new Error('No se recibió respuesta del servidor');
        } else { // Error de configuración
          console.error('Error al configurar la solicitud:', error.message);
          throw new Error('Error al configurar la solicitud');
        }
      });
  }

   // ✅ CREAR
  createTecnico(data) {
    return axios.post(BASE_URL, data)
      .then(res => res.data);
  }

  // ✅ ACTUALIZAR
  updateTecnico(id, data) {
    return axios.put(`${BASE_URL}/${id}`, data)
      .then(res => res.data);
  }
}

// Exporta una instancia del servicio lista para usarse
export default new TecnicoService();
