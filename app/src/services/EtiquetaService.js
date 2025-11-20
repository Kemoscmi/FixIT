import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "EtiquetaController";

class EtiquetaService {
  async getEtiquetas() {
    try {
      const res = await axios.get(BASE_URL);

      // Caso 1 → respuesta anidada como la tuya
      if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
        return res.data.data.data;
      }

      // Caso 2 → { success, data:[...] }
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data;
      }

      // Caso 3 → array directo
      if (Array.isArray(res.data)) {
        return res.data;
      }

      return [];
    } catch (err) {
      console.error("❌ Error al cargar etiquetas:", err);
      return [];
    }
  }

 async getEtiquetasFixit() {
  try {
    const res = await axios.get(BASE_URL);

    // JSON real
    if (Array.isArray(res.data?.data?.data)) {
      return res.data.data.data.map(e => ({
        id: Number(e.id),
        nombre: e.nombre
      }));
    }

    return [];
  } catch (err) {
    console.error("❌ Error al cargar etiquetas:", err);
    return [];
  }
}
}

export default new EtiquetaService();
