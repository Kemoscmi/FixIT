import React from "react";
import {
  ClipboardList,
  Wrench,
  Users,
  BarChart,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { FaGithub, FaUniversity, FaTools, FaEnvelope, FaPhone } from "react-icons/fa";

export default function Principal() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-blue-50/30 to-gray-50 font-sans">
      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow p-8">
        {/* ENCABEZADO */}
        <header className="max-w-7xl mx-auto mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            Bienvenido a <span className="text-blue-700">FixIT</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Panel general de seguimiento y gestión de incidencias técnicas.
          </p>
        </header>

        {/* TARJETAS RESUMEN */}
        <section className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <SummaryCard
            icon={<ClipboardList className="w-6 h-6" />}
            title="Tickets activos"
            value="12"
            color="bg-blue-600"
          />
          <SummaryCard
            icon={<Wrench className="w-6 h-6" />}
            title="Tickets asignados"
            value="8"
            color="bg-green-600"
          />
          <SummaryCard
            icon={<Clock className="w-6 h-6" />}
            title="Pendientes de resolución"
            value="4"
            color="bg-yellow-500"
          />
          <SummaryCard
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Cerrados este mes"
            value="27"
            color="bg-gray-800"
          />
        </section>

        {/* SECCIÓN PRINCIPAL */}
        <section className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* COLUMNA IZQUIERDA */}
          <div className="lg:col-span-2 space-y-8">
            {/* ACCESOS RÁPIDOS */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Accesos rápidos
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <QuickAccessButton
                  icon={<ClipboardList />}
                  text="Ver tickets"
                  link="/tickets"
                />
                <QuickAccessButton
                  icon={<Wrench />}
                  text="Asignaciones"
                  link="/asignaciones"
                />
                <QuickAccessButton
                  icon={<Users />}
                  text="Técnicos"
                  link="/tecnicos"
                />
                <QuickAccessButton
                  icon={<BarChart />}
                  text="Reportes"
                  link="/reportes"
                />
                <QuickAccessButton icon={<ShieldCheck />} text="SLA" link="/sla" />
                <QuickAccessButton icon={<Clock />} text="Historial" link="/historial" />
              </div>
            </div>

            {/* INFORMACIÓN DEL SISTEMA */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Estado general del sistema
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Actualmente el sistema se encuentra{" "}
                <span className="font-semibold text-green-600">operativo</span> y
                procesando tickets con normalidad. Se han resuelto{" "}
                <strong>27 incidencias</strong> en las últimas 48 horas, con un
                promedio de cumplimiento SLA del{" "}
                <strong className="text-blue-700">93%</strong>.
              </p>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <aside className="space-y-8">
            {/* NOTIFICACIONES */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Notificaciones recientes
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  Ticket #125 "Error en servidor web" fue asignado a Juan Pérez.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  Ticket #119 fue cerrado exitosamente.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  Nueva actualización disponible del módulo de reportes.
                </li>
              </ul>
            </div>

            {/* ESTADÍSTICAS */}
            <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Resumen mensual</h3>
              <div className="space-y-3 text-sm">
                <p>📊 <strong>Tickets creados:</strong> 42</p>
                <p>⚙️ <strong>Tickets resueltos:</strong> 38</p>
                <p>⏱️ <strong>Promedio de resolución:</strong> 5.2 horas</p>
                <p>🧠 <strong>Satisfacción del usuario:</strong> 96%</p>
              </div>
            </div>
          </aside>
        </section>
      </main>

      {/* 🌐 FOOTER PROFESIONAL */}
      <footer className="bg-gradient-to-b from-blue-900 via-blue-950 to-[#0B0E1A] text-gray-300 pt-10 pb-6 mt-16 relative">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          {/* Sección izquierda */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <FaTools className="text-blue-400" /> FixIT
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sistema de seguimiento de incidencias técnicas desarrollado
              como parte del curso <span className="text-blue-400 font-medium">ISW-613</span> en la Universidad Técnica Nacional.
            </p>
          </div>

          {/* Sección enlaces */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">
              Enlaces útiles
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/tickets" className="hover:text-blue-400 transition-colors">
                  📋 Ver tickets
                </a>
              </li>
              <li>
                <a href="/reportes" className="hover:text-blue-400 transition-colors">
                  📊 Reportes
                </a>
              </li>
              <li>
                <a href="/sla" className="hover:text-blue-400 transition-colors">
                  🛡️ SLA
                </a>
              </li>
              <li>
                <a href="/contacto" className="hover:text-blue-400 transition-colors">
                  ✉️ Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Sección contacto */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">
              Contáctanos
            </h4>
            <p className="text-sm flex items-center gap-2 mb-2">
              <FaUniversity className="text-blue-400" /> Universidad Técnica Nacional
            </p>
            <p className="text-sm flex items-center gap-2 mb-2">
              <FaEnvelope className="text-blue-400" /> soporte@fixit-utn.com
            </p>
            <p className="text-sm flex items-center gap-2">
              <FaPhone className="text-blue-400" /> +506 2450 0000
            </p>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="w-full h-[1px] bg-gray-700 mt-10 mb-4"></div>

        {/* Créditos finales */}
        <div className="text-center text-xs text-gray-500">
          © {new Date().getFullYear()} FixIT — Todos los derechos reservados · UTN Costa Rica
          <div className="flex justify-center gap-4 mt-2">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              <FaGithub />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* 🔹 COMPONENTES AUXILIARES */
function SummaryCard({ icon, title, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 flex items-center gap-4 hover:shadow-lg transition-all">
      <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      <div>
        <h4 className="text-sm text-gray-600">{title}</h4>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function QuickAccessButton({ icon, text, link }) {
  return (
    <a
      href={link}
      className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 hover:shadow-md transition-all"
    >
      <div className="text-blue-700">{icon}</div>
      <span className="text-sm font-medium text-gray-700">{text}</span>
    </a>
  );
}
