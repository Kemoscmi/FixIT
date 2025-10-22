"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
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

const userData = { email: "demo@utn.ac.cr" };

const navItems = [
  { title: "Inicio", href: "/", icon: <Home className="h-4 w-4" /> },
  { title: "Mis Tickets", href: "/tickets", icon: <Ticket className="h-4 w-4" /> },
  { title: "Asignaciones", href: "/asignaciones", icon: <ClipboardList className="h-4 w-4" /> },
];

const mantItems = [
  { title: "Tickets", href: "/tickets/table", icon: <Wrench className="h-4 w-4" /> },
  { title: "Usuarios", href: "/usuarios", icon: <Users className="h-4 w-4" /> },
  { title: "Categorías", href: "/categorias", icon: <Layers className="h-4 w-4" /> },
  { title: "Técnicos", href: "/tecnicos", icon: <Users2 className="h-4 w-4" /> },
];

const userItems = [
  { title: "Iniciar Sesión", href: "/user/login", icon: <LogIn className="h-4 w-4" /> },
  { title: "Registrarse", href: "/user/create", icon: <UserPlus className="h-4 w-4" /> },
  { title: "Cerrar Sesión", href: "/user/logout", icon: <LogOut className="h-4 w-4" /> },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-gradient-to-r from-[#1a56db] to-[#2563eb] backdrop-blur-md border-b border-white/10 shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between px-6 py-3 max-w-[1280px] mx-auto text-white">
        {/* -------- Logo / Nombre -------- */}
        <Link
          to="/"
          className="flex items-center gap-2 text-lg md:text-xl font-semibold tracking-wide hover:opacity-90 transition"
        >
          <Ticket className="h-6 w-6" />
          <span className="hidden sm:inline">FixIT</span>
        </Link>

        {/* -------- Menú escritorio -------- */}
        <div className="hidden md:flex flex-1 justify-center">
          <Menubar className="w-auto bg-transparent border-none shadow-none space-x-8">
            {/* Navegación */}
            <MenubarMenu>
              <MenubarTrigger className="text-white font-medium flex items-center gap-1 hover:text-yellow-300 transition">
                <ClipboardList className="h-4 w-4" /> Navegación
                <ChevronDown className="h-3 w-3" />
              </MenubarTrigger>
              <MenubarContent className="bg-blue-800/90 backdrop-blur-md border border-white/10 rounded-md shadow-xl">
                {navItems.map((item) => (
                  <MenubarItem key={item.href} asChild>
                    <Link
                      to={item.href}
                      className="flex items-center gap-2 py-2 px-4 rounded-md text-sm text-white hover:bg-white/10 transition"
                    >
                      {item.icon} {item.title}
                    </Link>
                  </MenubarItem>
                ))}
              </MenubarContent>
            </MenubarMenu>

            {/* Administración */}
            <MenubarMenu>
              <MenubarTrigger className="text-white font-medium flex items-center gap-1 hover:text-yellow-300 transition">
                <Wrench className="h-4 w-4" /> Administración
                <ChevronDown className="h-3 w-3" />
              </MenubarTrigger>
              <MenubarContent className="bg-blue-800/90 backdrop-blur-md border border-white/10 rounded-md shadow-xl">
                {mantItems.map((item) => (
                  <MenubarItem key={item.href} asChild>
                    <Link
                      to={item.href}
                      className="flex items-center gap-2 py-2 px-4 rounded-md text-sm text-white hover:bg-white/10 transition"
                    >
                      {item.icon} {item.title}
                    </Link>
                  </MenubarItem>
                ))}
              </MenubarContent>
            </MenubarMenu>

            {/* Usuario */}
            <MenubarMenu>
              <MenubarTrigger className="text-white font-medium flex items-center gap-1 hover:text-yellow-300 transition">
                <User className="h-4 w-4" /> {userData.email}
                <ChevronDown className="h-3 w-3" />
              </MenubarTrigger>
              <MenubarContent className="bg-blue-800/90 backdrop-blur-md border border-white/10 rounded-md shadow-xl">
                {userItems.map((item) => (
                  <MenubarItem key={item.href} asChild>
                    <Link
                      to={item.href}
                      className="flex items-center gap-2 py-2 px-4 rounded-md text-sm text-white hover:bg-white/10 transition"
                    >
                      {item.icon} {item.title}
                    </Link>
                  </MenubarItem>
                ))}
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>

        {/* -------- Menú móvil -------- */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden inline-flex items-center justify-center p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="bg-blue-900/95 text-white backdrop-blur-lg w-72 p-6 animate-slideIn"
          >
            <nav className="space-y-6">
              <div>
                <Link to="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <Ticket /> FixIT
                </Link>
              </div>

              <NavSection title="Navegación" items={navItems} setMobileOpen={setMobileOpen} />
              <NavSection title="Administración" items={mantItems} setMobileOpen={setMobileOpen} />
              <NavSection title={userData.email} items={userItems} setMobileOpen={setMobileOpen} />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

/* --- Subcomponente para secciones del menú móvil --- */
function NavSection({ title, items, setMobileOpen }) {
  return (
    <div>
      <h4 className="mb-2 text-lg font-semibold flex items-center gap-2">{title}</h4>
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 py-2 px-3 rounded-md text-white/90 hover:bg-white/10 transition"
        >
          {item.icon} {item.title}
        </Link>
      ))}
    </div>
  );
}