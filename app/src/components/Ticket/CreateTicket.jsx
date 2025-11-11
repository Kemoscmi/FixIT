import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../../auth/store/auth.store";

//  Componentes UI (solo los necesarios)
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

//  Iconos
import { Save, ArrowLeft } from "lucide-react";

//  Servicios
import TicketService from "../../services/TicketService";
import axios from "axios";

export function CreateTicket() {
  const navigate = useNavigate();

  // Estados locales
  const [prioridades, setPrioridades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState("");

 const { user } = useAuthStore();
const usuario_id = user?.id || user?.id_usuario;
const rol_id = user?.rol_id;
  //  Validación Yup
  const schema = yup.object({
    titulo: yup
      .string()
      .required("El título es obligatorio")
      .min(3, "Debe tener al menos 3 caracteres"),
    descripcion: yup
      .string()
      .required("La descripción es obligatoria")
      .min(5, "Debe tener al menos 5 caracteres"),
    prioridad_id: yup
      .number()
      .typeError("Seleccione una prioridad")
      .required("Seleccione una prioridad"),
    categoria_id: yup
      .number()
      .typeError("Seleccione una categoría")
      .required("Seleccione una categoría"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      titulo: "",
      descripcion: "",
      prioridad_id: "",
      categoria_id: "",
    },
  });

  // 🔹 Cargar prioridades y categorías
useEffect(() => {
  const fetchData = async () => {
    try {
      const [pri, cat] = await Promise.all([
        axios.get(import.meta.env.VITE_BASE_URL + "prioridadcontroller"),
        axios.get(import.meta.env.VITE_BASE_URL + "categoria"),
      ]);

      const prioridadesData = Array.isArray(pri.data.data?.data)
        ? pri.data.data.data
        : pri.data.data || [];

      const categoriasData = Array.isArray(cat.data.data)
        ? cat.data.data
        : cat.data.data || [];

      setPrioridades(prioridadesData);
      setCategorias(categoriasData);
    } catch (err) {
      console.error(err);
      setError("Error al cargar listas desde la API");
    }
  };
  fetchData();
}, []);



  //  Enviar ticket
  const onSubmit = async (data) => {
    try {
      const res = await TicketService.createTicket(
        { ...data, usuario_solicitante_id: usuario_id },
        { rolId: rol_id, userId: usuario_id }
      );

      if (res.data.success) {
        toast.success("Ticket creado correctamente", {
          duration: 3000,
          position: "top-center",
        });
        reset();
        navigate("/tickets");
      } else {
        toast.error(res.data.message || "Error al crear ticket");
      }
    } catch (err) {
      console.error(err);
      toast.error(" Error en el servidor al crear ticket");
    }
  };

  if (error) return <p className="text-red-600 text-center">{error}</p>;

  //  Diseño tipo “Crear Película”
  return (
    <Card className="p-6 max-w-4xl mx-auto mt-10 border border-gray-200 shadow-md rounded-2xl bg-background">
      <h2 className="text-2xl font-bold mb-8 text-center">Crear Ticket</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* 🔹 GRID DE CAMPOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Título */}
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Controller
              name="titulo"
              control={control}
              render={({ field }) => (
                <Input {...field} id="titulo" placeholder="Ingrese el título" />
              )}
            />
            {errors.titulo && (
              <p className="text-red-500 text-sm mt-1">{errors.titulo.message}</p>
            )}
          </div>

          {/* Prioridad */}
          <div>
            <Label htmlFor="prioridad_id">Prioridad</Label>
            <Controller
              name="prioridad_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(val) => field.onChange(parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    {prioridades.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.prioridad_id && (
              <p className="text-red-500 text-sm mt-1">
                {errors.prioridad_id.message}
              </p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <Label htmlFor="categoria_id">Categoría</Label>
            <Controller
              name="categoria_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(val) => field.onChange(parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoria_id && (
              <p className="text-red-500 text-sm mt-1">
                {errors.categoria_id.message}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div className="sm:col-span-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Controller
              name="descripcion"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="descripcion"
                  placeholder="Describa el problema o solicitud..."
                  rows={5}
                  className="w-full border border-input rounded-md p-2 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                />
              )}
            />
            {errors.descripcion && (
              <p className="text-red-500 text-sm mt-1">
                {errors.descripcion.message}
              </p>
            )}
          </div>
        </div>

        {/* 🔹 BOTONES */}
        <div className="flex justify-between gap-4 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Regresar
          </Button>

          <Button type="submit" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Guardar Ticket
          </Button>
        </div>
      </form>
    </Card>
  );
}
