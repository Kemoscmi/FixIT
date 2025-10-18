import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import error from "../../assets/error.jpg"; // Puedes reemplazarla por una imagen de sistema o ilustración 404

export function PageNotFound() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto mt-24 mb-12 max-w-5xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        {/* Imagen */}
        <div className="md:col-span-5 flex justify-center">
          <img
            src={error}
            alt="Error 404 - No encontrado"
            className="rounded-lg w-full h-auto max-w-sm shadow-lg"
          />
        </div>

        {/* Texto */}
        <div className="md:col-span-7 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-foreground mb-4">
            Oops... Página no encontrada
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            El recurso que intentas acceder no existe o fue movido.  
            Si llegaste aquí desde un enlace interno, puede que el ticket o módulo haya sido eliminado.
          </p>

          {/* Botones de acción */}
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver atrás
            </Button>

            <Button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90"
            >
              <Home className="h-4 w-4" />
              Ir al inicio
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
