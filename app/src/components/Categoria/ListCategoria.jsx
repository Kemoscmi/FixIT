import React, { useEffect, useState } from "react";
import CategoriaService from "@/services/CategoriaService";
import { CategoriaListCard } from "./CategoriaListCard";

export function ListCategoria() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    CategoriaService.getCategorias()
      .then((response) => {
        setCategorias(response.data); // viene dentro de data.data según backend
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center text-lg">Cargando categorías...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-6 text-center text-blue-700">
        Listado de Categorías
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorias && categorias.length > 0 ? (
          categorias.map((categoria) => (
            <CategoriaListCard key={categoria.id} categoria={categoria} />
          ))
        ) : (
          <p className="text-center">No se encontraron categorías registradas.</p>
        )}
      </div>
    </div>
  );
}
