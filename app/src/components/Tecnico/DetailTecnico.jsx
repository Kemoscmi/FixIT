import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Wrench, ArrowLeftCircle } from "lucide-react";
import TecnicoService from "@/services/TecnicoService";
import { useI18n } from "@/hooks/useI18n";

export function DetailTecnico() {
  const { id } = useParams();
  const [tecnico, setTecnico] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    TecnicoService.getTecnicoById(id)
      .then((response) => {
        setTecnico(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <p className="text-center text-blue-700 text-lg mt-10">
        {t("common.loading")}
      </p>
    );

  if (error)
    return (
      <p className="text-center text-red-500 text-lg mt-10">
        {t("alerts.error")}: {error}
      </p>
    );

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border border-blue-100">
        
        {/* Encabezado */}
        <div className="relative h-40 bg-gradient-to-r from-blue-700 to-blue-900">
          <div className="absolute bottom-0 left-8 translate-y-[20%] flex items-center gap-4">
            <div className="w-28 h-28 bg-white border-4 border-blue-800 rounded-full flex items-center justify-center shadow-lg">
              <User className="h-12 w-12 text-blue-700" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-3xl font-bold text-white drop-shadow">
                {tecnico.nombre} {tecnico.apellido}
              </h2>
              <p className="text-lg text-blue-100 italic drop-shadow-sm">
                {tecnico.observaciones}
              </p>
            </div>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-8 mt-5 space-y-6">

          {/* Info básica */}
          <div className="grid md:grid-cols-2 gap-6 text-gray-700">
            <p>
              <Mail className="inline mr-2 text-blue-600" />
              <strong>{t("technicians.detail.email")}:</strong> {tecnico.correo}
            </p>

            <p>
              <Phone className="inline mr-2 text-blue-600" />
              <strong>{t("technicians.detail.phone")}:</strong> {tecnico.telefono}
            </p>

            <p>
              <Wrench className="inline mr-2 text-blue-600" />
              <strong>{t("technicians.detail.workload")}:</strong>{" "}
              {tecnico.carga_trabajo || t("technicians.detail.noWorkload")}
            </p>

            <p>
              <strong>{t("technicians.detail.availability")}:</strong>{" "}
              <span
                className={`font-semibold ${
                  tecnico.disponibilidad === "Disponible"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {tecnico.disponibilidad === "Disponible"
                  ? t("technicians.fields.available")
                  : t("technicians.fields.busy")}
              </span>
            </p>
          </div>

          {/* Especialidades */}
          <div className="bg-blue-50 rounded-lg p-5 shadow-inner">
            <h3 className="text-xl font-semibold text-blue-700 mb-3">
              {t("technicians.detail.specialties")}
            </h3>

            <ul className="list-disc pl-6 text-gray-700">
              {tecnico.especialidades?.map((esp, i) => (
                <li key={i}>{esp.nombre}</li>
              ))}
            </ul>
          </div>

          {/* Botones */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => navigate("/tecnicos")}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-700 to-blue-900 text-white px-6 py-3 rounded-md shadow-lg hover:scale-105 transition-all"
            >
              <ArrowLeftCircle className="h-5 w-5" />
              {t("technicians.detail.back")}
            </button>

            <button
              onClick={() => navigate(`/tecnico/edit/${tecnico.id}`)}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-md shadow-lg hover:scale-105 transition-all"
            >
              {t("technicians.detail.edit")}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
