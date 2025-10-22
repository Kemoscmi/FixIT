//  Login.jsx
// -------------------------------------------------------------
//  Este componente representa la pantalla de inicio de sesión
// del sistema FixIT.
//
// Su función principal es permitir al usuario ingresar sus credenciales
// (correo y contraseña) para autenticarse en el sistema. Al hacerlo,
// se conecta con el *store global de autenticación* (Zustand) para
// enviar los datos al backend, validar la sesión y guardar la información
// del usuario y su token.
//
// Si el login es exitoso → redirige automáticamente al panel principal.
// Si falla → muestra un mensaje de error claro y manejado en interfaz.
//
// En resumen:
//  Maneja el formulario de inicio de sesión.
//  Se comunica con el backend a través de useAuth().
//  Redirige al usuario autenticado.
// -------------------------------------------------------------

import { useState } from "react";              //  Manejo de estados locales (inputs, errores, etc.)
import { useNavigate } from "react-router-dom"; //  Permite redirigir al usuario a otra ruta
import useAuth from "../../auth/store/auth.store"; //  Hook global de autenticación (Zustand)

export default function Login() {
  // -------------------------------------------------------------
  //  Definición de estados locales
  // -------------------------------------------------------------
  // Estos controlan los valores del formulario y los mensajes visibles
  const [correo, setCorreo] = useState("");        // Guarda el correo electrónico ingresado
  const [contrasena, setContrasena] = useState(""); // Guarda la contraseña ingresada
  const [error, setError] = useState("");           // Muestra mensajes de error (login incorrecto, etc.)
  
  // Hook de navegación de React Router para redirigir luego del login
  const navigate = useNavigate();

  // Extraemos las funciones del store global de autenticación
  // login → función para enviar credenciales al backend
  // loading → estado que indica si se está procesando el login
  const { login, loading } = useAuth();

  // -------------------------------------------------------------
  //  Manejador del formulario de inicio de sesión
  // -------------------------------------------------------------
  // Esta función se ejecuta cuando el usuario hace clic en “Entrar”.
  // Previene el comportamiento por defecto del formulario (recargar la página),
  // llama al método login() del store global, y según la respuesta:
  //   Redirige al panel principal (dashboard o home interno)
  //   Muestra un mensaje de error en pantalla
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita el refresh de la página al enviar el formulario
    const result = await login(correo, contrasena); // Envía credenciales al backend

    if (result.success) {
      //  Si las credenciales son correctas, redirige al home interno
      navigate("/Principal");
    } else {
      //  Si el login falla, muestra un mensaje 
      setError("Credenciales incorrectas o error de conexión");
    }
  };

  // -------------------------------------------------------------
  //  Render del formulario
  // -------------------------------------------------------------
  // Aquí se estructura visualmente el formulario de inicio de sesión,
  // incluyendo campos, botón y mensajes visuales de error o carga.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* Contenedor principal */}
      <div className="card w-full max-w-md shadow-md p-6 bg-white rounded-lg">
        
        {/* Título principal */}
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
          {/* Campo: Correo electrónico */}
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

          {/* Campo: Contraseña */}
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

        {/* Enlace adicional */}
        <p className="text-sm text-gray-600 mt-4 text-center">
          ¿No tienes una cuenta?{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Contáctanos
          </a>
        </p>
      </div>
    </div>
  );
}