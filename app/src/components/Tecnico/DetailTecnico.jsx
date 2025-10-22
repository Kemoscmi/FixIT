import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Para obtener el id desde la URL
import TecnicoService from '@/services/TecnicoService';  // Importamos el servicio de técnicos

export function DetailTecnico() {
  const { id } = useParams();  // Obtener el id del técnico desde la URL
  const [tecnico, setTecnico] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();  // Para navegar de vuelta al listado

  useEffect(() => {
    TecnicoService.getTecnicoById(id)  // Obtener los datos del técnico por ID
      .then((response) => {
        setTecnico(response.data);  // Guardamos los datos del técnico
        setLoading(false);  // Terminamos la carga
      })
      .catch((error) => {
        setError(error.message);  // Guardamos el error
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="text-center text-xl">Cargando detalles del técnico...</p>;
  if (error) return <p className="text-center text-xl text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-6 text-blue-600">Detalle de Técnico</h2>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {/* Información básica del técnico */}
        <div className="space-y-4">
          <p><strong className="text-gray-700">Nombre:</strong> {tecnico.nombre} {tecnico.apellido}</p>
          <p><strong className="text-gray-700">Correo:</strong> {tecnico.correo}</p>
          <p><strong className="text-gray-700">Teléfono:</strong> {tecnico.telefono}</p>
          <p><strong className="text-gray-700">Observaciones:</strong> {tecnico.observaciones}</p>
          <p><strong className="text-gray-700">Carga de trabajo:</strong> {tecnico.carga_trabajo || 'No asignado'}</p>
          <p><strong className="text-xl font-medium text-blue-700">Disponibilidad:</strong> {tecnico.disponibilidad}</p>
        </div>

        {/* Especialidades del técnico */}
        <div className="mt-6">
          <h3 className="text-xl font-medium text-blue-700">Especialidades</h3>
          <ul className="list-disc pl-6 mt-2">
            {tecnico.especialidades?.map((especialidad, index) => (
              <li key={index} className="text-gray-600">{especialidad.nombre}</li>
            ))}
          </ul>
        </div>

        {/* Botón para volver al listado */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/tecnicos')}
            className="bg-blue-700 text-white px-6 py-3 rounded-md hover:bg-blue-800 transition"
          >
            Volver al listado
          </button>
        </div>
      </div>
    </div>
  );
}
