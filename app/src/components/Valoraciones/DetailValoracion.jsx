import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';  // Para obtener el ID de la URL
import ValoracionService from '@/services/ValoracionService';  // Importar el servicio

const DetailValoracion = () => {
  const { id } = useParams();  // Obtienes el ID de la URL
  const [valoracion, setValoracion] = useState(null);
  const [error, setError] = useState('');

  // Función para formatear la fecha
  const formatFecha = (fecha) => {
    const date = new Date(fecha);  // Convierte a objeto Date
    if (isNaN(date)) return 'Fecha no válida';  // Verifica si la fecha es válida
    return date.toLocaleString();  // Da formato local de la fecha y hora
  };

  // Obtenemos el rol y user_id desde el localStorage o contexto
  const user = JSON.parse(localStorage.getItem('user'));  // Obtén el usuario desde localStorage
  const rolId = user?.rol_id;
  const userId = user?.id_usuario || user?.id;

  useEffect(() => {
    const fetchValoracion = async () => {
      try {
        // Asegúrate de pasar los parámetros correctamente
        const result = await ValoracionService.getValoracionById(id, rolId, userId);  // Llamada a la API
        console.log("Respuesta de la API:", result); 
        setValoracion(result.data);  // Guardamos los datos de la valoración
      } catch (err) {
        setError('Hubo un problema al obtener los detalles de la valoración');
        console.error("Error al obtener detalles:", err);  // Más detalles del error
      }
    };

    fetchValoracion();
  }, [id, rolId, userId]);  // Dependemos del ID, rolId y userId

  // Mostrar mensaje de error si ocurre uno
  if (error) return <p className="text-center text-red-500 font-semibold">{error}</p>;  // Si hay error, muestra un mensaje
  if (!valoracion) return <p className="text-center text-gray-500">Cargando...</p>;  // Si no hay valoraciones aún, muestra "Cargando..."

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-2xl p-8 rounded-lg border border-gray-200">
      <h2 className="text-3xl font-semibold text-center text-blue-700 mb-6">
        Detalle de la Valoración
      </h2>

      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-gray-800">{valoracion?.ticket_titulo || 'Título no disponible'}</h3>
        <p className="text-lg text-gray-700 mt-2">{valoracion?.comentario || 'Comentario no disponible'}</p>
      </div>

      <div className="mb-6 border-t pt-4">
        <p className="text-gray-700 text-lg"><strong>Cliente:</strong> {valoracion?.cliente_nombre || 'Cliente no disponible'}</p>
        <p className="text-gray-700 text-lg"><strong>Puntaje:</strong> {valoracion?.puntaje || 'Puntaje no disponible'}</p>
        <p className="text-gray-700 text-lg"><strong>Fecha:</strong> {formatFecha(valoracion?.fecha) || 'Fecha no disponible'}</p>
      </div>
    
      <div className="flex justify-between mt-8">
        <button 
          onClick={() => window.history.back()} 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
        >
          Volver al listado
        </button>

        <button 
          className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all duration-200"
        >
          Editar valoración
        </button>
      </div>
    </div>
  );
};

export default DetailValoracion;
