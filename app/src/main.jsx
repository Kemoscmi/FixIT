//  main.jsx
// -------------------------------------------------------------
// Punto de entrada principal del frontend de FixIT.
// Aquí se configuran las rutas, se definen las páginas públicas
// y las protegidas (que requieren inicio de sesión).
// -------------------------------------------------------------

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

//  Importación de componentes y páginas
import { Layout } from "./components/Layout/Layout";
import Home from "./components/Home/Home"; // Página pública (inicio)
import Principal from "./components/Home/Principal"; // Página interna tras login
import Login from "./components/Login/Login";
import { PageNotFound } from "./components/Home/PageNotFound";

//  Páginas del sistema
import { ListTecnico } from "./components/Tecnico/ListTecnico";
import { DetailTecnico } from "./components/Tecnico/DetailTecnico";
import TableTickets from "./components/Ticket/TableTickets";
import { ListTickets } from "./components/Ticket/ListTickets";
import { DetailTicket } from "./components/Ticket/DetailTicket";

//  Componente que protege rutas privadas
import ProtectedRoute from "./auth/ProtectedRoute";


//  Definición de rutas principales
const rutas = createBrowserRouter([
  //  Rutas públicas
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },

  //  Rutas protegidas (solo usuarios autenticados)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          // Página principal tras iniciar sesión
          { path: "Principal", element: <Principal /> },

          // Módulo de técnicos
          { path: "tecnicos", element: <ListTecnico /> },
          { path: "tecnico/:id", element: <DetailTecnico /> },

          // Módulo de tickets
          { path: "tickets", element: <ListTickets /> },
          { path: "tickets/table", element: <TableTickets /> },
          { path: "tickets/:id", element: <DetailTicket /> },

          // Página 404
          { path: "*", element: <PageNotFound /> },
        ],
      },
    ],
  },
]);


//  Render principal de la aplicación

// Se monta el router en el DOM usando <RouterProvider>,
// permitiendo la navegación entre páginas sin recargar.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={rutas} />
  </StrictMode>
);