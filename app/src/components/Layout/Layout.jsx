import React from "react";
import Header from "./Header";
import { Footer } from "./Footer";
import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 pt-16 pb-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}