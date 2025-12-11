import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeftCircle } from "lucide-react";
import toast from "react-hot-toast";
import UsuarioService from "../../services/UsuariosService";

/**
 * Componente de formulario para crear un nuevo usuario.
 */
export function FormCreateUsuario() {
  const navigate = useNavigate();

  // --- Estados del Componente ---
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    rol_id: 3, // Cliente por defecto
    contrasena: "", // Aseguramos que la contraseña esté presente
  });
  const [isEmailValid, setIsEmailValid] = useState(false); // Estado para controlar la validez del correo
  const [errors, setErrors] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: ""
  });

  // --- Funciones Auxiliares ---

  /**
   * Genera un correo electrónico automáticamente basado en nombre y apellido.
   */
  const generarCorreo = (nombre, apellido) => {
    if (!nombre || !apellido) return "";
    // Formato: nombre.apellido@fixit.cr
    return `${(nombre + "." + apellido).toLowerCase().replace(/\s+/g, "")}@fixit.cr`;
  };

  /**
   * Genera una contraseña automática simple.
   */
  const generarContrasena = (nombre, apellido) => {
    // Formato: nombreapellido*
    return `${nombre.toLowerCase()}${apellido.toLowerCase()}*`;
  };

  // ============================
  // VALIDACIONES
  // ============================
  const validateField = (name, value) => {
    let msg = "";

    // Validación de nombre
    if (name === "nombre") {
      if (!value.trim()) msg = "Este campo es obligatorio";
      else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(value))
        msg = "Solo se permiten letras en el nombre";
    }

    // Validación de apellido
    if (name === "apellido") {
      if (!value.trim()) msg = "Este campo es obligatorio";
      else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(value))
        msg = "Solo se permiten letras en el apellido";
    }

    // Validación de correo
    if (name === "correo") {
      if (!value.trim()) msg = "Este campo es obligatorio";
      else if (!value.endsWith("@fixit.cr"))
        msg = "El correo debe terminar con @fixit.cr";
    }

    // Validación de teléfono
    if (name === "telefono") {
      if (value && !/^[0-9]+$/.test(value))
        msg = "El teléfono debe contener solo números";
    }

    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    validateField(name, value);

    let nuevo = { ...form, [name]: value };

    // Si se cambian nombre o apellido, generamos correo y contraseña automáticamente
    if (name === "nombre" || name === "apellido") {
      const correoGenerado = generarCorreo(
        name === "nombre" ? value : form.nombre,
        name === "apellido" ? value : form.apellido
      );
      const contrasenaGenerada = generarContrasena(
        name === "nombre" ? value : form.nombre,
        name === "apellido" ? value : form.apellido
      );
      nuevo.correo = correoGenerado;
      nuevo.contrasena = contrasenaGenerada;
      validateField("correo", nuevo.correo); // Validar correo
    }

    setForm(nuevo);
  };

  // Función para validar el correo antes de habilitar el botón de guardar
  const handleValidateEmail = () => {
    const { correo } = form;

    // Verificar si el correo ya está registrado
    UsuarioService.checkEmail(correo)
      .then((response) => {
        const result = response.data; // Accede al objeto 'data' dentro de la respuesta

        // Verificar el campo success de la respuesta 'data'
        if (!result.success) {
          toast.error(result.message); // Mostrar error si el correo ya existe
          setIsEmailValid(false); // Deshabilitar el botón de guardar
          return;
        }

        // Verificar si el correo es válido (termina con @fixit.cr)
      if (!correo.endsWith("@fixit.cr")) {
        toast.error("El correo debe terminar con @fixit.cr");
        setIsEmailValid(false); // Deshabilitar el botón de guardar
        return;
      }

        toast.success("Correo disponible.");
        setIsEmailValid(true); // Habilitar el botón de guardar
      })
      .catch(() => {
        toast.error("Error al validar el correo.");
        setIsEmailValid(false); // Deshabilitar el botón de guardar
      });
  };

  // Función de envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    const { nombre, apellido, correo, telefono, rol_id, contrasena } = form;

    // Validación básica de campos
    if (!nombre || !apellido || !correo || !telefono || !rol_id || !contrasena) {
      toast.error("Todos los campos son obligatorios");
      return;
    }
    
    if (!isEmailValid) {
        toast.error("Debe validar el correo antes de guardar.");
        return;
    }

    // Crear nuevo usuario
    UsuarioService.createUsuario(form)
      .then(() => {
        toast.success("Usuario creado correctamente");
        navigate("/usuarios");
      })
      .catch(() => {
        toast.error("Error creando el usuario");
      });
  };

  // --- Manejo del Cambio de Rol ---
  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setForm({ ...form, rol_id: selectedRole });

    // Redirigir a los formularios correspondientes según el rol
    if (selectedRole === "2") { // Técnico
      navigate("/tecnico/create");
    } else if (selectedRole === "1") { // Administrador
      // Se queda en este formulario
    }
    // Para Cliente (rol_id 3) también se queda aquí.
  };

  return (
    <div className="min-h-screen py-10 px-6 bg-white">
      <div className="max-w-3xl mx-auto bg-white/80 border shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-blue-800 mb-6">Nuevo Usuario</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Rol */}
          <div>
            <label className="font-semibold mb-1 block">Rol</label>
            <select
              name="rol_id"
              value={form.rol_id}
              onChange={handleRoleChange}
              className="p-3 border rounded-lg w-full"
            >
              <option value={1}>Administrador</option>
              <option value={2}>Técnico</option>
              <option value={3}>Cliente</option>
            </select>
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold mb-1 block">Nombre</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
                required
              />
              {errors.nombre && (
                <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>
              )}
            </div>
            <div>
              <label className="font-semibold mb-1 block">Apellido</label>
              <input
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
                required
              />
              {errors.apellido && (
                <p className="text-red-600 text-sm mt-1">{errors.apellido}</p>
              )}
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
              type="email"
              required
            />
            <button
              type="button"
              onClick={handleValidateEmail}
              className="flex items-center gap-2 px-6 py-3 rounded-md bg-green-700 text-white shadow hover:scale-105 transition mt-3"
            >
              Validar Correo
            </button>
          </div>

          {/* Teléfono */}
          <div>
            <label className="font-semibold mb-1 block">Teléfono</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full"
              type="tel"
              required
            />
            {errors.telefono && (
              <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="font-semibold mb-1 block">Contraseña</label>
            <input
              name="contrasena"
              value={form.contrasena}
              className="p-3 border rounded-lg w-full"
              readOnly // La contraseña es generada automáticamente y de solo lectura
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
              disabled={!isEmailValid} // Deshabilitar si el correo no es válido
              className={`flex items-center gap-2 px-6 py-3 rounded-md text-white shadow transition ${isEmailValid ? "bg-blue-700 hover:scale-105" : "bg-gray-400 cursor-not-allowed"}`}
            >
              <Save className="h-5 w-5" />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
