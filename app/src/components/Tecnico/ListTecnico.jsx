import React, { useEffect, useState } from "react";
import TecnicoService from "@/services/TecnicoService";
import { TecnicosListCard } from "./TecnicosListCard";
import { Loader2, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";

export function ListTecnico() {
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useI18n();

  useEffect(() => {
    TecnicoService.getTecnicos()
      .then((response) => {
        setTecnicos(response.data);
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
      {/* 🔵 TÍTULO CENTRADO + BOTÓN */}
      <div className="max-w-6xl mx-auto grid grid-cols-3 items-center mb-6">
        <div></div>

        <h2 className="text-4xl font-extrabold text-center bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
          {t("technicians.titleList")}
        </h2>

        <div className="flex justify-end">
          <Link
            to="/tecnico/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg shadow hover:scale-105 transition"
          >
            <PlusCircle className="h-5 w-5" />
            {t("technicians.buttonNew")}
          </Link>
        </div>
      </div>

      <p className="text-gray-600 max-w-xl mx-auto text-center mb-10">
        {t("technicians.subtitle")}
      </p>

      {/* GRID de técnicos */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {tecnicos?.length > 0 ? (
          tecnicos.map((tecnico) => (
            <TecnicosListCard key={tecnico.id} tecnico={tecnico} />
          ))
        ) : (
          <p className="text-center col-span-full text-gray-600">
            {t("technicians.noTechnicians")}
          </p>
        )}
      </div>
    </div>
  );
}
