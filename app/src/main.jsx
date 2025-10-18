import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter } from 'react-router-dom';
import { RouterProvider } from 'react-router';

// Layout principal
import { Layout } from './components/Layout/Layout';

// Páginas generales
import { Home } from './components/Home/Home';
import { PageNotFound } from './components/Home/PageNotFound';

// Páginas de tickets
import TableTickets from './components/Ticket/TableTickets';
import { ListTickets } from './components/Ticket/ListTickets';
import { DetailTicket } from './components/Ticket/DetailTicket';

// Definición de rutas
const rutas = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Página principal
      { index: true, element: <Home /> },

      // Rutas de tickets
      { path: 'tickets', element: <ListTickets /> },              // vista general (cliente/técnico)
      { path: 'tickets/table', element: <TableTickets /> },       // vista admin tipo tabla
      { path: 'tickets/:id', element: <DetailTicket /> },         // detalle del ticket individual

      // Ruta comodín (404)
      { path: '*', element: <PageNotFound /> },
    ],
  },
]);

// Render del router principal
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={rutas} />
  </StrictMode>
);