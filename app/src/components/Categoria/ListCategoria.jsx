import React, { useEffect, useState } from "react";
import CategoriaService from "@/services/CategoriaService";
import { CategoriaListCard } from "./CategoriaListCard";
import { Loader2, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";

export function ListCategoria() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { t } = useI18n();

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
        <p className="text-lg font-medium">{t("common.loading")}</p>
      </div>
    );

  if (error)
    return (
      <p className="text-center text-red-500 text-lg mt-8">
        {t("alerts.error")}: {error}
      </p>
    );

  return (
    <div className="min-h-screen bg-white py-12 px-6">

      {/* TÍTULO + BOTÓN NUEVA CATEGORÍA */}
      <div className="max-w-6xl mx-auto grid grid-cols-3 items-center mb-6">
        <div></div>

        <h2 className="text-4xl font-extrabold text-center bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
          {t("categories.titleList")}
        </h2>

        <div className="flex justify-end">
          <Link
            to="/categoria/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg shadow hover:scale-105 transition"
          >
            <PlusCircle className="h-5 w-5" />
            {t("categories.buttonNew")}
          </Link>
        </div>
      </div>

      {/* DESCRIPCIÓN */}
      <p className="text-gray-600 max-w-xl mx-auto text-center mb-10">
        {t("categories.description")}
      </p>

      {/* GRID Categorías */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {categorias?.length > 0 ? (
          categorias.map((categoria) => (
            <CategoriaListCard key={categoria.id} categoria={categoria} />
          ))
        ) : (
          <p className="text-center col-span-full text-gray-600">
            {t("categories.noCategories")}
          </p>
        )}
      </div>

    </div>
  );
}
