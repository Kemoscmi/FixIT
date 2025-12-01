import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../../auth/store/auth.store";

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

import TicketService from "../../services/TicketService";
import EtiquetaService from "@/services/EtiquetaService";
import axios from "axios";

// ⭐ i18n
import { useI18n } from "@/hooks/useI18n";

export function CreateTicket() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const [prioridades, setPrioridades] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [, setError] = useState("");

  const { user } = useAuthStore();
  const usuario_id = user?.id || user?.id_usuario;
  const rol_id = user?.rol_id;

  const schema = yup.object({
    titulo: yup
      .string()
      .required(t("validations.required"))
      .min(3, t("validations.minCharacters", { min: 3 })),
    descripcion: yup
      .string()
      .required(t("validations.required"))
      .min(5, t("validations.minCharacters", { min: 5 })),
    prioridad_id: yup
      .number()
      .typeError(t("validations.required"))
      .required(t("validations.required")),
    categoria_id: yup
      .number()
      .typeError(t("validations.required"))
      .required(t("validations.required")),
  });


  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    register,
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

  // CARGA INICIAL
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pri, etq] = await Promise.all([
          axios.get(import.meta.env.VITE_BASE_URL + "prioridadcontroller"),
          EtiquetaService.getEtiquetasFixit(),
        ]);

        setPrioridades(pri.data.data?.data || []);
        setEtiquetas(etq || []);
      } catch (err) {
        console.error(err);
        setError(t("tickets.create.errorLoading"));
      }
    };
    fetchData();
  }, [t]);

  // CARGAR CATEGORIA
  const cargarCategoria = async (idEtiqueta) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}EtiquetaController/categoria?id=${idEtiqueta}`
      );

      let categoriaID = null;

      const buscarID = (obj) => {
        if (categoriaID) return;
        if (typeof obj !== "object" || obj === null) return;

        for (const key of Object.keys(obj)) {
          const val = obj[key];

          if (key.toLowerCase().includes("categoria") && !isNaN(val)) {
            categoriaID = parseInt(val, 10);
            return;
          }

          if (typeof val === "object") buscarID(val);
        }
      };

      buscarID(res.data);

      if (!categoriaID || isNaN(categoriaID)) {
        return;
      }

      const nombre =
        res.data.data?.data?.nombre ||
        res.data?.nombre ||
        res.data?.categoria?.nombre ||
        t("tickets.create.noName");

      const nuevaCategoria = { id: categoriaID, nombre };

      setCategoriaSeleccionada(nuevaCategoria);
      setValue("categoria_id", categoriaID);
    } catch (error) {
      console.error(error);
      toast.error(t("tickets.create.categoryError"));
    }
  };

  const seleccionarEtiqueta = async (id) => {
    setEtiquetaSeleccionada(id);
    await cargarCategoria(id);
  };

  // SUBMIT
  const onSubmit = async (data) => {
    if (!etiquetaSeleccionada)
      return toast.error(t("tickets.create.mustSelectTag"));

    if (!categoriaSeleccionada?.id)
      return toast.error(t("tickets.create.categoryMissing"));

    if (!/^[A-Za-z0-9ÁÉÍÓÚÑáéíóúñ\s.,-]+$/.test(data.titulo))
      return toast.error(t("tickets.create.invalidTitle"));

    if (data.descripcion.trim().length < 5)
      return toast.error(t("tickets.create.descTooShort"));

    if (!data.prioridad_id)
      return toast.error(t("tickets.create.mustSelectPriority"));

    if (!data.categoria_id)
      return toast.error(t("tickets.create.internalCategoryError"));

    try {
      const res = await TicketService.createTicket(
        {
          ...data,
          usuario_solicitante_id: usuario_id,
          estado: "Pendiente",
          fecha_creacion: new Date().toISOString().split("T")[0],
          etiqueta_id: etiquetaSeleccionada,
        },
        { rolId: rol_id, userId: usuario_id }
      );

      if (res.data.success) {
        toast.success(t("tickets.create.success"));
        reset();
        navigate("/tickets");
      } else {
        toast.error(res.data.message || t("tickets.create.errorCreate"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("tickets.create.serverError"));
    }
  };

  return (
    <div className="min-h-screen py-10 px-6 bg-white">
      <div className="max-w-3xl mx-auto bg-white/80 border shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-blue-800 mb-6 text-center">
          {t("tickets.create.title")}
        </h2>

        {/* USER INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label>{t("tickets.create.user")}</Label>
            <Input value={user?.nombre} disabled className="bg-gray-100" />
          </div>
          <div>
            <Label>{t("tickets.create.email")}</Label>
            <Input
              value={user?.correo || user?.email}
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* TITULO */}
          <div>
            <Label className="font-semibold">
              {t("tickets.fields.title")}
            </Label>
            <Controller
              name="titulo"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder={t("tickets.create.titlePlaceholder")}
                />
              )}
            />
            {errors.titulo && (
              <p className="text-red-600">{errors.titulo.message}</p>
            )}
          </div>

          {/* PRIORIDAD */}
          <div>
            <Label className="font-semibold">
              {t("tickets.fields.priority")}
            </Label>
            <Controller
              name="prioridad_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(val) => field.onChange(parseInt(val))}
                >
                  <SelectTrigger className="bg-white border border-gray-300">
                    <SelectValue
                      placeholder={t("tickets.create.priorityPlaceholder")}
                    />
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
          </div>

          {/* ETIQUETAS */}
          <div>
            <Label className="font-semibold">{t("tickets.create.tags")}</Label>
            <div className="flex flex-wrap gap-3 mt-2">
              {etiquetas.map((et) => (
                <button
                  type="button"
                  key={et.id}
                  onClick={() => seleccionarEtiqueta(et.id)}
                  className={`px-4 py-2 rounded-full text-sm border transition-all ${
                    etiquetaSeleccionada === et.id
                      ? "bg-blue-600 text-white border-blue-700 shadow scale-105"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                  }`}
                >
                  {et.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* CATEGORIA */}
          <div>
            <Label className="font-semibold">
              {t("tickets.create.category")}
            </Label>
            <div className="bg-gray-100 font-medium px-3 py-2 rounded-md border text-gray-700">
              {categoriaSeleccionada?.nombre ||
                t("tickets.create.selectTagFirst")}
            </div>
            <input type="hidden" {...register("categoria_id")} />
          </div>

          {/* FECHA + ESTADO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t("tickets.create.date")}</Label>
              <Input value={new Date().toISOString().split("T")[0]} disabled />
            </div>
            <div>
              <Label>{t("tickets.create.state")}</Label>
              <Input value={t("tickets.create.defaultState")} disabled />
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <Label>{t("tickets.fields.description")}</Label>
            <Controller
              name="descripcion"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={4}
                  className="p-3 w-full border rounded-lg"
                  placeholder={t("tickets.create.descPlaceholder")}
                />
              )}
            />
            {errors.descripcion && (
              <p className="text-red-600 text-sm">
                {errors.descripcion.message}
              </p>
            )}
          </div>

          {/* BOTONES */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => navigate("/tickets")}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
            >
              <ArrowLeftCircle className="h-5 w-5" />
              {t("buttons.back")}
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-md bg-blue-700 text-white hover:scale-105 transition"
            >
              <Save className="h-5 w-5" />
              {t("tickets.create.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


