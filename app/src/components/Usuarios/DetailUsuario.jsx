import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Mail, Phone, ArrowLeftCircle } from "lucide-react";
import UsuarioService from "../../services/UsuariosService";

export function DetailUsuario() {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    return <p className="text-center p-10 text-blue-600">Cargando...</p>;

  if (error)
    return <p className="text-center text-red-500 text-lg mt-10">Error: {error}</p>;

  const redirectToForm = () => {
    if (usuario.rol === "Tecnico") {
      navigate(`/tecnico/edit/${id}`);
    } else {
      navigate(`/usuario/edit/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border border-blue-100">
        <div className="relative h-40 bg-gradient-to-r from-blue-700 to-blue-900">
          <div className="absolute bottom-0 left-8 translate-y-[20%] flex items-center gap-4">
            <div className="w-28 h-28 bg-white border-4 border-blue-800 rounded-full flex items-center justify-center shadow-lg">
              <User className="h-12 w-12 text-blue-700" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-3xl font-bold text-white">{usuario.nombre} {usuario.apellido}</h2>
              <p className="text-lg text-blue-100">{usuario.rol}</p>
            </div>
          </div>
        </div>
        <div className="p-8 mt-5 space-y-6">
          <p>
            <Mail className="inline mr-2" />
            <strong>Email: </strong>{usuario.correo}
          </p>
          <p>
            <Phone className="inline mr-2" />
            <strong>Teléfono: </strong>{usuario.telefono}
          </p>
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => navigate("/usuarios")}
              className="flex items-center gap-2 bg-gray-200 px-6 py-3 rounded-md"
            >
              <ArrowLeftCircle className="h-5 w-5" />
              Volver
            </button>
            <button
              onClick={redirectToForm}
              className="flex items-center gap-2 bg-blue-700 px-6 py-3 rounded-md text-white"
            >
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}