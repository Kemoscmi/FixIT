import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL + "usuario";

class UsuarioService {
  // LISTAR TODOS
  // GET -> /usuario
  getUsuarios() {
    return axios.get(BASE_URL);
  }

  // LOGIN
  // POST -> /usuario/login
  loginUsuario(credentials) {
    return axios.post(`${BASE_URL}/login`, JSON.stringify(credentials), {
      headers: { "Content-Type": "application/json" },
    });
  }
}

export default new UsuarioService();
