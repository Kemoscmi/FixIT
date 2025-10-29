import React, { useEffect, useState } from "react"; // Importa React y hooks de estado y efectos
import { useParams, useNavigate } from "react-router-dom"; // Hooks para obtener parámetros y navegar
import { User, Mail, Phone, Wrench, ArrowLeftCircle } from "lucide-react"; // Íconos decorativos
import TecnicoService from "@/services/TecnicoService"; // Servicio que obtiene los datos del técnico

export function DetailTecnico() { // Componente para mostrar los detalles de un técnico
  const { id } = useParams(); // Obtiene el ID del técnico desde la URL
  const [tecnico, setTecnico] = useState(null); // Estado que guarda los datos del técnico
  const [loading, setLoading] = useState(true); // Estado para mostrar pantalla de carga
  const [error, setError] = useState(null); // Estado para manejar errores
  const navigate = useNavigate(); // Hook para redirigir al usuario

  useEffect(() => { // Ejecuta al montar el componente o cambiar el ID
    TecnicoService.getTecnicoById(id) // Llama al backend para obtener el técnico
      .then((response) => { 
        setTecnico(response.data); // Guarda los datos obtenidos
        setLoading(false); // Desactiva el modo de carga
      })
      .catch((error) => { 
        setError(error.message); // Guarda el error si falla
        setLoading(false); // Desactiva el modo de carga
      });
  }, [id]); // Se ejecuta cuando cambia el ID

  if (loading) // Si aún carga, muestra mensaje
    return <p className="text-center text-blue-700 text-lg mt-10">Cargando...</p>;

  if (error) // Si ocurre error, lo muestra
    return <p className="text-center text-red-500 text-lg mt-10">Error: {error}</p>;

  return ( // Si todo está bien, muestra la vista del detalle
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 py-12">
      <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border border-blue-100">
        
        {/* 🧩 Encabezado con fondo degradado y avatar */}
        <div className="relative h-40 bg-gradient-to-r from-blue-700 to-blue-900">
          <div className="absolute bottom-0 left-8 translate-y-[20%] flex items-center gap-4">
            <div className="w-28 h-28 bg-white border-4 border-blue-800 rounded-full flex items-center justify-center shadow-lg">
              <User className="h-12 w-12 text-blue-700" /> {/* Ícono de usuario */}
            </div>
            <div className="flex flex-col">
              <h2 className="text-3xl font-bold text-white drop-shadow">
                {tecnico.nombre} {tecnico.apellido} {/* Nombre completo */}
              </h2>
              <p className="text-lg text-blue-100 italic drop-shadow-sm">
                {tecnico.observaciones} {/* Observación o cargo */}
              </p>
            </div>
          </div>
        </div>

        {/* 🧩 Cuerpo principal */}
        <div className="p-8 mt-5 space-y-6">
          {/* Información básica */}
          <div className="grid md:grid-cols-2 gap-6 text-gray-700">
            <p>
              <Mail className="inline mr-2 text-blue-600" /> <strong>Correo:</strong> {tecnico.correo}
            </p>
            <p>
              <Phone className="inline mr-2 text-blue-600" /> <strong>Teléfono:</strong> {tecnico.telefono}
            </p>
            <p>
              <Wrench className="inline mr-2 text-blue-600" /> <strong>Carga de trabajo:</strong> {tecnico.carga_trabajo || "No asignado"}
            </p>
            <p>
              <strong>Disponibilidad:</strong>{" "}
              <span
                className={`font-semibold ${
                  tecnico.disponibilidad === "Disponible" ? "text-green-600" : "text-red-600"
                }`}
              >
                {tecnico.disponibilidad}
              </span>
            </p>
          </div>

          {/* 🧩 Sección de especialidades */}
          <div className="bg-blue-50 rounded-lg p-5 shadow-inner">
            <h3 className="text-xl font-semibold text-blue-700 mb-3">Especialidades</h3>
            <ul className="list-disc pl-6 text-gray-700">
              {tecnico.especialidades?.map((esp, i) => (
                <li key={i}>{esp.nombre}</li> // Muestra cada especialidad
              ))}
            </ul>
          </div>

          {/* 🧩 Botón para volver al listado */}
          <button
            onClick={() => navigate("/tecnicos")} // Redirige al listado
            className="flex items-center gap-2 bg-gradient-to-r from-blue-700 to-blue-900 text-white px-6 py-3 rounded-md shadow-lg hover:scale-105 transition-all"
          >
            <ArrowLeftCircle className="h-5 w-5" /> {/* Ícono de flecha */}
            Volver al listado
          </button>
        </div>
      </div>
    </div>
  );
}
