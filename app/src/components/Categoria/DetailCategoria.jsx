import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CategoriaService from "@/services/CategoriaService";
import { Layers, Tag, Star, Clock, ArrowLeftCircle, Pencil } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

export function DetailCategoria() {
  const { id } = useParams();
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    CategoriaService.getCategoriaById(id)
      .then((response) => {
        setCategoria(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-indigo-600">
        <Clock className="animate-spin h-10 w-10 mb-4" />
        <p className="text-lg font-medium">{t("categories.detail.loading")}</p>
      </div>
    );

  if (error)
    return (
      <p className="text-center text-red-500 text-lg mt-8">
        {t("alerts.error")}: {error}
      </p>
    );

  if (!categoria)
    return (
      <p className="text-center text-gray-500 text-lg mt-8">
        {t("categories.detail.notFound")}
      </p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-pink-100 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 border border-gray-200">

        {/* ENCABEZADO */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-100 to-pink-100 rounded-full shadow-sm">
            <Layers className="h-8 w-8 text-blue-700" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            {categoria.nombre}
          </h2>
        </div>

        {/* ETIQUETAS */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {t("categories.detail.tags")}
          </h3>

          <div className="flex flex-wrap gap-2 mt-2">
            {categoria.etiquetas?.length > 0 ? (
              categoria.etiquetas.map((etq, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {etq.nombre}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                {t("categories.detail.noTags")}
              </p>
            )}
          </div>
        </div>

        {/* ESPECIALIDADES */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Star className="h-5 w-5" />
            {t("categories.detail.specialties")}
          </h3>

          <div className="flex flex-wrap gap-2 mt-2">
            {categoria.especialidades?.length > 0 ? (
              categoria.especialidades.map((esp, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {esp.nombre}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                {t("categories.detail.noSpecialties")}
              </p>
            )}
          </div>
        </div>

        {/* SLA */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("categories.detail.sla")}
          </h3>

          {categoria.sla?.length > 0 ? (
            <div className="mt-2 space-y-1 text-gray-700">
              <p>
                <strong>{t("categories.detail.responseTime")}:</strong>{" "}
                {categoria.sla[0].tiempo_max_respuesta_min} min
              </p>
              <p>
                <strong>{t("categories.detail.resolutionTime")}:</strong>{" "}
                {categoria.sla[0].tiempo_max_resolucion_min} min
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              {t("categories.detail.noSla")}
            </p>
          )}
        </div>

        {/* BOTONES */}
        <div className="flex gap-4 mt-6">
          
          {/* VOLVER */}
          <button
            onClick={() => navigate("/categorias")}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-3 rounded-md shadow-lg hover:scale-105 transition"
          >
            <ArrowLeftCircle className="h-5 w-5" />
            {t("categories.detail.back")}
          </button>

          {/* EDITAR */}
          <button
            onClick={() => navigate(`/categoria/edit/${categoria.id}`)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md shadow-lg hover:scale-105 transition"
          >
            <Pencil className="h-5 w-5" />
            {t("categories.detail.edit")}
          </button>

        </div>
      </div>
    </div>
  );
}
