//  ProtectedRoute.jsx
// -------------------------------------------------------------
//  Este  protege las rutas privadas del sistema FixIT.
//
// Su función es garantizar que solo los usuarios autenticados puedan
// acceder a determinadas páginas internas (por ejemplo: dashboard,
// gestión de tickets, administración, etc.).
//
// Si el usuario NO ha iniciado sesión:
//    → es redirigido automáticamente a la página de login.
//
// Si el usuario SÍ está autenticado:
//    → se le permite ver las rutas internas del sistema.
//
// Además, mientras se verifica la sesión (por ejemplo, al cargar la app
// o validar un token guardado en localStorage), el componente muestra
// un mensaje temporal de “Verificando sesión...”.
//
// En resumen:
//     Controla el acceso a las páginas privadas.
//     Evita que usuarios sin sesión accedan al contenido interno.
//     Trabaja junto al store de autenticación global (Zustand).
// -------------------------------------------------------------

import { Navigate, Outlet } from "react-router-dom"; //  Herramientas de navegación de React Router
import useAuth from "./store/auth.store"; //  Hook global que gestiona la autenticación (Zustand)

/**
 *  ProtectedRoute
 * -------------------------------------------------------------
 * Este componente actúa como un "filtro de seguridad" para las rutas privadas.
 * 
 * - Si el usuario está autenticado: se muestran las páginas internas (usando <Outlet />).
 * - Si no lo está: se redirige automáticamente al login.
 * - Si la autenticación aún se está verificando: se muestra un mensaje temporal.
 * 
 * Se utiliza dentro del enrutador principal para envolver las rutas protegidas.
 * -------------------------------------------------------------
 */
export default function ProtectedRoute() {
  // Extrae del store global el estado actual de la sesión
  // isAuthenticated → indica si el usuario tiene sesión activa
  // loading → indica si aún se está verificando el token o sesión guardada
  const { isAuthenticated, loading } = useAuth();

  /**
   *  Etapa de verificación de sesión
   * -------------------------------------------------------------
   * Cuando la aplicación se carga o refresca, el sistema revisa si existe
   * un token guardado en el navegador (auto-login). Mientras se realiza
   * esa validación, se muestra un mensaje informativo para evitar errores
   * visuales o redirecciones prematuras.
   */
  if (loading) {
    return <div className="text-center mt-10">Verificando sesión...</div>;
  }

  /**
   *  Si el usuario NO está autenticado:
   * -------------------------------------------------------------
   * Se redirige automáticamente a la pantalla de inicio de sesión.
   * 
   * El atributo `replace` evita que el usuario pueda regresar con el botón
   * “Atrás” del navegador a una página privada una vez redirigido.
   */
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  /**
   *  Si el usuario SÍ está autenticado:
   * -------------------------------------------------------------
   * Se renderizan las rutas internas mediante el componente `<Outlet />`.
   * 
   *  `<Outlet />` funciona como un “espacio reservado” donde se muestran
   * las rutas hijas del layout protegido (por ejemplo, dashboard, tickets,
   * reportes, etc.).
   */
  return <Outlet />;
}