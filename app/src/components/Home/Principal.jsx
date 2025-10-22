import React from "react";
import {
  Wrench,
  Bell,
  ClipboardList,
  BarChart,
  Users,
  ShieldCheck,
} from "lucide-react";

export default function Principal() {
  return (
    <div className="bg-gradient-to-b from-white via-blue-50/30 to-gray-50 min-h-screen font-sans">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-24 grid md:grid-cols-2 gap-16 items-center">
        {/* Texto principal */}
        <div className="space-y-7">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Soporte técnico y gestión de incidentes{" "}
            <span className="block text-blue-700">ágil, confiable y eficiente.</span>
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed">
            <span className="font-bold text-blue-700">FixIT</span> ofrece soluciones de TI para
            resolver incidentes de <strong>software</strong>, <strong>hardware</strong>,{" "}
            <strong>redes y seguridad informática</strong>. Permite registrar, asignar y
            dar seguimiento a tickets en cumplimiento con acuerdos de SLA.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="/user/login"
              className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 hover:shadow-lg transition-all"
            >
              Ingresar
            </a>
            <a
              href="/tickets"
              className="px-8 py-3 border-2 border-blue-700 text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-all"
            >
              Ver servicios
            </a>
          </div>
        </div>

        {/* Tarjetas de funcionalidades */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard icon={<ClipboardList />} title="Tickets" desc="Registro y seguimiento" />
          <FeatureCard icon={<Wrench />} title="Asignación" desc="Automática / Manual" />
          <FeatureCard icon={<ShieldCheck />} title="SLA" desc="Cumplimiento de tiempos" />
          <FeatureCard icon={<Bell />} title="Notificaciones" desc="Eventos y alertas" />
          <FeatureCard icon={<BarChart />} title="Reportes" desc="Métricas del servicio" />
          <FeatureCard icon={<Users />} title="Panel Admin" desc="Gestión y control" />
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 border-t border-gray-200">
        <div className="max-w-3xl space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Nuestros servicios
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Atendemos necesidades críticas de TI con especialistas certificados y
            tiempos definidos por SLA. Nuestro sistema garantiza trazabilidad,
            asignación inteligente y comunicación clara entre equipos técnicos y usuarios.
          </p>
        </div>
      </section>

      {/* EQUIPO */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 border-t border-gray-200">
        <div className="max-w-3xl space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Equipo y especialidades
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Contamos con técnicos especializados por dominio, garantizando
            soluciones eficientes. La asignación se realiza mediante reglas
            automáticas, carga y disponibilidad, o de forma manual según la
            prioridad del incidente.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-6xl mx-auto my-20 px-6 lg:px-12 py-10 bg-white border border-gray-200 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-1">
            ¿Listo para reportar un incidente?
          </h3>
          <p className="text-gray-600">
            Ingresa con tu cuenta y crea tu primer ticket en minutos.
          </p>
        </div>
        <a
          href="/user/login"
          className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 shadow-md hover:shadow-lg transition-all"
        >
          Iniciar sesión
        </a>
      </section>

    </div>
  );
}

// Tarjeta individual reutilizable
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-start gap-3">
      <div className="p-2 bg-blue-100 text-blue-700 rounded-md">{icon}</div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}