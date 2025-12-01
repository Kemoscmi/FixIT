import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CategoriaService from "@/services/CategoriaService";
import EspecialidadService from "@/services/EspecialidadService";
import EtiquetaService from "@/services/EtiquetaService";
import SLAService from "@/services/SLAService";
import { Save, ArrowLeftCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useI18n } from "@/hooks/useI18n";

export function FormCategoria() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useI18n();

  const [especialidades, setEspecialidades] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [slas, setSlas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [errors, setErrors] = useState({
    nombre: "",
    slaExisting: "",
    slaResponse: "",
    slaResolution: ""
  });

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    sla_mode: "existing",
    sla_id: "",
    new_sla: {
      tiempo_max_respuesta_min: "",
      tiempo_max_resolucion_min: "",
    },
    especialidades: [],
    etiquetas: [],
  });

  // =========================
  //   CARGAR DATOS
  // =========================
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

  // =========================
  // VALIDACIONES
  // =========================
  const validateField = (name, value) => {
    let msg = "";

    if (name === "nombre") {
      if (!value.trim()) msg = t("categories.form.errors.required");
    }

    if (name === "slaExisting") {
      if (form.sla_mode === "existing" && !form.sla_id)
        msg = t("categories.form.errors.slaRequired");
    }

    if (name === "slaResponse") {
      const v = Number(value);
      if (form.sla_mode === "new" && v <= 0)
        msg = t("categories.form.errors.slaResponseGreaterZero");
    }

    if (name === "slaResolution") {
      const resp = Number(form.new_sla.tiempo_max_respuesta_min);
      const reso = Number(value);
      if (form.sla_mode === "new" && reso <= resp)
        msg = t("categories.form.errors.slaResolutionGreater");
    }

    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  // =========================
  // ONCHANGE
  // =========================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    validateField(e.target.name, e.target.value);
  };

  const handleNewSlaChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      new_sla: {
        ...prev.new_sla,
        [field]: value,
      },
    }));

    validateField(
      field === "tiempo_max_respuesta_min" ? "slaResponse" : "slaResolution",
      value
    );
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

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    validateField("nombre", form.nombre);
    validateField("slaExisting", form.sla_id);

    if (form.sla_mode === "new") {
      validateField("slaResponse", form.new_sla.tiempo_max_respuesta_min);
      validateField("slaResolution", form.new_sla.tiempo_max_resolucion_min);
    }

    if (Object.values(errors).some((e) => e !== "")) {
      return;
    }

    let payload = { ...form };

    // Validación SLA mode
    if (form.sla_mode === "new") {
      payload.new_sla.nombre = `SLA (${form.new_sla.tiempo_max_respuesta_min}/${form.new_sla.tiempo_max_resolucion_min})`;
      payload.sla_id = null;
    } else {
      delete payload.new_sla;
    }

    delete payload.sla_mode;

    if (id) {
      CategoriaService.updateCategoria(id, payload).then(() => {
        toast.success(t("alerts.updated"));
        navigate("/categorias");
      });
    } else {
      CategoriaService.createCategoria(payload).then(() => {
        toast.success(t("alerts.created"));
        navigate("/categorias");
      });
    }
  };

  if (loading)
    return (
      <p className="text-center p-10 text-blue-600">
        {t("categories.form.loading")}
      </p>
    );

  return (
    <div className="min-h-screen py-10 px-6 bg-white">
      <div className="max-w-3xl mx-auto bg-white/80 border shadow-xl rounded-2xl p-8">

        <h2 className="text-3xl font-extrabold text-blue-800 mb-6">
          {id ? t("categories.form.titleEdit") : t("categories.form.titleCreate")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* NOMBRE */}
          <div>
            <label className="font-semibold mb-1 block">
              {t("categories.form.name")}
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder={t("categories.form.placeholderName")}
              className="p-3 border rounded-lg w-full"
            />
            {errors.nombre && (
              <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label className="font-semibold mb-1 block">
              {t("categories.form.description")}
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder={t("categories.form.placeholderDescription")}
              rows="3"
              className="p-3 border rounded-lg w-full"
            />
          </div>

          {/* SLA */}
          <div>
            <label className="font-semibold block mb-2">
              {t("categories.form.slaAssign")}
            </label>

            <div className="flex gap-6 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="sla_mode"
                  value="existing"
                  checked={form.sla_mode === "existing"}
                  onChange={() => {
                    setForm((prev) => ({
                      ...prev,
                      sla_mode: "existing",
                      new_sla: {
                        tiempo_max_respuesta_min: "",
                        tiempo_max_resolucion_min: "",
                      },
                    }));
                    setErrors((prev) => ({ ...prev, slaResponse: "", slaResolution: "" }));
                  }}
                />
                {t("categories.form.slaExisting")}
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="sla_mode"
                  value="new"
                  checked={form.sla_mode === "new"}
                  onChange={() => {
                    setForm((prev) => ({
                      ...prev,
                      sla_mode: "new",
                      sla_id: "",
                    }));
                    setErrors((prev) => ({ ...prev, slaExisting: "" }));
                  }}
                />
                {t("categories.form.slaNew")}
              </label>
            </div>
          </div>

          {/* SLA EXISTENTE */}
          {form.sla_mode === "existing" && (
            <div>
              <label className="font-semibold block mb-2">
                {t("categories.form.slaSelectExisting")}
              </label>

              <select
                name="sla_id"
                value={form.sla_id}
                onChange={(e) => {
                  handleChange(e);
                  validateField("slaExisting", e.target.value);
                }}
                className="p-3 border rounded-lg w-full"
              >
                <option value="">--</option>
                {slas.map((s) => (
                  <option key={s.id} value={s.id}>
                    Resp: {s.tiempo_max_respuesta_min} min — Resol: {s.tiempo_max_resolucion_min} min
                  </option>
                ))}
              </select>

              {errors.slaExisting && (
                <p className="text-red-600 text-sm mt-1">{errors.slaExisting}</p>
              )}
            </div>
          )}

          {/* NUEVO SLA */}
          {form.sla_mode === "new" && (
            <div className="grid grid-cols-1 gap-4 border p-4 rounded-xl shadow-sm bg-white">
              <h3 className="font-bold text-blue-800 text-lg mb-2">
                {t("categories.form.newSlaTitle")}
              </h3>

              <div>
                <label className="font-semibold text-sm mb-1">
                  {t("categories.form.slaResponse")}
                </label>
                <input
                  type="number"
                  placeholder="30"
                  value={form.new_sla.tiempo_max_respuesta_min}
                  onChange={(e) =>
                    handleNewSlaChange("tiempo_max_respuesta_min", e.target.value)
                  }
                  className="p-3 border rounded-lg w-full"
                />

                {errors.slaResponse && (
                  <p className="text-red-600 text-sm mt-1">{errors.slaResponse}</p>
                )}
              </div>

              <div>
                <label className="font-semibold text-sm mb-1">
                  {t("categories.form.slaResolution")}
                </label>
                <input
                  type="number"
                  placeholder="90"
                  value={form.new_sla.tiempo_max_resolucion_min}
                  onChange={(e) =>
                    handleNewSlaChange("tiempo_max_resolucion_min", e.target.value)
                  }
                  className="p-3 border rounded-lg w-full"
                />

                {errors.slaResolution && (
                  <p className="text-red-600 text-sm mt-1">{errors.slaResolution}</p>
                )}
              </div>
            </div>
          )}

          {/* ETIQUETAS */}
          <div>
            <label className="font-semibold block mb-3 text-blue-900 text-lg">
              {t("categories.form.tags")}
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
              {t("categories.form.specialties")}
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
              {t("categories.form.back")}
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-md bg-blue-700 text-white shadow hover:scale-105 transition"
            >
              <Save className="h-5 w-5" />
              {id ? t("categories.form.update") : t("categories.form.save")}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
