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

// ⭐ IMPORTA TU HOOK DE TRADUCCIÓN
import { useI18n } from "@/hooks/useI18n";

export default function Principal() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-blue-50/30 to-gray-50 font-sans">

      {/* MAIN CONTENT */}
      <main className="flex-grow p-8">

        {/* HEADER */}
        <header className="max-w-7xl mx-auto mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            {t("principal.welcome")} <span className="text-blue-700">FixIT</span>
          </h1>
          <p className="text-gray-600 mt-2">
            {t("principal.subtitle")}
          </p>
        </header>

        {/* SUMMARY CARDS */}
        <section className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <SummaryCard
            icon={<ClipboardList className="w-6 h-6" />}
            title={t("principal.summary.active")}
            value="12"
            color="bg-blue-600"
          />
          <SummaryCard
            icon={<Wrench className="w-6 h-6" />}
            title={t("principal.summary.assigned")}
            value="8"
            color="bg-green-600"
          />
          <SummaryCard
            icon={<Clock className="w-6 h-6" />}
            title={t("principal.summary.pending")}
            value="4"
            color="bg-yellow-500"
          />
          <SummaryCard
            icon={<ShieldCheck className="w-6 h-6" />}
            title={t("principal.summary.closed")}
            value="27"
            color="bg-gray-800"
          />
        </section>

        {/* MAIN SECTION */}
        <section className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">

            {/* QUICK ACCESS */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t("principal.quickAccess.title")}
              </h2>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <QuickAccessButton icon={<ClipboardList />} text={t("principal.quickAccess.tickets")} link="/tickets" />
                <QuickAccessButton icon={<Wrench />} text={t("principal.quickAccess.assignments")} link="/asignaciones" />
                <QuickAccessButton icon={<Users />} text={t("principal.quickAccess.technicians")} link="/tecnicos" />
                <QuickAccessButton icon={<BarChart />} text={t("principal.quickAccess.reports")} link="/reportes" />
                <QuickAccessButton icon={<ShieldCheck />} text={t("principal.quickAccess.sla")} link="/sla" />
                <QuickAccessButton icon={<Clock />} text={t("principal.quickAccess.history")} link="/historial" />
              </div>
            </div>

            {/* SYSTEM STATUS */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t("principal.systemStatus.title")}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {t("principal.systemStatus.operational")}{" "}
                <span className="font-semibold text-green-600">
                  {t("principal.systemStatus.operationalStatus")}
                </span>{" "}
                {t("principal.systemStatus.resolved", { count: 27 })},{" "}
                {t("principal.systemStatus.sla", { percent: 93 })}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <aside className="space-y-8">

            {/* NOTIFICATIONS */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t("principal.notifications.title")}
              </h3>

              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  {t("principal.notifications.n1")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  {t("principal.notifications.n2")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  {t("principal.notifications.n3")}
                </li>
              </ul>
            </div>

            {/* MONTHLY SUMMARY */}
            <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t("principal.monthly.title")}
              </h3>

              <div className="space-y-3 text-sm">
                <p>📊 <strong>{t("principal.monthly.created")}:</strong> 42</p>
                <p>⚙️ <strong>{t("principal.monthly.resolved")}:</strong> 38</p>
                <p>⏱️ <strong>{t("principal.monthly.avgTime")}:</strong> 5.2 h</p>
                <p>🧠 <strong>{t("principal.monthly.satisfaction")}:</strong> 96%</p>
              </div>
            </div>
          </aside>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gradient-to-b from-blue-900 via-blue-950 to-[#0B0E1A] text-gray-300 pt-10 pb-6 mt-16 relative">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">

          {/* LEFT */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <FaTools className="text-blue-400" /> FixIT
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t("principal.footer.developed")}
            </p>
          </div>

          {/* LINKS */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">
              {t("principal.footer.usefulLinks")}
            </h4>

            <ul className="space-y-2 text-sm">
              <li><a href="/tickets" className="hover:text-blue-400">📋 {t("principal.footer.viewTickets")}</a></li>
              <li><a href="/reportes" className="hover:text-blue-400">📊 {t("principal.footer.reports")}</a></li>
              <li><a href="/sla" className="hover:text-blue-400">🛡️ {t("principal.footer.sla")}</a></li>
              <li><a href="/contacto" className="hover:text-blue-400">✉️ {t("principal.footer.contact")}</a></li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">
              {t("principal.footer.contactUs")}
            </h4>

            <p className="text-sm flex items-center gap-2 mb-2">
              <FaUniversity className="text-blue-400" /> {t("principal.footer.university")}
            </p>
            <p className="text-sm flex items-center gap-2 mb-2">
              <FaEnvelope className="text-blue-400" /> {t("principal.footer.email")}
            </p>
            <p className="text-sm flex items-center gap-2">
              <FaPhone className="text-blue-400" /> {t("principal.footer.phone")}
            </p>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="w-full h-[1px] bg-gray-700 mt-10 mb-4"></div>

        {/* CREDITS */}
        <div className="text-center text-xs text-gray-500">
          © {new Date().getFullYear()} FixIT — {t("principal.footer.rights")} · UTN Costa Rica
          <div className="flex justify-center gap-4 mt-2">
            <a href="https://github.com/" target="_blank" className="hover:text-blue-400">
              <FaGithub />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* --------------------------------
   COMPONENTES SECUNDARIOS
-------------------------------- */

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
