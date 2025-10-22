// src/services/TecnicoService.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'tecnico';  // Asegúrate de que la URL sea correcta

class TecnicoService {
  // Obtener la lista de técnicos
  getTecnicos() {
    return axios.get(BASE_URL)
      .then(response => response.data)  // Devolvemos solo el cuerpo de la respuesta
      .catch(error => {
        // Aquí manejamos el error de forma más detallada
        if (error.response) {
          // El servidor respondió con un código fuera del rango de 2xx
          console.error('Error al obtener técnicos:', error.response.data);
          throw new Error(error.response.data.message || 'Error al obtener técnicos');
        } else if (error.request) {
          // La solicitud fue hecha pero no se recibió respuesta
          console.error('No se recibió respuesta del servidor:', error.request);
          throw new Error('No se recibió respuesta del servidor');
        } else {
          // Algo ocurrió durante la configuración de la solicitud
          console.error('Error al configurar la solicitud:', error.message);
          throw new Error('Error al configurar la solicitud');
        }
      });
  }

  // Obtener un técnico por ID
  getTecnicoById(id) {
    return axios.get(`${BASE_URL}/${id}`)
      .then(response => response.data)  // Devolvemos solo el cuerpo de la respuesta
      .catch(error => {
        // Aquí manejamos el error de forma más detallada
        if (error.response) {
          // El servidor respondió con un código fuera del rango de 2xx
          console.error('Error al obtener técnico:', error.response.data);
          throw new Error(error.response.data.message || 'Error al obtener técnico');
        } else if (error.request) {
          // La solicitud fue hecha pero no se recibió respuesta
          console.error('No se recibió respuesta del servidor:', error.request);
          throw new Error('No se recibió respuesta del servidor');
        } else {
          // Algo ocurrió durante la configuración de la solicitud
          console.error('Error al configurar la solicitud:', error.message);
          throw new Error('Error al configurar la solicitud');
        }
      });
  }
}

export default new TecnicoService();
