import React from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-foreground">
      <Header />
      <main className="flex-1 pt-14 pb-0 bg-white">
        <Outlet />
      </main>
    </div>
  );
}