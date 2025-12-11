import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter } from 'react-router-dom';
import { RouterProvider } from 'react-router';
import { Toaster } from "react-hot-toast";

// Layout general
import { Layout } from './components/Layout/Layout';

// Páginas base
import Home from './components/Home/Home';
import Principal from './components/Home/Principal';
import Login from './components/Login/Login';
import { PageNotFound } from './components/Home/PageNotFound';

// Módulo Técnicos
import { ListTecnico } from './components/Tecnico/ListTecnico';
import { DetailTecnico } from './components/Tecnico/DetailTecnico';
import { FormTecnico } from './components/Tecnico/FormTecnico';

// Módulo Usuarios
import { ListUsuarios } from './components/Usuarios/ListUsuarios'; 
import { DetailUsuario } from './components/Usuarios/DetailUsuario'; 
import { FormCreateUsuario } from './components/Usuarios/FormCreateUsuario'; 
import { FormEditUsuario } from './components/Usuarios/FormEditUsuario'; 
import { RequestPasswordReset } from "./components/Usuarios/RequestPasswordReset";
import { ResetPassword } from "./components/Usuarios/ResetPassword";


// Módulo Categorías
import { ListCategoria } from './components/Categoria/ListCategoria';
import { DetailCategoria } from './components/Categoria/DetailCategoria';
import { FormCategoria } from './components/Categoria/FormCategoria';


// Módulo Tickets
import TableTickets from './components/Ticket/TableTickets';
import { ListTickets } from './components/Ticket/ListTickets';
import { DetailTicket } from './components/Ticket/DetailTicket';
import { CreateTicket } from './components/Ticket/CreateTicket'; 

// Módulo Asignaciones
import AsignacionesView from './components/Asignaciones/AsignacionesView';
import AsignacionesAuto from './components/Asignaciones/AsignacionesAuto';

//Notificaciones 
import { NotificationProvider } from "./components/Notificaciones/NotificationProvider";
import HistorialNotificaciones from './components/Notificaciones/HistorialNotificaciones';


// Autenticación
import ProtectedRoute from './auth/ProtectedRoute';

const rutas = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          // Página principal tras login
          { path: 'Principal', element: <Principal /> },

          // Técnicos
          { path: 'tecnicos', element: <ListTecnico /> }, 
          { path: 'tecnico/:id', element: <DetailTecnico /> },

          // Usuarios
          { path: 'usuarios', element: <ListUsuarios /> },  // Lista de usuarios
          { path: "usuario/detail/:id", element: <DetailUsuario /> }, // Lista de usuarios
          { path: 'usuario/create', element: <FormCreateUsuario /> },  // Crear nuevo usuario
          { path: 'usuario/edit/:id', element: <FormEditUsuario /> },  // Editar usuario por ID
          { path: "request-password-reset", element: <RequestPasswordReset /> }, // Lista de usuarios
          { path: "reset-password/:token", element: <ResetPassword  /> }, // Lista de usuarios


          // Categorías
          { path: 'categorias', element: <ListCategoria /> },
          { path: 'categoria/:id', element: <DetailCategoria /> },
          { path: 'tecnico/create', element: <FormTecnico /> },
          { path: 'tecnico/edit/:id', element: <FormTecnico /> },
          { path: "categoria/create", element: <FormCategoria /> },
          { path: "categoria/edit/:id", element: <FormCategoria /> },

          // Tickets
          { path: 'tickets', element: <ListTickets /> },
          { path: 'tickets/table', element: <TableTickets /> },
          { path: 'tickets/create', element: <CreateTicket /> },
          { path: 'tickets/:id', element: <DetailTicket /> },

          // Asignaciones
          { path: 'asignaciones', element: <AsignacionesView /> },
          { path: 'asignaciones/autotriage', element: <AsignacionesAuto /> },

          //Notiiiss
          { path: 'historial', element: <HistorialNotificaciones /> },

          // Página 404
          { path: '*', element: <PageNotFound /> },
        ],
      },
    ],
  },

  // Rutas públicas
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>

     <NotificationProvider> 
    <RouterProvider router={rutas} />
   <Toaster 
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: { fontSize: "15px" }
      }}
    />

  </NotificationProvider>


  </StrictMode>,
);