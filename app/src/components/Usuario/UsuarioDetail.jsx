// src/components/Usuario/DetailUsuario.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Shield, ArrowLeftCircle } from "lucide-react";
import UsuarioService from "@/services/UsuarioService";
import { useI18n } from "@/hooks/useI18n";

export function DetailUsuario() {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    UsuarioService.getUsuarioById(id)
      .then((response) => {
        setUsuario(response.data);
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
                {usuario.nombre} {usuario.apellido}
              </h2>
              <p className="text-lg text-blue-100 italic drop-shadow-sm">
                {usuario.observaciones}
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
              <strong>{t("users.detail.email")}:</strong> {usuario.correo}
            </p>

            <p>
              <Phone className="inline mr-2 text-blue-600" />
              <strong>{t("users.detail.phone")}:</strong> {usuario.telefono}
            </p>

            <p>
              <Shield className="inline mr-2 text-blue-600" />
              <strong>{t("users.detail.role")}:</strong> {usuario.rol}
            </p>

            <p>
              <strong>{t("users.detail.status")}:</strong>{" "}
              <span
                className={`font-semibold ${
                  usuario.activo === 1
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {usuario.activo === 1
                  ? t("users.fields.active")
                  : t("users.fields.inactive")}
              </span>
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => navigate("/usuarios")}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-700 to-blue-900 text-white px-6 py-3 rounded-md shadow-lg hover:scale-105 transition-all"
            >
              <ArrowLeftCircle className="h-5 w-5" />
              {t("users.detail.back")}
            </button>

            <button
              onClick={() => navigate(`/usuario/edit/${usuario.id}`)}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-md shadow-lg hover:scale-105 transition-all"
            >
              {t("users.detail.edit")}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
