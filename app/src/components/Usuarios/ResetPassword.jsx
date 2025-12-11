import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import UsuarioService from "../../services/UsuariosService";
import toast from "react-hot-toast";

export function ResetPassword() {
  const { token } = useParams();
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (nuevaContrasena !== confirmarContrasena) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    // Llamar al servicio para restablecer la contraseña
    UsuarioService.resetPassword({ token, contrasena: nuevaContrasena })
  .then(() => {
    toast.success("Contraseña restablecida");
  })
  // eslint-disable-next-line no-unused-vars
  .catch((error) => { // Usar el error si lo necesitas
    toast.error("Error al restablecer la contraseña");
  });

  };

  useEffect(() => {
    // Validar si el token es válido
    UsuarioService.validateResetToken(token)
      .then((response) => {
        if (response.success) {
          toast.success("Token válido. Puede restablecer su contraseña.");
        } else {
          toast.error("Token inválido o expirado.");
        }
      })
      .catch(() => {
        toast.error("Error al validar el token.");
      });
  }, [token]);

  return (
    <div className="min-h-screen py-10 px-6 bg-white">
      <div className="max-w-3xl mx-auto bg-white/80 border shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-blue-800 mb-6">Restablecer Contraseña</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            className="p-3 border rounded-lg w-full"
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmarContrasena}
            onChange={(e) => setConfirmarContrasena(e.target.value)}
            className="p-3 border rounded-lg w-full"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-md bg-blue-700 text-white shadow hover:scale-105 transition mt-3"
          >
            Restablecer Contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
