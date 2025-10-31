import React, { useEffect, useState } from "react"; // Importamos React y los hooks useEffect y useState
import TecnicoService from "@/services/TecnicoService"; // Servicio que obtiene los técnicos desde el backend
import { TecnicosListCard } from "./TecnicosListCard"; // Componente que muestra cada técnico como tarjeta
import { Loader2 } from "lucide-react"; //librería de íconos moderna para React // Icono animado para el cargando

export function ListTecnico() { // Componente principal para listar técnicos
  const [tecnicos, setTecnicos] = useState([]); // Estado que guarda la lista de técnicos
  const [loading, setLoading] = useState(true); // Estado para controlar si está cargando
  const [error, setError] = useState(null); // Estado para manejar errores

  useEffect(() => { // Hook que se ejecuta al montar el componente
    TecnicoService.getTecnicos() // Llama al servicio para traer los técnicos del backend
      .then((response) => { // Si la respuesta es correcta
        setTecnicos(response.data); // Guarda los técnicos en el estado
        setLoading(false); // Cambia el estado de carga a falso
      })
      .catch((error) => { // Si ocurre un error
        setError(error.message); // Guarda el mensaje de error
        setLoading(false); // Detiene el estado de carga
      });
  }, []); // Solo se ejecuta una vez al inicio

  if (loading) // Si está cargando, muestra el spinner
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-blue-700">
        <Loader2 className="animate-spin h-10 w-10 mb-4" /> {/* Ícono animado */}
        <p className="text-lg font-medium">Cargando técnicos...</p> {/* Texto de carga */}
      </div>
    );

  if (error) // Si hay error, muestra el mensaje
    return (
      <p className="text-center text-red-500 text-lg mt-8">
        Error: {error}
      </p>
    );

  return ( // Si todo está bien, muestra la lista de técnicos
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="text-center mb-10"> {/* Encabezado del listado */}
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent mb-3">
          Nuestros Técnicos
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Especialistas capacitados en diferentes áreas del soporte técnico, siempre listos para ayudarte.
        </p> 
      </div>

      {/* Grid con las tarjetas de técnicos */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
         {/* El ? es como un if, si si hay algo hago, si no no */}
        {tecnicos?.length > 0 ? ( // Si hay técnicos, los recorre y muestra
        //map() sirve para recorrer un arreglo y renderizar algo por cada elemento.
          tecnicos.map((tecnico) => (
            <TecnicosListCard key={tecnico.id} tecnico={tecnico} /> // Tarjeta individual
          ))
        ) : ( // Si no hay técnicos
          <p className="text-center col-span-full text-gray-600">
            No se encontraron técnicos registrados.
          </p>
        )}
      </div>
    </div>
  );
}
