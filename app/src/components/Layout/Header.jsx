"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Layers,
  Wrench,
  ClipboardList,
  Ticket,
  Users,
  Menu,
  X,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  User,
  Home,
  Users2,
} from "lucide-react";

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "@/components/ui/menubar";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import useAuth from "../../auth/store/auth.store"; //   store global de autenticación
import Logo from "../../assets/Logo.png";


export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { title: "Inicio", href: "Principal", icon: <Home className="h-4 w-4" /> },
    { title: "Mis Tickets", href: "/tickets", icon: <Ticket className="h-4 w-4" /> },
    { title: "Asignaciones", href: "/asignaciones", icon: <ClipboardList className="h-4 w-4" /> },
  ];

  const mantItems = [
    { title: "Tickets", href: "/tickets/table", icon: <Wrench className="h-4 w-4" /> },
    { title: "Usuarios", href: "/usuarios", icon: <Users className="h-4 w-4" /> },
    { title: "Categorías", href: "/categorias", icon: <Layers className="h-4 w-4" /> },
    { title: "Técnicos", href: "/tecnicos", icon: <Users2 className="h-4 w-4" /> },
  ];

  const guestItems = [
    { title: "Iniciar Sesión", href: "/login", icon: <LogIn className="h-4 w-4" /> },
    { title: "Registrarse", href: "/user/create", icon: <UserPlus className="h-4 w-4" /> },
  ];

  const userName = user?.nombre || user?.correo || "Invitado";

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 backdrop-blur-md border-b border-white/10 shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between px-6 py-3 max-w-[1280px] mx-auto text-white">
      {/* -------- LOGO -------- */}
<Link
  to="/"
  className="flex items-center gap-3 hover:opacity-90 transition"
>
  <img
    src={Logo}
    alt="FixIT Logo"
    className="h-10 w-auto drop-shadow-sm"
  />
</Link>

        {/* -------- NAV ESCRITORIO -------- */}
        <div className="hidden md:flex flex-1 justify-center">
      <Menubar className="w-auto bg-transparent border-none shadow-none space-x-8">
  {/* --- Ítems principales --- */}
  {navItems.map((item) => (
    <MenubarMenu key={item.href}>
      <MenubarTrigger asChild>
        <Link
          to={item.href}
          className="flex items-center gap-2 text-white font-medium hover:text-yellow-300 transition"
        >
          {item.icon} {item.title}
        </Link>
      </MenubarTrigger>
    </MenubarMenu>
  ))}

  {/* --- Administración --- */}
  <DropdownMenu
    title="Administración"
    icon={<Wrench className="h-4 w-4" />}
    items={mantItems}
  />

            {/* --- Usuario --- */}
            <MenubarMenu>
              <MenubarTrigger className="text-white font-medium flex items-center gap-1 hover:text-yellow-300 transition">
                <User className="h-4 w-4" /> {userName}
                <ChevronDown className="h-3 w-3" />
              </MenubarTrigger>
              <MenubarContent className="bg-gradient-to-b from-blue-800 to-blue-950/90 backdrop-blur-md border border-white/10 rounded-md shadow-xl">
                {isAuthenticated ? (
                  <>
                    <MenubarItem asChild>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 py-2 px-4 text-sm text-white hover:bg-white/10 transition"
                      >
                        <LogOut className="h-4 w-4" /> Cerrar Sesión
                      </button>
                    </MenubarItem>
                  </>
                ) : (
                  guestItems.map((item) => (
                    <MenubarItem key={item.href} asChild>
                      <Link
                        to={item.href}
                        className="flex items-center gap-2 py-2 px-4 text-sm text-white hover:bg-white/10 transition"
                      >
                        {item.icon} {item.title}
                      </Link>
                    </MenubarItem>
                  ))
                )}
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>

        {/* -------- NAV MÓVIL -------- */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden inline-flex items-center justify-center p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="bg-gradient-to-b from-blue-900 via-blue-950 to-black/90 text-white backdrop-blur-lg w-72 p-6 border-r border-white/10"
          >
            <nav className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Ticket className="text-yellow-300" />
                <span>FixIT</span>
              </div>
{navItems.map((item) => (
  <button
    key={item.href}
    onClick={() => {
      navigate(item.href);
      setMobileOpen(false);
    }}
    className="w-full text-left flex items-center gap-2 py-2 px-3 rounded-md text-white/90 hover:bg-blue-800/40 hover:text-yellow-300 transition"
  >
    {item.icon} {item.title}
  </button>
))}
<NavSection title="Administración" items={mantItems} setMobileOpen={setMobileOpen} />
              <NavSection
                title={userName}
                items={
                  isAuthenticated
                    ? [
                        {
                          title: "Cerrar Sesión",
                          href: "#",
                          icon: <LogOut className="h-4 w-4" />,
                          action: handleLogout,
                        },
                      ]
                    : guestItems
                }
                setMobileOpen={setMobileOpen}
              />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

/* --- Dropdown reutilizable --- */
function DropdownMenu({ title, icon, items }) {
  return (
    <MenubarMenu>
      <MenubarTrigger className="flex items-center gap-2 text-white font-medium hover:text-yellow-300 transition">
        {icon} {title}
        <ChevronDown className="h-3 w-3 opacity-80" />
      </MenubarTrigger>

      <MenubarContent className="bg-gradient-to-b from-blue-800 via-blue-900 to-blue-950/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl min-w-[180px] overflow-hidden">
        {items.map((item) => (
          <MenubarItem key={item.href} asChild>
            <Link
              to={item.href}
              className="flex items-center gap-2 py-2.5 px-4 text-sm text-white/90 hover:text-white hover:bg-blue-700/30 transition-all"
            >
              {item.icon} {item.title}
            </Link>
          </MenubarItem>
        ))}
      </MenubarContent>
    </MenubarMenu>
  );
}

/* --- Sección del menú móvil --- */
function NavSection({ title, items, setMobileOpen }) {
  return (
    <div>
      <h4 className="mb-2 text-lg font-semibold flex items-center gap-2 text-yellow-300 border-b border-white/10 pb-1">
        {title}
      </h4>
      {items.map((item) => (
        <button
          key={item.href}
          onClick={() => {
            if (item.action) item.action();
            setMobileOpen(false);
          }}
          className="w-full text-left flex items-center gap-2 py-2 px-3 rounded-md text-white/90 hover:bg-blue-800/40 hover:text-yellow-300 transition"
        >
          {item.icon} {item.title}
        </button>
      ))}
    </div>
  );
}