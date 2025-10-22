import React, { useEffect, useState } from 'react';
import TecnicoService from '@/services/TecnicoService';  // Importamos el servicio de técnicos
import { TecnicosListCard } from './TecnicosListCard';  // Componente de tarjeta de técnico

export function ListTecnico() {
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    TecnicoService.getTecnicos()  // Llamamos al servicio para obtener todos los técnicos
      .then((response) => {
        setTecnicos(response.data);  // Guardamos los técnicos en el estado
        setLoading(false);  // Terminamos la carga
      })
      .catch((error) => {
        setError(error.message);  // Guardamos el error en el estado
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center">Cargando técnicos...</p>;
  if (error) return <p className="text-center">Error: {error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-4 text-center">Listado de Técnicos</h2>
      {/* Usamos un grid para el diseño de las tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Aquí renderizamos cada técnico dentro de un card */}
        {tecnicos && tecnicos.length > 0 ? (
          tecnicos.map((tecnico) => (
            <TecnicosListCard key={tecnico.id} tecnico={tecnico} />
          ))
        ) : (
          <p>No se encontraron técnicos.</p>
        )}
      </div>
    </div>
  );
}
