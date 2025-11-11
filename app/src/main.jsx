import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter } from 'react-router-dom';
import { RouterProvider } from 'react-router';

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

// Módulo Categorías
import { ListCategoria } from './components/Categoria/ListCategoria';
import { DetailCategoria } from './components/Categoria/DetailCategoria';

// Módulo Tickets
import TableTickets from './components/Ticket/TableTickets';
import { ListTickets } from './components/Ticket/ListTickets';
import { DetailTicket } from './components/Ticket/DetailTicket';
import { CreateTicket } from './components/Ticket/CreateTicket'; 

// Módulo Asignaciones
import AsignacionesView from './components/Asignaciones/AsignacionesView';

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

          // Categorías
          { path: 'categorias', element: <ListCategoria /> },
          { path: 'categoria/:id', element: <DetailCategoria /> },

          // Tickets
          { path: 'tickets', element: <ListTickets /> },
          { path: 'tickets/table', element: <TableTickets /> },
          { path: 'tickets/create', element: <CreateTicket /> },
          { path: 'tickets/:id', element: <DetailTicket /> },

          // Asignaciones
          { path: 'asignaciones', element: <AsignacionesView /> },

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
    <RouterProvider router={rutas} />
  </StrictMode>,
);
