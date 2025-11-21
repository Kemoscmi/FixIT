import React, { useEffect, useState } from "react"; // Importamos React y los hooks useEffect y useState
import TecnicoService from "@/services/TecnicoService"; // Servicio que obtiene los técnicos desde el backend
import { TecnicosListCard } from "./TecnicosListCard"; // Componente que muestra cada técnico como tarjeta
import { Loader2 } from "lucide-react"; //librería de íconos moderna para React // Icono animado para el cargando
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";

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
  }, []);

  if (loading) // Para cuando esta cargando
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-blue-700">
        <Loader2 className="animate-spin h-10 w-10 mb-4" /> {/* Iconito de cargando */}
        <p className="text-lg font-medium">Cargando técnicos...</p> 
      </div>
    );

  if (error) 
    return (
      <p className="text-center text-red-500 text-lg mt-8">
        Error: {error}
      </p>
    );

return (
  <div className="min-h-screen bg-white py-12 px-6">

    <div className="max-w-6xl mx-auto grid grid-cols-3 items-center mb-6">

      <div></div>

      <h2 className="text-4xl font-extrabold text-center bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
        Nuestros Técnicos
      </h2>

      {/* BOTÓN EN LA DERECHA */}
      <div className="flex justify-end">
        <Link 
          to="/tecnico/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg shadow hover:scale-105 transition"
        >
          <PlusCircle className="h-5 w-5" />
          Nuevo Técnico
        </Link>
      </div>
      </div>
      
    <p className="text-gray-600 max-w-xl mx-auto text-center mb-10">
      Especialistas capacitados en diferentes áreas del soporte técnico, siempre listos para ayudarte.
    </p>

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
