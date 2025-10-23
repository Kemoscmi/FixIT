//  auth.store.js
// -------------------------------------------------------------
//  Este archivo maneja TODO lo relacionado con la autenticación
// de usuarios dentro del sistema FixIT.
//
// Aquí se guarda quién inició sesión, su token, y si está o no
// autenticado. También se comunica con el backend para hacer login,
// y usa localStorage para mantener la sesión activa incluso si el
// usuario recarga la página.
//
// Se utiliza una librería llamada **Zustand**, que nos permite
// manejar un estado global (como una memoria central compartida)
// sin tener que usar Redux o Context API. Es más simple, rápida
// y limpia.
//
// este archivo:
///  - Controla el inicio y cierre de sesión.
///  - Guarda la información del usuario logueado.
///  - Valida si hay una sesión activa al abrir la app.
///  - Facilita que cualquier componente sepa si hay un usuario logueado.
// -------------------------------------------------------------

import { create } from "zustand"; //  Librería para manejar el estado global (store)
import axios from "axios"; //  Para hacer solicitudes HTTP al backend

//  URL base del backend para las peticiones del módulo de usuario
// Esta variable debe estar definida en tu archivo `.env`
// Ejemplo: VITE_BASE_URL="http://localhost:81/Proyecto/api/"
const API_URL = import.meta.env.VITE_BASE_URL + "usuario";

/**
 *  Creación del store global de autenticación
 * -------------------------------------------------------------
 * Aquí definimos las variables y funciones que controlan el
 * estado de sesión de toda la aplicación.
 * 
 * `set` → función que permite actualizar el estado global.
 */
const useAuth = create((set) => ({

  // -------------------------------------------------------------
  //  ESTADOS GLOBALES
  // -------------------------------------------------------------
  // Estos valores se pueden usar desde cualquier parte de la app
  // con solo llamar al hook `useAuth()`.
  user: null,               // Datos del usuario autenticado
  token: null,              // Token JWT que nos da el backend
  isAuthenticated: false,   // Indica si hay una sesión activa
  loading: false,           // Controla la carga (true mientras se verifica o inicia sesión)
  error: null,              // Guarda mensajes de error si algo falla en el login


  // -------------------------------------------------------------
  //  FUNCIÓN DE LOGIN
  // -------------------------------------------------------------
  // Esta función se ejecuta cuando el usuario inicia sesión desde el formulario.
  // Envía las credenciales (correo y contraseña) al backend y, si son válidas,
  // guarda los datos en localStorage y actualiza el estado global.
  login: async (correo, contrasena) => {
    // Muestra que el sistema está procesando el inicio de sesión
    set({ loading: true, error: null });

    try {
      //  Enviar los datos al backend
      const response = await axios.post(`${API_URL}/login`, {
        correo,
        contrasena,
      });

      // Mostrar en consola la respuesta completa (solo lo hice para depurar por un error que tuve)
      console.log(
        "🔹 Respuesta completa del backend:",
        JSON.stringify(response.data, null, 2)
      );

      //  Si el backend respondió correctamente con usuario y token
      if (response.data?.data?.usuario && response.data?.data?.token) {
        const { token, usuario } = response.data.data;

        
const userData = { ...usuario };
userData.rol_id =
  userData.rol === "Administrador"
    ? 1
    : userData.rol === "Tecnico"
    ? 2
    : userData.rol === "Cliente"
    ? 3
    : null;

localStorage.setItem("token", token);
localStorage.setItem("user", JSON.stringify(userData));

set({
  user: userData,
  token,
  isAuthenticated: true,
  loading: false,
  error: null,
});

        console.log("✅ Login exitoso:", usuario);
        return { success: true };
      }

      //  Si no se reciben datos correctos, se lanza un error personalizado
      throw new Error("Credenciales incorrectas o error en inicio de sesión");

    } catch (err) {
      // Si ocurre un error (por ejemplo, credenciales inválidas o backend caído)
      console.error("Error de login:", err);

      // Se actualiza el estado con el error para poder mostrarlo en pantalla
      set({
        loading: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Error desconocido en inicio de sesión",
      });

      // Se devuelve un objeto indicando que el login falló
      return { success: false };
    }
  },


  // -------------------------------------------------------------
  //  FUNCIÓN DE LOGOUT (CERRAR SESIÓN)
  // -------------------------------------------------------------
  // Esta función se ejecuta cuando el usuario hace clic en “Cerrar sesión”.
  // Elimina los datos guardados y reinicia el estado global.
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false });
  },


  // -------------------------------------------------------------
  //  VALIDACIÓN DE SESIÓN EXISTENTE (AUTO-LOGIN)
  // -------------------------------------------------------------
  // Cuando la aplicación se abre o se recarga, esta función revisa si
  // hay un token y un usuario guardados en localStorage.
  // Si los encuentra, mantiene la sesión iniciada automáticamente.
  checkSession: () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    // Si hay datos guardados, se actualiza el estado global
    if (token && user) {
      set({
        token,
        user: JSON.parse(user),
        isAuthenticated: true,
      });
    } else {
      // Si no hay nada guardado, se resetea el estado a valores iniciales
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },
}));

// Exportamos el hook personalizado para usarlo en cualquier componente
// Ejemplo: const { login, logout, isAuthenticated, user } = useAuth();
export default useAuth;