//Importamos todo lo que vamos a usar aca
import { useEffect, useState } from "react";
import TecnicoService from "@/services/TecnicoService";
import EspecialidadService from "@/services/EspecialidadService";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeftCircle } from "lucide-react";
import toast from "react-hot-toast";


export function FormTecnico() {
  //Esto lo que hace es que cuando el tecnico se crea, nos lleva al listado, para evitar dobles inserts
  const navigate = useNavigate(); 

  //Esto nos sirve para decir que, si viene con id es editar, si no, es crear
  const { id } = useParams();

  //Aca lo que hacemos es cargar las especialidades desde el backend, para luego poder usarlas
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);

  //Esto carga la base de las entradas
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
    return `${(nombre + "." + apellido)
      .toLowerCase()
      .replace(/\s+/g, "")}@fixit.cr`; //Elimina todos los espacios en blanco, y pone el dominio
  };

  useEffect(() => {
  async function cargarDatos() {
    try {
      // 1. Cargar especialidades primero
      const dataEspecialidades = await EspecialidadService.getEspecialidades();
      setEspecialidades(dataEspecialidades || []);

      // 2. Si es edición cargar al técnico
      if (id) {
        const resp = await TecnicoService.getTecnicoById(id);
        console.log("RESP TECNICO:", resp);

        const tecnico = resp.data || resp; //Esto para que no falle, dependiendo como viene la data

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
          especialidades: especialidadesLimpias.map(
            (e) => e.id ?? e.especialidad_id
          ),
          carga_trabajo: tecnico.carga_trabajo ?? 0,
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

  //  VALIDACIÓN nombres y apellidos — SOLO LETRAS  
  if ((name === "nombre" || name === "apellido") && !/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]*$/.test(value)) {
    toast.error("Solo se permiten letras en el nombre y apellido");
    return;
  }

  //  VALIDACIÓN teléfono — SOLO NÚMEROS
  if (name === "telefono" && !/^[0-9]*$/.test(value)) {
    toast.error("El teléfono solo puede contener números");
    return;
  }

  //  VALIDACIÓN correo — DEBE TERMINAR EN @fixit.cr
  if (name === "correo" && value !== "" && !value.endsWith("@fixit.cr")) {
    toast.error("El correo debe terminar en @fixit.cr");
  }

  //  Generar correo automáticamente si nombre/apellido cambian
  let nuevo = { ...form, [name]: value };

  if (name === "nombre" || name === "apellido") {
    nuevo.correo = generarCorreo(
      name === "nombre" ? value : form.nombre,
      name === "apellido" ? value : form.apellido
    );
  }

  setForm(nuevo);
};

//Para las especialidades, si ya esta seleccionada una, se le pregunta al array de ids
//Y sisi, la quitamos y si no, se agrega
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

  //Prevencion antes de enviar
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, activo: 1 };

    if (!form.correo.endsWith("@fixit.cr")) {
      toast.error("El correo debe terminar en @fixit.cr");
      return;
    }


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

  //Maquetado
  return (
    <div className="min-h-screen py-10 px-6 bg-white">
      <div className="max-w-3xl mx-auto bg-white/80 border shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-blue-800 mb-6">
          {id ? "Editar Técnico" : "Registrar Técnico"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* NOMBRE Y APELLIDO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold mb-1 block">Nombre</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre"
                className="p-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="font-semibold mb-1 block">Apellido</label>
              <input
                name="apellido"
                value={form.apellido}
               onChange={handleChange}
                placeholder="Apellido"
                className="p-3 border rounded-lg"
                required
              />
            </div>
          </div>

          {/* CORREO */}
          <div>
            <label className="font-semibold mb-1 block">Correo</label>
            <input
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              placeholder="Correo"
              className="p-3 border rounded-lg w-full"
              required
            />
          </div>

          {/* CONTRASEÑA SOLO EN CREAR */}
          {!id && (
            <div>
              <label className="font-semibold mb-1 block">Contraseña</label>
              <input
                name="contrasena"
                type="password"
                value={form.contrasena}
                onChange={handleChange}
                placeholder="Contraseña"
                className="p-3 border rounded-lg w-full"
                required
              />
            </div>
          )}

          {/* TELÉFONO */}
          <div>
            <label className="font-semibold mb-1 block">Teléfono</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Teléfono"
              className="p-3 border rounded-lg w-full"
            />
          </div>

          {/* OBSERVACIONES */}
          <div>
            <label className="font-semibold mb-1 block">Observaciones</label>
            <textarea
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              placeholder="Observaciones"
              className="p-3 border rounded-lg w-full"
              rows="3"
            />
          </div>

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
          </div>

          {/* CARGA DE TRABAJO */}
          <div>
            <label className="font-semibold block mb-2">Carga actual:</label>
            <input
              type="number"
              value={form.carga_trabajo}
              readOnly
              className="p-3 border rounded-lg w-full bg-gray-100 text-gray-600 cursor-not-allowed"
            />
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
