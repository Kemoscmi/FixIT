import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { Home } from './components/Home/Home'
import { RouterProvider } from 'react-router'
import { PageNotFound } from './components/Home/PageNotFound'
//Crear las rutas
const rutas=createBrowserRouter([
  {
    element: <Layout />,
    children:[
      //Ruta principal localhost:5173
      {index:true, element:<Home />},
      //Ruta comodín (404)
      { path:'*', element: <PageNotFound />}
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={rutas} />
  </StrictMode>,
)
