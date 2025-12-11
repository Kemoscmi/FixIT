import { useState } from "react";              // Manejo de estados locales (inputs, errores, etc.)
import { useNavigate } from "react-router-dom"; // Permite redirigir al usuario a otra ruta
import useAuth from "../../auth/store/auth.store"; // Hook global de autenticación (Zustand)

export default function Login() {
  const [correo, setCorreo] = useState("");        // Guarda el correo electrónico ingresado
  const [contrasena, setContrasena] = useState(""); // Guarda la contraseña ingresada
  const [error, setError] = useState("");           // Muestra mensajes de error (login incorrecto, etc.)
  
  // Hook de navegación de React Router para redirigir luego del login
  const navigate = useNavigate();

  // Extraemos las funciones del store global de autenticación
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita el refresh de la página al enviar el formulario
    const result = await login(correo, contrasena); // Envía credenciales al backend

    if (result.success) {
      // Si las credenciales son correctas, redirige al home interno
      navigate("/Principal");
    } else {
      // Si el login falla, muestra un mensaje 
      setError("Credenciales incorrectas o error de conexión");
    }
  };

  // Función para redirigir al formulario de restablecimiento de contraseña
  const handlePasswordReset = () => {
    navigate("request-password-reset");  // Redirige a la página de solicitud de restablecimiento
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card w-full max-w-md shadow-md p-6 bg-white rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">
          Iniciar sesión
        </h2>

        {/* Mensaje de error si las credenciales son incorrectas */}
        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-3 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        {/* Formulario de ingreso */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="input w-full mt-1 border rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
              placeholder="admin@fixit.cr"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className="input w-full mt-1 border rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Botón de enviar */}
          <button
            type="submit"
            disabled={loading}
            className={`btn w-full py-2 rounded-md font-semibold text-white transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-800"
            }`}
          >
            {loading ? "Iniciando..." : "Entrar"}
          </button>
        </form>

        {/* Enlace para solicitar restablecimiento de contraseña */}
        <div className="mt-4">
          <button
            onClick={handlePasswordReset} // Usa navigate aquí
            className="text-blue-600 hover:underline text-sm text-center block"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>
    </div>
  );
}
