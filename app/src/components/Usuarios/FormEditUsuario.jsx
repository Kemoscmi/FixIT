import { useEffect, useState } from "react";
import UsuarioService from "../../services/UsuariosService";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeftCircle } from "lucide-react";
import toast from "react-hot-toast";

export function FormEditUsuario() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    rol_id: 3, // Cliente por defecto
    contrasena: "", // Mantenerla vacía, no se editará
  });

  useEffect(() => {
    if (id) {
      // Si estamos editando, obtenemos la info del usuario
      UsuarioService.getUsuarioById(id)
        .then((response) => {
          setForm({
            ...response.data,
            contrasena: "", // No mostrar ni enviar la contraseña (dejar vacío)
          });
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          toast.error("Error cargando los datos del usuario");
        });
    }
  }, [id]);

  // Manejar el submit del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    const { nombre, apellido, correo, telefono, rol_id } = form;

    // Validación de campos
    if (!nombre || !apellido || !correo || !telefono || !rol_id) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    // Generar correo automáticamente si está vacío
    if (!correo) {
      setForm({ ...form, correo: `${nombre}.${apellido}@fixit.cr` });
    }

    // Si es edición de un usuario, no enviamos la contraseña
    const updatedForm = {
      nombre,
      apellido,
      correo,
      telefono,
      rol_id,
    };

    // Actualizar usuario sin la contraseña
    UsuarioService.updateUsuario(id, updatedForm)
      .then(() => {
        toast.success("Usuario actualizado correctamente");
        navigate("/usuarios");
      })
      .catch(() => {
        toast.error("Error actualizando el usuario");
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  if (loading) return <p className="text-center p-10 text-blue-600">Cargando...</p>;

  return (
    <div className="min-h-screen py-10 px-6 bg-white">
      <div className="max-w-3xl mx-auto bg-white/80 border shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-blue-800 mb-6">Editar Usuario</h2>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold mb-1 block">Nombre</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
            </div>
            <div>
              <label className="font-semibold mb-1 block">Apellido</label>
              <input
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
            </div>
          </div>

          {/* Correo */}
          <div>
            <label className="font-semibold mb-1 block">Correo</label>
            <input
              name="correo"
              value={form.correo}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="font-semibold mb-1 block">Teléfono</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => navigate("/usuarios")}
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
              Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
