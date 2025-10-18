import React from "react";

export function Footer() {
  return (
    <footer className="fixed bottom-0 w-full bg-primary/90 text-white flex items-center justify-center px-4 py-3 shadow-lg backdrop-blur-md">
      <div className="w-full max-w-7xl text-center space-y-1">
        <p className="text-sm font-semibold tracking-wide">
          Sistema de Seguimiento de Incidentes – ISW-613
        </p>
        <p className="text-xs text-white/70">
          © {new Date().getFullYear()} Universidad Técnica Nacional | FixIT
        </p>
      </div>
    </footer>
  );
}