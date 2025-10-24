import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../auth/store/auth.store"; // Hook global de autenticación
import fixitLogo from "../../assets/Logo2.png";


export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleGoToPanel = () => {
    if (!user) return;
    if (user.rol === "Administrador") navigate("/admin/dashboard");
    else if (user.rol === "Tecnico") navigate("/tech/board");
    else navigate("/tickets");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-gray-50 text-gray-900 font-sans">
      {/* NAVBAR */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#servicios" className="hover:text-blue-700 transition">Servicios</a>
            <a href="#sla" className="hover:text-blue-700 transition">SLA</a>
            <a href="#equipo" className="hover:text-blue-700 transition">Equipo</a>
            <a href="#contacto" className="hover:text-blue-700 transition">Contacto</a>
          </nav>
          <div>
            {isAuthenticated ? (
              <button onClick={handleGoToPanel} className="btn-primary">
                Ir a mi panel
              </button>
            ) : (
              <Link to="/login" className="btn-primary">
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-900">
            Soporte técnico y gestión de incidentes{" "}
            <span className="text-blue-700 block">rápido, confiable y eficiente.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            <strong>FixIT</strong> ofrece soluciones integrales para resolver incidencias en{" "}
            <strong>software</strong>, <strong>hardware</strong>,{" "}
            <strong>redes</strong> y <strong>seguridad informática</strong>, con seguimiento y
            cumplimiento de <span className="font-semibold">acuerdos SLA</span>.
          </p>

          <div className="mt-8 flex gap-4">
            {isAuthenticated ? (
              <button onClick={handleGoToPanel} className="btn-primary">
                Ir a mi panel
              </button>
            ) : (
              <Link to="/login" className="btn-primary">
                Ingresar
              </Link>
            )}
            <a href="#servicios" className="btn-outline">
              Ver servicios
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-blue-200/30 blur-3xl rounded-full -z-10" />
          <div className="relative grid grid-cols-2 gap-4">
            {[
              ["Tickets", "Registro y seguimiento"],
              ["Asignación", "Automática / Manual"],
              ["SLA", "Cumplimiento garantizado"],
              ["Alertas", "Notificaciones inmediatas"],
              ["Reportes", "Estadísticas y métricas"],
              ["Panel", "Gestión avanzada"],
            ].map(([t, d]) => (
              <div
                key={t}
                className="bg-white/90 border border-gray-100 p-4 rounded-xl shadow hover:shadow-md transition"
              >
                <h4 className="font-semibold text-blue-700">{t}</h4>
                <p className="text-sm text-gray-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-900">Nuestros servicios</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Soluciones de TI con especialistas certificados y tiempos de respuesta garantizados.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            title="Soporte de Software"
            tags={["Instalación", "Actualización", "Errores", "Licencias"]}
            roles={["Ing. Software", "Soporte Apps", "Admin. Licencias"]}
            resp="≤ 2 h"
            reso="≤ 24 h"
          />
          <ServiceCard
            title="Soporte de Hardware"
            tags={["PCs", "Impresoras", "Periféricos", "Fallas físicas"]}
            roles={["Téc. Hardware", "Soporte Dispositivos"]}
            resp="≤ 3 h"
            reso="≤ 48 h"
          />
          <ServiceCard
            title="Redes y Conectividad"
            tags={["Internet", "VPN", "WiFi", "Cableado"]}
            roles={["Ing. Redes", "Soporte Conectividad"]}
            resp="≤ 1 h"
            reso="≤ 12 h"
          />
          <ServiceCard
            title="Seguridad Informática"
            tags={["Antivirus", "Firewall", "Phishing"]}
            roles={["Analista Seguridad", "Admin. Sistemas"]}
            resp="≤ 1 h"
            reso="≤ 8 h"
          />
        </div>
      </section>

      {/* SLA */}
      <section id="sla" className="max-w-7xl mx-auto px-6 lg:px-12 py-16 border-t border-gray-200">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-900">Compromisos de SLA</h2>
          <p className="text-gray-600">
            Garantizamos tiempos de respuesta y resolución según criticidad.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SlaCard title="Software" resp="≤ 2 h" reso="≤ 24 h" />
          <SlaCard title="Hardware" resp="≤ 3 h" reso="≤ 48 h" />
          <SlaCard title="Redes" resp="≤ 1 h" reso="≤ 12 h" />
          <SlaCard title="Seguridad" resp="≤ 1 h" reso="≤ 8 h" />
        </div>
      </section>

      {/* EQUIPO */}
      <section id="equipo" className="max-w-7xl mx-auto px-6 lg:px-12 py-16 border-t border-gray-200">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">Equipo y especialidades</h2>
        <p className="text-gray-600 max-w-3xl">
          Contamos con técnicos especializados por dominio, garantizando soluciones efectivas
          mediante reglas de carga, disponibilidad y prioridad.
        </p>
      </section>

      {/* CONTACTO */}
      <section
        id="contacto"
        className="max-w-6xl mx-auto px-6 lg:px-12 py-16 border-t border-gray-200"
      >
        <div className="bg-white/90 border border-gray-200 rounded-2xl shadow-xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">
              ¿Listo para reportar un incidente?
            </h3>
            <p className="text-gray-600">
              Ingresa con tu cuenta y crea tu primer ticket en minutos.
            </p>
          </div>
          {isAuthenticated ? (
            <button onClick={handleGoToPanel} className="btn-primary">
              Ir a mi panel
            </button>
          ) : (
            <Link to="/login" className="btn-primary">
              Iniciar sesión
            </Link>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-white/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-sm text-gray-500">
          <Logo small />
          <span>© {new Date().getFullYear()} FixIT — Gestión de incidentes TI.</span>
        </div>
      </footer>
    </div>
  );
}

/* -------------------- COMPONENTES AUXILIARES -------------------- */

function Logo({ small = false }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={fixitLogo}
        alt="FixIT Logo"
        className={`${small ? "h-6" : "h-10"} w-auto object-contain`}
      />
    </div>
  );
}

function ServiceCard({ title, tags, roles, resp, reso }) {
  return (
    <article className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      <h3 className="font-semibold text-lg text-blue-700">{title}</h3>
      <div className="mt-3 text-sm text-gray-600">
        <p className="font-medium">Etiquetas:</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {tags.map((t, i) => (
            <span key={i} className="chip">
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-600">
        <p className="font-medium">Especialidades:</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {roles.map((r, i) => (
            <span key={i} className="chip">
              {r}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-between text-sm font-medium text-gray-700">
        <span>Resp: {resp}</span>
        <span>Reso: {reso}</span>
      </div>
    </article>
  );
}

function SlaCard({ title, resp, reso }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center hover:shadow-md transition">
      <h4 className="text-lg font-semibold text-blue-700">{title}</h4>
      <p className="text-gray-600 text-sm mt-1">Respuesta: {resp}</p>
      <p className="text-gray-600 text-sm">Resolución: {reso}</p>
    </div>
  );
}
