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
    sla_id: "",
    especialidades: [],
    etiquetas: [],
  });

  // -------------------------------
  // CARGA DE DATOS
  // -------------------------------
  useEffect(() => {
    async function cargarTodo() {
      try {
        const [esp, etq, sla] = await Promise.all([
          EspecialidadService.getEspecialidades(),
          EtiquetaService.getEtiquetasFixit(),
          SLAService.getSlas(),
        ]);

        // Normalizar datos
        setEspecialidades(
          (esp || []).map((e) => ({
            id: Number(e.id),
            nombre: e.nombre,
          }))
        );

        setEtiquetas(
          (etq || []).map((e) => ({
            id: Number(e.id),
            nombre: e.nombre,
          }))
        );

        setSlas(sla || []);

        // Cargar datos si es edición
        if (id) {
          const resp = await CategoriaService.getCategoriaById(id);
          const categoria = resp.data || resp;

          setForm({
            nombre: categoria.nombre || "",
            descripcion: categoria.descripcion || "",
            sla_id: categoria.sla_id || "",
            especialidades: categoria.especialidades
              ? categoria.especialidades.map((e) => Number(e.id))
              : [],
            etiquetas: categoria.etiquetas
              ? categoria.etiquetas.map((e) => Number(e.id))
              : [],
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setLoading(false);
      }
    }

    cargarTodo();
  }, [id]);

  // -------------------------------
  // HANDLERS
  // -------------------------------
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    if (!form.sla_id) {
      toast.error("Debes seleccionar un SLA");
      return;
    }

    const payload = { ...form };

    if (id) {
      CategoriaService.updateCategoria(id, payload).then(() => {
        toast.success("Categoría actualizada correctamente");
        navigate("/categorias");
      });
    } else {
      CategoriaService.createCategoria(payload).then(() => {
        toast.success("Categoría creada correctamente");
        navigate("/categorias");
      });
    }
  };

  if (loading)
    return <p className="text-center p-10 text-blue-600">Cargando formulario...</p>;

  // -------------------------------
  // UI
  // -------------------------------
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

          {/* SLA */}
          <div>
            <label className="font-semibold block mb-2">
              SLA asociado (tiempos)
            </label>

            <select
              name="sla_id"
              value={form.sla_id}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full"
              required
            >
              <option value="">Seleccione una opción</option>

              {slas.map((s) => (
                <option key={s.id} value={s.id}>
                  Resp: {s.tiempo_max_respuesta_min} min • Resol:{" "}
                  {s.tiempo_max_resolucion_min} min
                </option>
              ))}
            </select>
          </div>

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
