// src/services/UsuarioService.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "usuario"; // Ejemplo: http://localhost:81/proyecto/api/usuario

class UsuarioService {
  //  Obtener todos los usuarios
  getUsuarios() {
    return axios
      .get(BASE_URL)
      .then((response) => response.data)
      .catch((error) => {
        if (error.response) {
          console.error("Error al obtener usuarios:", error.response.data);
          throw new Error(error.response.data.message || "Error al obtener usuarios");
        } else if (error.request) {
          console.error("No se recibió respuesta del servidor:", error.request);
          throw new Error("No se recibió respuesta del servidor");
        } else {
          console.error("Error al configurar la solicitud:", error.message);
          throw new Error("Error al configurar la solicitud");
        }
      });
  }

  //  Obtener un usuario por ID
  getUsuarioById(id) {
    return axios
      .get(`${BASE_URL}/${id}`)
      .then((response) => response.data)
      .catch((error) => {
        if (error.response) {
          console.error("Error al obtener usuario:", error.response.data);
          throw new Error(error.response.data.message || "Error al obtener usuario");
        } else if (error.request) {
          console.error("No se recibió respuesta del servidor:", error.request);
          throw new Error("No se recibió respuesta del servidor");
        } else {
          console.error("Error al configurar la solicitud:", error.message);
          throw new Error("Error al configurar la solicitud");
        }
      });
  }

  //  Iniciar sesión (login)
  login(correo, contrasena) {
    return axios
      .post(`${BASE_URL}/login`, { correo, contrasena })
      .then((response) => response.data)
      .catch((error) => {
        if (error.response) {
          console.error("Error al iniciar sesión:", error.response.data);
          throw new Error(error.response.data.message || "Error al iniciar sesión");
        } else if (error.request) {
          console.error("No se recibió respuesta del servidor:", error.request);
          throw new Error("No se recibió respuesta del servidor");
        } else {
          console.error("Error al configurar la solicitud:", error.message);
          throw new Error("Error al configurar la solicitud");
        }
      });
  }

  //  Crear nuevo usuario
  createUsuario(usuarioData) {
    return axios
      .post(BASE_URL, usuarioData)
      .then((response) => response.data)
      .catch((error) => {
        if (error.response) {
          console.error("Error al crear usuario:", error.response.data);
          throw new Error(error.response.data.message || "Error al crear usuario");
        } else if (error.request) {
          console.error("No se recibió respuesta del servidor:", error.request);
          throw new Error("No se recibió respuesta del servidor");
        } else {
          console.error("Error al configurar la solicitud:", error.message);
          throw new Error("Error al configurar la solicitud");
        }
      });
  }
}

export default new UsuarioService();