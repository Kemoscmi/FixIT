import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CategoriaService from "@/services/CategoriaService";
import EspecialidadService from "@/services/EspecialidadService";
import EtiquetaService from "@/services/EtiquetaService";
import SLAService from "@/services/SLAService";
import { Save, ArrowLeftCircle } from "lucide-react";
import toast from "react-hot-toast";

export function FormCategoria() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [especialidades, setEspecialidades] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [slas, setSlas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    sla_mode: "existing", // existing | new
    sla_id: "",
    new_sla: {
      tiempo_max_respuesta_min: "",
      tiempo_max_resolucion_min: "",
    },
    especialidades: [],
    etiquetas: [],
  });

  // --------------------------------------
  // CARGA DE DATOS
  // --------------------------------------
  useEffect(() => {
    async function cargarTodo() {
      try {
        const [esp, etq, sla] = await Promise.all([
          EspecialidadService.getEspecialidades(),
          EtiquetaService.getEtiquetasFixit(),
          SLAService.getSlas(),
        ]);

        setEspecialidades((esp || []).map((e) => ({
          id: Number(e.id),
          nombre: e.nombre,
        })));

        setEtiquetas((etq || []).map((e) => ({
          id: Number(e.id),
          nombre: e.nombre,
        })));

        setSlas(sla || []);

        if (id) {
          const resp = await CategoriaService.getCategoriaById(id);
          const categoria = resp.data || resp;

          setForm((prev) => ({
            ...prev,
            nombre: categoria.nombre,
            descripcion: categoria.descripcion,
            sla_mode: "existing",
            sla_id: categoria.sla_id,
            especialidades: categoria.especialidades?.map((e) => Number(e.id)) || [],
            etiquetas: categoria.etiquetas?.map((e) => Number(e.id)) || [],
          }));
        }

        setLoading(false);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setLoading(false);
      }
    }

    cargarTodo();
  }, [id]);

  // --------------------------------------
  // HANDLERS
  // --------------------------------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleEtiqueta = (id) => {
    setForm((prev) => ({
      ...prev,
      etiquetas: prev.etiquetas.includes(id)
        ? prev.etiquetas.filter((e) => e !== id)
        : [...prev.etiquetas, id],
    }));
  };

  const toggleEspecialidad = (id) => {
    setForm((prev) => ({
      ...prev,
      especialidades: prev.especialidades.includes(id)
        ? prev.especialidades.filter((e) => e !== id)
        : [...prev.especialidades, id],
    }));
  };

  const handleNewSlaChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      new_sla: {
        ...prev.new_sla,
        [field]: value,
      },
    }));
  };

  // --------------------------------------
  // SUBMIT
  // --------------------------------------
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.nombre.trim()) {
    toast.error("El nombre es obligatorio");
    return;
  }

  let payload = { ...form };

  // VALIDACIONES PARA SLA NUEVO
  if (form.sla_mode === "new") {
    const resp = Number(form.new_sla.tiempo_max_respuesta_min);
    const reso = Number(form.new_sla.tiempo_max_resolucion_min);

    if (resp <= 0) {
      toast.error("El tiempo de respuesta debe ser mayor a 0");
      return;
    }

    if (reso <= resp) {
      toast.error(
        "El tiempo de resolución debe ser mayor que el tiempo de respuesta"
      );
      return;
    }

    // 👉 GENERAR NOMBRE AUTOMÁTICO PARA SLA NUEVO
    payload.new_sla.nombre = `SLA automático (${resp} / ${reso})`;

    payload.sla_id = null;
  }

  delete payload.sla_mode;

  if (id) {
    await CategoriaService.updateCategoria(id, payload);
    toast.success("Categoría actualizada correctamente");
  } else {
    await CategoriaService.createCategoria(payload);
    toast.success("Categoría creada correctamente");
  }

  navigate("/categorias");
};


  if (loading)
    return <p className="text-center p-10 text-blue-600">Cargando formulario...</p>;

  // --------------------------------------
  // UI
  // --------------------------------------
  return (
    <div className="min-h-screen py-10 px-6 bg-white">
      <div className="max-w-3xl mx-auto bg-white/80 border shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-blue-800 mb-6">
          {id ? "Editar Categoría" : "Registrar Categoría"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* NOMBRE */}
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre de la categoría"
            className="p-3 border rounded-lg w-full"
            required
          />

          {/* DESCRIPCIÓN */}
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Descripción"
            rows="3"
            className="p-3 border rounded-lg w-full"
          />

          {/* SELECCIÓN DE SLA */}
          <div>
            <label className="font-semibold block mb-2">¿Cómo desea asignar el SLA?</label>

            <div className="flex gap-6 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="sla_mode"
                  value="existing"
                  checked={form.sla_mode === "existing"}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      sla_mode: "existing",
                      new_sla: {
                        tiempo_max_respuesta_min: "",
                        tiempo_max_resolucion_min: "",
                      },
                    }))
                  }
                />
                Usar SLA existente
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="sla_mode"
                  value="new"
                  checked={form.sla_mode === "new"}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      sla_mode: "new",
                      sla_id: "",
                    }))
                  }
                />
                Crear nuevo SLA
              </label>
            </div>
          </div>

          {/* SLA EXISTENTE */}
          {form.sla_mode === "existing" && (
            <div>
              <label className="font-semibold block mb-2">
                Seleccione un SLA ya registrado
              </label>

              <select
                name="sla_id"
                value={form.sla_id}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              >
                <option value="">Seleccione una opción</option>
                {slas.map((s) => (
                  <option key={s.id} value={s.id}>
                    Resp: {s.tiempo_max_respuesta_min} min • Resol: {s.tiempo_max_resolucion_min} min
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nueva SLA */}
          {form.sla_mode === "new" && (
            <div className="grid grid-cols-1 gap-4 border p-4 rounded-xl shadow-sm bg-white">
              <h3 className="font-bold text-blue-800 text-lg mb-2">
                Crear nuevo SLA
              </h3>

              {/* TIEMPO DE RESPUESTA */}
              <div className="flex flex-col">
                <label className="font-semibold text-sm mb-1 text-gray-700">
                  Tiempo máximo de respuesta (min)
                </label>

                <input
                  type="number"
                  placeholder="Ej: 30"
                  value={form.new_sla.tiempo_max_respuesta_min}
                  onChange={(e) =>
                    handleNewSlaChange("tiempo_max_respuesta_min", e.target.value)
                  }
                  className="p-3 border rounded-lg w-full"
                />
              </div>

              {/* TIEMPO DE RESOLUCIÓN */}
              <div className="flex flex-col">
                <label className="font-semibold text-sm mb-1 text-gray-700">
                  Tiempo máximo de resolución (min)
                </label>

                <input
                  type="number"
                  placeholder="Ej: 90"
                  value={form.new_sla.tiempo_max_resolucion_min}
                  onChange={(e) =>
                    handleNewSlaChange("tiempo_max_resolucion_min", e.target.value)
                  }
                  className="p-3 border rounded-lg w-full"
                />
              </div>
            </div>
          )}

          {/* ETIQUETAS */}
          <div>
            <label className="font-semibold block mb-3 text-blue-900 text-lg">
              Etiquetas
            </label>

            <div className="flex flex-wrap gap-3 mb-4">
              {etiquetas.map((et) => {
                const selected = form.etiquetas.includes(et.id);
                return (
                  <button
                    key={et.id}
                    type="button"
                    onClick={() => toggleEtiqueta(et.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      selected
                        ? "bg-blue-600 text-white border-blue-700 shadow-md scale-105"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                    }`}
                  >
                    {et.nombre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ESPECIALIDADES */}
          <div>
            <label className="font-semibold block mb-3 text-blue-900 text-lg">
              Especialidades
            </label>

            <div className="flex flex-wrap gap-3 mb-4">
              {especialidades.map((esp) => {
                const selected = form.especialidades.includes(esp.id);
                return (
                  <button
                    key={esp.id}
                    type="button"
                    onClick={() => toggleEspecialidad(esp.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      selected
                        ? "bg-indigo-600 text-white border-indigo-700 shadow-md scale-105"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-50"
                    }`}
                  >
                    {esp.nombre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => navigate("/categorias")}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              <ArrowLeftCircle className="h-5 w-5" />
              Volver
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-md bg-blue-700 text-white shadow hover:scale-105 transition"
            >
              <Save className="h-5 w-5" />
              {id ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
