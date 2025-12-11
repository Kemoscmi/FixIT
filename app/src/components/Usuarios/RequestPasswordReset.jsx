// Formulario para solicitar restablecimiento de contraseña
import { useState } from "react";
import UsuarioService from "../../services/UsuariosService";
import toast from "react-hot-toast";

export function RequestPasswordReset() {
  const [correo, setCorreo] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!correo) {
      toast.error("El correo es obligatorio");
      return;
    }

    // Llamar al servicio para enviar el enlace de restablecimiento
  UsuarioService.requestPasswordReset({ correo })
  .then(() => {
    toast.success("Enlace de restablecimiento enviado");
  })
  // eslint-disable-next-line no-unused-vars
  .catch((error) => { // Usar el error si lo necesitas
    toast.error("Error al enviar el enlace");
  });

  };

  return (
    <div className="min-h-screen py-10 px-6 bg-white">
      <div className="max-w-3xl mx-auto bg-white/80 border shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-blue-800 mb-6">Restablecer Contraseña</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="p-3 border rounded-lg w-full"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-md bg-green-700 text-white shadow hover:scale-105 transition mt-3"
          >
            Solicitar Restablecimiento
          </button>
        </form>
      </div>
    </div>
  );
}
