import path from "path"; 
import { defineConfig } from "vite"; 
import react from "@vitejs/plugin-react-swc"; 
import tailwindcss from "@tailwindcss/vite"; 
import jsconfigPaths from "vite-jsconfig-paths" 

// https://vite.dev/config/ 
export default defineConfig({ 
  plugins: [react(), tailwindcss(), jsconfigPaths()], 
resolve: { 
    alias: { 
      // eslint-disable-next-line no-undef
      "@": path.resolve(__dirname, "./src"), 
    }, 
  }, 
});