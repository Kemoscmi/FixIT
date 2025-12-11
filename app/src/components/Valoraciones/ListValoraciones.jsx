import React, { useEffect, useState } from "react";
import ValoracionService from "@/services/ValoracionService";
import { Link, useNavigate } from "react-router-dom";


const ListValoraciones = () => {
  const [valoraciones, setValoraciones] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook para navegar
  const user = JSON.parse(localStorage.getItem("user")); // Obtener el usuario desde el localStorage (o desde un contexto)

  const userId = user?.id_usuario || user?.id;
  const roleId = user?.rol_id;

  // Cambiar el método para Admin en el frontend (ListValoraciones.jsx)
useEffect(() => {
  const fetchValoraciones = async () => {
    try {
      let result;
      if (roleId === 1) {
        // Si el usuario es Admin, obtiene todas las valoraciones sin rol_id ni user_id
        console.log("Obteniendo valoraciones para Admin...");
        result = await ValoracionService.getValoracionesPorRol(userId, roleId); // No pasa rol_id ni user_id
      } else if (roleId === 2) {
        // Si el usuario es Técnico, obtiene solo las valoraciones de sus tickets asignados
        console.log("Obteniendo valoraciones para Técnico...");
        result = await ValoracionService.getValoracionesPorRol(userId, roleId);
      } else if (roleId === 3) {
        // Si el usuario es Cliente, obtiene solo las valoraciones que él mismo hizo
        console.log("Obteniendo valoraciones para Cliente...");
        result = await ValoracionService.getValoracionesPorRol(userId, roleId);
      }

      setValoraciones(result.data); // Asegúrate de que accedes a result.data
    } catch (err) {
      setError("Hubo un problema al cargar las valoraciones");
      console.error("Error al cargar valoraciones:", err); // Más detalles del error
    }
  };

  fetchValoraciones();
}, [userId, roleId]);



  return (
    <div className="valoraciones-container px-6 py-12">
      {/* Título */}
      <h3 className="text-4xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
        Lista de Valoraciones
      </h3>

      {/* Texto descriptivo */}
      <p className="text-base text-gray-600 max-w-2xl mx-auto text-center mb-8">
        Explora todas las valoraciones realizadas por los clientes sobre el
        servicio recibido. Aquí podrás ver los puntajes, comentarios y más
        detalles sobre cada valoración.
      </p>

      {/* Error */}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Grid de valoraciones */}
      <div className="valoraciones-grid grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {valoraciones.length > 0 ? (
          valoraciones.map((valoracion) => (
            <div key={valoracion.id} className="card-valoracion bg-white p-6 rounded-lg shadow-md border">
              <div className="card-header flex justify-between items-center mb-4">
                <h4 className="text-xl font-semibold">{valoracion.ticket_titulo}</h4>
                <span
                  className={`text-sm px-2 py-1 rounded-full ${
                    valoracion.puntaje >= 4
                      ? "bg-green-200 text-green-700"
                      : "bg-yellow-200 text-yellow-700"
                  }`}
                >
                  {valoracion.puntaje >= 4 ? "Excelente" : "Regular"}
                </span>
              </div>
              <p className="text-sm">ID: {valoracion.id}</p>
              <p className="text-sm">
                Fecha: {new Date(valoracion.fecha).toLocaleString()}
              </p>
              <Link
                to={`/valoracion/${valoracion.id}`}
                className="mt-4 inline-block px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-md hover:scale-105 transition"
              >
                Ver Detalles
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center w-full">
            <p className="text-lg text-gray-500">No hay valoraciones disponibles.</p>
          </div>
        )}
      </div>

      {/* Botón de Volver a Tickets */}
      <div className="flex justify-start mt-8 mx-auto max-w-7xl">
        <button
          onClick={() => navigate("/tickets")} // Redirige a la página de Tickets
          className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-md hover:scale-105 transition"
        >
          Volver a Tickets
        </button>
      </div>

      {/* Estilos CSS directamente en el archivo JS */}
      <style jsx>{`
        .valoraciones-container {
          padding: 20px;
        }

        .valoraciones-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        .card-valoracion {
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .card-valoracion:hover {
          transform: translateY(-5px);
          box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-valoracion-button {
          background-color: #007bff;
          color: #fff;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .card-valoracion-button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default ListValoraciones;  