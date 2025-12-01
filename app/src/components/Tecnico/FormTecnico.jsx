import { useEffect, useState } from "react";
import TecnicoService from "@/services/TecnicoService";
import EspecialidadService from "@/services/EspecialidadService";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeftCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useI18n } from "@/hooks/useI18n";

export function FormTecnico() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useI18n();

  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [errors, setErrors] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: ""
  });

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    contrasena: "",
    telefono: "",
    observaciones: "",
    disponibilidad: "Disponible",
    activo: 1,
    especialidades: [],
    carga_trabajo: 0
  });

  const generarCorreo = (nombre, apellido) => {
    if (!nombre || !apellido) return "";
    return `${(nombre + "." + apellido).toLowerCase().replace(/\s+/g, "")}@fixit.cr`;
  };

  useEffect(() => {
    async function cargarDatos() {
      try {
        const dataEspecialidades = await EspecialidadService.getEspecialidades();
        setEspecialidades(dataEspecialidades || []);

        if (id) {
          const resp = await TecnicoService.getTecnicoById(id);
          const tecnico = resp.data || resp;

          const especialidadesLimpias = Array.isArray(tecnico.especialidades)
            ? tecnico.especialidades
            : [];

          setForm({
            nombre: tecnico.nombre ?? "",
            apellido: tecnico.apellido ?? "",
            correo: tecnico.correo ?? "",
            telefono: tecnico.telefono ?? "",
            observaciones: tecnico.observaciones ?? "",
            disponibilidad: tecnico.disponibilidad ?? "Disponible",
            activo: 1,
            contrasena: "",
            especialidades: especialidadesLimpias.map((e) => e.id ?? e.especialidad_id),
            carga_trabajo: tecnico.carga_trabajo ?? 0
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("ERROR cargando datos:", err);
        setLoading(false);
      }
    }

    cargarDatos();
  }, [id]);

  // ============================
  // VALIDACIONES
  // ============================
  const validateField = (name, value) => {
    let msg = "";

    if (name === "nombre") {
      if (!value.trim()) msg = t("technicians.form.errors.required");
      else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(value))
        msg = t("technicians.form.errors.nameLetters");
    }

    if (name === "apellido") {
      if (!value.trim()) msg = t("technicians.form.errors.required");
      else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(value))
        msg = t("technicians.form.errors.lastnameLetters");
    }

    if (name === "correo") {
      if (!value.trim()) msg = t("technicians.form.errors.required");
      else if (!value.endsWith("@fixit.cr"))
        msg = t("technicians.form.errors.emailDomain");
    }

    if (name === "telefono") {
      if (value && !/^[0-9]+$/.test(value))
        msg = t("technicians.form.errors.numbersOnly");
    }

    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    validateField(name, value);

    let nuevo = { ...form, [name]: value };

    // Auto-generar correo
    if (name === "nombre" || name === "apellido") {
      nuevo.correo = generarCorreo(
        name === "nombre" ? value : form.nombre,
        name === "apellido" ? value : form.apellido
      );
      validateField("correo", nuevo.correo);
    }

    setForm(nuevo);
  };

  const toggleEspecialidad = (id) => {
    const selected = form.especialidades.includes(id);

    setForm({
      ...form,
      especialidades: selected
        ? form.especialidades.filter((e) => e !== id)
        : [...form.especialidades, id]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const campos = ["nombre", "apellido", "correo"];

    campos.forEach((c) => validateField(c, form[c]));

    if (Object.values(errors).some((e) => e !== "")) {
      return;
    }

    const payload = { ...form, activo: 1 };

    if (id) {
      TecnicoService.updateTecnico(id, payload).then(() => {
        toast.success(t("alerts.updated"));
        navigate("/tecnicos");
      });
    } else {
      TecnicoService.createTecnico(payload).then(() => {
        toast.success(t("alerts.created"));
        navigate("/tecnicos");
      });
    }
  };

  if (loading)
    return <p className="text-center p-10 text-blue-600">{t("common.loading")}</p>;

  return (
    <div className="min-h-screen py-10 px-6 bg-white">
      <div className="max-w-3xl mx-auto bg-white/80 border shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-blue-800 mb-6">
          {id ? t("technicians.form.titleEdit") : t("technicians.form.titleCreate")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* NOMBRE Y APELLIDO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold mb-1 block">
                {t("technicians.form.name")}
              </label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder={t("technicians.form.placeholderName")}
                className="p-3 border rounded-lg w-full"
              />
              {errors.nombre && (
                <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>
              )}
            </div>

            <div>
              <label className="font-semibold mb-1 block">
                {t("technicians.form.lastname")}
              </label>
              <input
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                placeholder={t("technicians.form.placeholderLastname")}
                className="p-3 border rounded-lg w-full"
              />
              {errors.apellido && (
                <p className="text-red-600 text-sm mt-1">{errors.apellido}</p>
              )}
            </div>
          </div>

          {/* CORREO */}
          <div>
            <label className="font-semibold mb-1 block">
              {t("technicians.form.email")}
            </label>
            <input
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              placeholder={t("technicians.form.placeholderEmail")}
              className="p-3 border rounded-lg w-full"
            />
            {errors.correo && (
              <p className="text-red-600 text-sm mt-1">{errors.correo}</p>
            )}
          </div>

          {/* CONTRASEÑA SOLO CREAR */}
          {!id && (
            <div>
              <label className="font-semibold mb-1 block">
                {t("technicians.form.password")}
              </label>
              <input
                name="contrasena"
                type="password"
                value={form.contrasena}
                onChange={handleChange}
                placeholder={t("technicians.form.placeholderPassword")}
                className="p-3 border rounded-lg w-full"
                required
              />
            </div>
          )}

          {/* TELÉFONO */}
          <div>
            <label className="font-semibold mb-1 block">
              {t("technicians.form.phone")}
            </label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder={t("technicians.form.placeholderPhone")}
              className="p-3 border rounded-lg w-full"
            />
            {errors.telefono && (
              <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>
            )}
          </div>

          {/* OBSERVACIONES */}
          <div>
            <label className="font-semibold mb-1 block">
              {t("technicians.form.notes")}
            </label>
            <textarea
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              placeholder={t("technicians.form.placeholderNotes")}
              className="p-3 border rounded-lg w-full"
              rows="3"
            />
          </div>

          {/* ESPECIALIDADES */}
          <div>
            <label className="font-semibold block mb-3 text-blue-900 text-lg">
              {t("technicians.form.specialties")}
            </label>

            <div className="flex flex-wrap gap-3 mb-4">
              {(especialidades || []).map((esp) => {
                const selected = form.especialidades.includes(esp.id);
                return (
                  <button
                    key={esp.id}
                    type="button"
                    onClick={() => toggleEspecialidad(esp.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      selected
                        ? "bg-blue-600 text-white border-blue-700 shadow-md scale-105"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                    }`}
                  >
                    {esp.nombre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CARGA TRABAJO */}
          <div>
            <label className="font-semibold block mb-2">
              {t("technicians.form.workload")}
            </label>
            <input
              type="number"
              value={form.carga_trabajo}
              readOnly
              className="p-3 border rounded-lg w-full bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* DISPONIBILIDAD */}
          <div>
            <label className="font-semibold block mb-2">
              {t("technicians.form.availability")}
            </label>
            <select
              name="disponibilidad"
              value={form.disponibilidad}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full"
            >
              <option value="Disponible">{t("technicians.form.available")}</option>
              <option value="Ocupado">{t("technicians.form.busy")}</option>
            </select>
          </div>

          {/* BOTONES */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => navigate("/tecnicos")}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              <ArrowLeftCircle className="h-5 w-5" />
              {t("technicians.form.back")}
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-md bg-blue-700 text-white shadow hover:scale-105 transition"
            >
              <Save className="h-5 w-5" />
              {id ? t("technicians.form.update") : t("technicians.form.save")}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
