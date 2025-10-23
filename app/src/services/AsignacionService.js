// 📁 services/AsignacionService.js
// -------------------------------------------------------------
// Este servicio maneja las peticiones HTTP relacionadas con las
// asignaciones (para técnicos y administradores).
// Utiliza la ruta del backend: /AsignacionController/semana
//
// Comportamiento del endpoint:
//  - Si se envía “date” → obtiene asignaciones de esa semana.
//  - Si NO se envía “date” → obtiene todas las asignaciones.
//  - Si el rol es 1 (admin) → ve todas las asignaciones.
//  - Si el rol es 2 (técnico) → ve solo sus asignaciones.
// -------------------------------------------------------------

import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "AsignacionController";

class AsignacionService {
  // 🔹 Obtener asignaciones (todas o por semana)
  // Si no se pasa “date”, devuelve todas.
  // GET -> /AsignacionController/semana?rol_id=2&user_id=3
  // GET -> /AsignacionController/semana?rol_id=2&user_id=3&date=YYYY-MM-DD
  getAsignaciones({ rolId, userId, date }) {
    if (!rolId || !userId)
      return Promise.reject("Faltan parámetros obligatorios: rolId y userId");

    // Solo agrega el parámetro “date” si fue enviado
    const params = date
      ? { rol_id: rolId, user_id: userId, date }
      : { rol_id: rolId, user_id: userId };

    return axios.get(`${BASE_URL}/semana`, { params });
  }
}

export default new AsignacionService();