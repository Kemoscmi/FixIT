import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../../auth/store/auth.store";

// UI
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Save, ArrowLeftCircle } from "lucide-react";

// Servicios
import TicketService from "../../services/TicketService";
import axios from "axios";

export function CreateTicket() {
  const navigate = useNavigate();

  const [prioridades, setPrioridades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState("");

  // Datos del usuario
  const { user } = useAuthStore();
  const usuario_id = user?.id || user?.id_usuario;
  const rol_id = user?.rol_id;

  // Validación Yup
  const schema = yup.object({
    titulo: yup
      .string()
      .required("El título es obligatorio")
      .min(3, "Debe tener al menos 3 caracteres"),
    descripcion: yup
      .string()
      .required("La descripción es obligatoria")
      .min(5, "Debe tener al menos 5 caracteres"),
    prioridad_id: yup.number().required("Seleccione una prioridad"),
    categoria_id: yup.number().required("Seleccione una categoría"),
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

  // Cargar listas
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pri, cat] = await Promise.all([
          axios.get(import.meta.env.VITE_BASE_URL + "prioridadcontroller"),
          axios.get(import.meta.env.VITE_BASE_URL + "categoria"),
        ]);

        setPrioridades(pri.data.data?.data || []);
        setCategorias(cat.data.data || []);
      } catch (err) {
        console.error(err);
        setError("Error al cargar listas desde la API");
      }
    };
    fetchData();
  }, []);

  // Submit ticket
  const onSubmit = async (data) => {
    try {
      const res = await TicketService.createTicket(
        { ...data, usuario_solicitante_id: usuario_id },
        { rolId: rol_id, userId: usuario_id }
      );

      if (res.data.success) {
        toast.success("Ticket creado correctamente");
        reset();
        navigate("/tickets");
      } else {
        toast.error(res.data.message || "Error al crear ticket");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error en el servidor");
    }
  };

  if (error) return <p className="text-red-600 text-center">{error}</p>;

  // 
  return (
    <div className="min-h-screen py-10 px-6 bg-white">
      <div className="max-w-3xl mx-auto bg-white/80 border shadow-xl rounded-2xl p-8">

        <h2 className="text-3xl font-extrabold text-blue-800 mb-6 text-center">
          Crear Ticket
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* TÍTULO */}
          <div>
            <Label className="font-semibold">Título</Label>
            <Controller
              name="titulo"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Ingrese el título"
                  className="p-3 rounded-lg"
                />
              )}
            />
            {errors.titulo && (
              <p className="text-red-500 text-sm mt-1">{errors.titulo.message}</p>
            )}
          </div>

          {/* PRIORIDAD Y CATEGORÍA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <Label className="font-semibold">Prioridad</Label>
              <Controller
                name="prioridad_id"
                control={control}
                render={({ field }) => (
               <Select
  value={field.value ? String(field.value) : ""}
  onValueChange={(val) => field.onChange(parseInt(val))}
>
  <SelectTrigger className="bg-white border border-gray-300">
    <SelectValue placeholder="Seleccione prioridad" />
  </SelectTrigger>

  <SelectContent className="bg-white border border-gray-300 shadow-lg">
    {prioridades.map((p) => (
      <SelectItem
        key={p.id}
        value={String(p.id)}
        className="bg-white hover:bg-gray-100"
      >
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

            <div>
              <Label className="font-semibold">Categoría</Label>
              <Controller
                name="categoria_id"
                control={control}
                render={({ field }) => (
               <Select
  value={field.value ? String(field.value) : ""}
  onValueChange={(val) => field.onChange(parseInt(val))}
>
  <SelectTrigger className="bg-white border border-gray-300">
    <SelectValue placeholder="Seleccione categoría" />
  </SelectTrigger>

  <SelectContent className="bg-white border border-gray-300 shadow-lg">
    {categorias.map((c) => (
      <SelectItem
        key={c.id}
        value={String(c.id)}
        className="bg-white hover:bg-gray-100"
      >
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
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <Label className="font-semibold">Descripción</Label>
            <Controller
              name="descripcion"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={4}
                  className="p-3 w-full border rounded-lg"
                  placeholder="Describa el problema o solicitud..."
                />
              )}
            />
            {errors.descripcion && (
              <p className="text-red-500 text-sm mt-1">
                {errors.descripcion.message}
              </p>
            )}
          </div>

          {/* BOTONES */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => navigate("/tickets")}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              <ArrowLeftCircle className="h-5 w-5" />
              Volver
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-md bg-blue-700 text-white shadow hover:scale-105 transition"
            >
              <Save className="h-5 w-5" />
              Guardar Ticket
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
