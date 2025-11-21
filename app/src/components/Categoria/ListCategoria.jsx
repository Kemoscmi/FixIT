import React, { useEffect, useState } from "react";
import CategoriaService from "@/services/CategoriaService";
import { CategoriaListCard } from "./CategoriaListCard";
import { Loader2, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function ListCategoria() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    CategoriaService.getCategorias()
      .then((response) => {
        setCategorias(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-blue-700">
        <Loader2 className="animate-spin h-10 w-10 mb-4" />
        <p className="text-lg font-medium">Cargando categorías...</p>
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
          Categorías de Soporte
        </h2>

        {/* BOTÓN NUEVA CATEGORÍA */}
        <div className="flex justify-end">
          <Link
            to="/categoria/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg shadow hover:scale-105 transition"
          >
            <PlusCircle className="h-5 w-5" />
            Nueva Categoría
          </Link>
        </div>
      </div>

      <p className="text-gray-600 max-w-xl mx-auto text-center mb-10">
        Explora las distintas áreas de soporte técnico disponibles. Cada categoría incluye etiquetas, especialidades y tiempos de respuesta definidos.
      </p>

      {/* GRID de categorías */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
    {/* El ? es como un if, si si hay algo hago, si no no */}
        {categorias?.length > 0 ? (
      //map() sirve para recorrer un arreglo y renderizar algo por cada elemento.
          categorias.map((categoria) => (
            <CategoriaListCard key={categoria.id} categoria={categoria} />
          ))
        ) : (
          <p className="text-center col-span-full text-gray-600">
            No se encontraron categorías registradas.
          </p>
        )}
      </div>
    </div>
  );
}
