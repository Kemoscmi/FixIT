import React from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // ✅ Importación necesaria

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-foreground">
      <Header />

      {/* Contenido principal */}
      <main className="flex-1 pt-14 pb-0 bg-white">
        <Outlet />
      </main>

      {/* ✅ Toaster global: muestra notificaciones en toda la app */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
            borderRadius: "10px",
            padding: "10px 16px",
            fontSize: "15px",
          },
          success: {
            iconTheme: {
              primary: "#4ade80", // verde
              secondary: "#333",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444", // rojo
              secondary: "#333",
            },
          },
        }}
      />
    </div>
  );
}
