import { useEffect, useState } from "react";
import TecnicoService from "@/services/TecnicoService";
import EspecialidadService from "@/services/EspecialidadService";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeftCircle } from "lucide-react";
import toast from "react-hot-toast";


export function FormTecnico() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    contrasena: "",
    telefono: "",
    observaciones: "",
    disponibilidad: "Disponible",
    activo: 1,
    especialidades: []
  });

  const generarCorreo = (nombre, apellido) => {
    if (!nombre || !apellido) return "";
    return `${(nombre + "." + apellido)
      .toLowerCase()
      .replace(/\s+/g, "")}@fixit.cr`;
  };

  useEffect(() => {
  async function cargarDatos() {
    try {
      // 1. Cargar especialidades primero
      const dataEspecialidades = await EspecialidadService.getEspecialidades();
      setEspecialidades(dataEspecialidades || []);

      // 2. Si es edición → cargar técnico
      if (id) {
        const resp = await TecnicoService.getTecnicoById(id);
        console.log("RESP TECNICO:", resp);

        // 👇 aquí está el técnico REAL
        const tecnico = resp.data || resp; // soporta ambas formas

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
          contrasena: "", // no se edita aquí
          especialidades: especialidadesLimpias.map(
            (e) => e.id ?? e.especialidad_id
          ),
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nuevo = { ...form, [name]: value };

    if (name === "nombre" || name === "apellido") {
      nuevo.correo = generarCorreo(
        name === "nombre" ? value : form.nombre,
        name === "apellido" ? value : form.apellido
      );
    }

    setForm(nuevo);
  };

  const toggleEspecialidad = (id) => {
    const selected = form.especialidades.includes(id);

    if (selected) {
      setForm({
        ...form,
        especialidades: form.especialidades.filter((e) => e !== id),
      });
    } else {
      setForm({
        ...form,
        especialidades: [...form.especialidades, id],
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, activo: 1 };

    if (id) {
      TecnicoService.updateTecnico(id, payload).then(() => {
        toast.success("Técnico actualizado correctamente");
        navigate("/tecnicos");
      });
    } else {
      TecnicoService.createTecnico(payload).then(() => {
        toast.success("Técnico creado correctamente");
        navigate("/tecnicos");
      });
    }
  };

  if (loading)
    return <p className="text-center p-10 text-blue-600">Cargando...</p>;

  return (
    <div className="min-h-screen py-10 px-6 bg-white">
      <div className="max-w-3xl mx-auto bg-white/80 border shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-blue-800 mb-6">
          {id ? "Editar Técnico" : "Registrar Técnico"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* NOMBRE Y APELLIDO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre"
              className="p-3 border rounded-lg"
              required
            />
            <input
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              placeholder="Apellido"
              className="p-3 border rounded-lg"
              required
            />
          </div>

          {/* CORREO */}
          <input
            name="correo"
            type="email"
            value={form.correo}
            onChange={handleChange}
            placeholder="Correo"
            className="p-3 border rounded-lg w-full"
            required
          />

          {/* CONTRASEÑA SOLO EN CREAR */}
          {!id && (
            <input
              name="contrasena"
              type="password"
              value={form.contrasena}
              onChange={handleChange}
              placeholder="Contraseña"
              className="p-3 border rounded-lg w-full"
              required
            />
          )}

          {/* TELÉFONO */}
          <input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="Teléfono"
            className="p-3 border rounded-lg w-full"
          />

          {/* OBSERVACIONES */}
          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            placeholder="Observaciones"
            className="p-3 border rounded-lg w-full"
            rows="3"
          />

          {/* ESPECIALIDADES */}
          <div>
            <label className="font-semibold block mb-3 text-blue-900 text-lg">
              Especialidades
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

            {/* Chips seleccionadas */}
            <div className="flex flex-wrap gap-2">
              {form.especialidades.length > 0 ? (
                form.especialidades.map((id) => {
                  const esp = especialidades.find((e) => e.id === id);
                  return (
                    <span
                      key={id}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                    >
                      {esp?.nombre}
                      <button
                        type="button"
                        onClick={() => toggleEspecialidad(id)}
                        className="text-blue-700 hover:text-red-600 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm italic">
                  No has seleccionado especialidades.
                </p>
              )}
            </div>
          </div>

          {/* DISPONIBILIDAD */}
          <div>
            <label className="font-semibold block mb-2">Disponibilidad:</label>
            <select
              name="disponibilidad"
              value={form.disponibilidad}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full"
            >
              <option value="Disponible">Disponible</option>
              <option value="Ocupado">Ocupado</option>
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
