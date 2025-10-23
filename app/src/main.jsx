//  main.jsx
// -------------------------------------------------------------
// Punto de entrada principal del frontend de FixIT.
// Aquí se configuran las rutas de toda la aplicación, tanto las
// públicas (Home, Login) como las protegidas (requieren sesión activa).
// -------------------------------------------------------------

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

//  🧩 Importación de componentes y páginas generales
import { Layout } from "./components/Layout/Layout";
import Home from "./components/Home/Home";              // Página pública (inicio)
import Principal from "./components/Home/Principal";    // Página interna tras login
import Login from "./components/Login/Login";
import { PageNotFound } from "./components/Home/PageNotFound";

//  🧩 Módulo de técnicos
import { ListTecnico } from "./components/Tecnico/ListTecnico";
import { DetailTecnico } from "./components/Tecnico/DetailTecnico";

//  🧩 Módulo de tickets
import TableTickets from "./components/Ticket/TableTickets";
import { ListTickets } from "./components/Ticket/ListTickets";
import { DetailTicket } from "./components/Ticket/DetailTicket";

//  🧩 Módulo de asignaciones (nuevo para Persona 2)
import AsignacionesView from "./components/Asignaciones/AsignacionesView";

//  🧩 Componente que protege rutas privadas (requiere sesión activa)
import ProtectedRoute from "./auth/ProtectedRoute";

// -------------------------------------------------------------
// Definición de todas las rutas principales del sistema FixIT
// -------------------------------------------------------------
const rutas = createBrowserRouter([
  //  🔓 Rutas públicas (sin necesidad de autenticación)
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },

  //  🔒 Rutas protegidas (solo usuarios autenticados)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          // Página principal tras iniciar sesión
          { path: "Principal", element: <Principal /> },

          // Sección de técnicos
          { path: "tecnicos", element: <ListTecnico /> },
          { path: "tecnico/:id", element: <DetailTecnico /> },

          // Sección de tickets
          { path: "tickets", element: <ListTickets /> },
          { path: "tickets/table", element: <TableTickets /> },
          { path: "tickets/:id", element: <DetailTicket /> },

          // ✅ Nueva sección de asignaciones (vista tipo tablero)
          { path: "asignaciones", element: <AsignacionesView /> },

          // Página 404 para rutas inexistentes
          { path: "*", element: <PageNotFound /> },
        ],
      },
    ],
  },
]);

// -------------------------------------------------------------
// Render principal de la aplicación React
// -------------------------------------------------------------
// Se monta el enrutador en el DOM usando <RouterProvider>,
// lo que permite la navegación interna sin recargar la página.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={rutas} />
  </StrictMode>
);