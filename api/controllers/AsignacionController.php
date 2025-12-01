<?php
// ============================================================
// CONTROLADOR: AsignacionController
// Descripción:
//   Este controlador maneja las peticiones HTTP relacionadas con
//   las asignaciones de tickets. Puede devolver todas las asignaciones,
//   o solo las de una semana específica, agrupadas por día.
// ============================================================

class AsignacionController
{
    // ============================================================
    // MÉTODO: semana()
    // Descripción:
    //   Devuelve las asignaciones según el rol del usuario (admin/técnico)
    //   Puede recibir una fecha base para calcular la semana (lunes a domingo).
    // ============================================================
    public function semana()
    {
        try {
            // Establece el encabezado (header) HTTP para indicar que la respuesta será JSON con codificación UTF-8
            header('Content-Type: application/json; charset=utf-8');

            //  Parámetros del query string (de la URL)
            // Ejemplo de URL:
            // http://localhost:81/Proyecto/api/AsignacionController/semana?rol_id=2&user_id=3&date=2025-10-29
            $rolId  = isset($_GET['rol_id'])  ? intval($_GET['rol_id'])  : 0;  // Convierte a número entero
            $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
            $base   = isset($_GET['date'])    ? trim($_GET['date'])      : null; // Fecha base (formato YYYY-MM-DD)

            //  Validaciones mínimas: revisa que se hayan enviado rol y usuario
            if (!$rolId || !$userId) {
                http_response_code(400); // 400 → Solicitud incorrecta
                echo json_encode([
                    "success" => false,
                    "message" => "Faltan parámetros: rol_id y user_id"
                ]);
                return; // Detiene la ejecución
            }

            //  Validar formato de la fecha si se envía el parámetro "date"
            // Expresión regular para validar formato YYYY-MM-DD
            if ($base && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $base)) {
                http_response_code(400);
                echo json_encode([
                    "success" => false,
                    "message" => "Formato de fecha inválido (usa YYYY-MM-DD)"
                ]);
                return;
            }

            // Se crea una instancia del modelo que maneja la lógica de asignaciones
            $model = new AsignacionModel();

            //  Si se recibe una fecha base → se calcula la semana (lunes a domingo)
            if ($base) {
                $ts = strtotime($base); // Convierte la fecha en timestamp (segundos desde 1970)
                if ($ts === false) {
                    // Si la conversión falla, significa que la fecha no es válida
                    http_response_code(400);
                    echo json_encode([
                        "success" => false,
                        "message" => "Fecha inválida"
                    ]);
                    return;
                }

                // 'N' devuelve el número del día de la semana (1 = lunes, 7 = domingo)
                $dow = (int)date('N', $ts);

                // Calcula el lunes de esa semana (resta los días necesarios)
                $monday = date('Y-m-d', strtotime("-" . ($dow - 1) . " days", $ts));

                // Calcula el domingo de esa semana (suma los días que faltan)
                $sunday = date('Y-m-d', strtotime("+" . (7 - $dow) . " days", $ts));

                //  Consultar el modelo: obtiene las asignaciones de esa semana según el rol
                $rows = $model->weeklyByRole($rolId, $userId, $monday, $sunday);
                $week = ['monday' => $monday, 'sunday' => $sunday]; // Guarda el rango semanal
            } else {
                // 7️ Si no se envió fecha, obtiene todas las asignaciones
                $rows = $model->allByRole($rolId, $userId);
                $week = null; // No hay semana específica
            }

            //  Agrupar las asignaciones por día
            // Se crea un arreglo vacío donde cada clave será un día de la semana
            $byDay = [];

            foreach ($rows as $r) {
                //  Verifica si la asignación tiene una fecha válida
                $fecha = $r->fecha_asignacion ?? null;
                if ($fecha && strtotime($fecha)) {
                    // Si la fecha es válida, se separa el día (YYYY-MM-DD) y la hora (HH:MM)
                    $day = date('Y-m-d', strtotime($fecha));
                    $hora = date('H:i', strtotime($fecha));
                } else {
                    //  Si no tiene fecha (por ejemplo, ticket aún no asignado)
                    $day = 'Sin fecha';
                    $hora = null;
                }

                // Se agrupan los datos del ticket dentro del día correspondiente
                $byDay[$day][] = [
                    'ticket_id'    => $r->ticket_id,
                    'titulo'       => $r->titulo,
                    'categoria'    => $r->categoria,
                    'estado'       => $r->estado,
                    'fecha_creacion' => $r->fecha_creacion,
                    'sla_resol_limite' => $r->sla_resol_limite,
                    'estado_color' => $r->estado_color,       // Color visual (de la paleta)
                    'estado_icon'  => $r->estado_icon,        // Ícono visual
                    'tecnico'      => $r->tecnico ?? 'N/A',   // Técnico asignado (si no hay → N/A)
                    'hora'         => $hora,                  // Hora de asignación
                    'sla_status'   => $r->sla_status ?? 'N/A', // Estado del SLA (Dentro o Vencido)
                    'sla_progress' => $r->sla_progress ?? 0,   // Porcentaje visual de progreso del SLA
                    'ver_detalle'  => "/tickets/" . $r->ticket_id // Enlace directo al detalle del ticket
                ];
            }

            //  Construir la respuesta final en formato JSON
            $payload = [
                'week' => $week,             // Información de la semana (si aplica)
                'asignaciones' => $byDay     // Asignaciones agrupadas por día
            ];

            // Se envía la respuesta con éxito = true
            echo json_encode([
                "success" => true,
                "message" => "Asignaciones obtenidas correctamente",
                "data"    => $payload
            ]);
        } catch (\Throwable $e) {
            // Captura errores no controlados (excepciones o errores de PHP)
            http_response_code(500); // 500 → Error interno del servidor
            echo json_encode([
                "success" => false,
                "message" => "Error en el servidor",
                "error"   => $e->getMessage() // Devuelve el mensaje del error
            ]);
        }
    }

    public function tecnicos()
{
    header('Content-Type: application/json');

    $ticketId = intval($_GET['ticket_id'] ?? 0);

    if (!$ticketId) {
        echo json_encode([
            "success" => false,
            "message" => "Ticket no válido"
        ]);
        return;
    }

    try {
        $model = new AsignacionModel();
        $rows  = $model->getTecnicosPorTicket($ticketId);

        echo json_encode([
            "success" => true,
            "data"    => $rows
        ]);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Error en el servidor",
            "error"   => $e->getMessage()
        ]);
    }
}

    public function auto()
{
    header('Content-Type: application/json');

    $ticketId = intval($_GET['ticket_id'] ?? 0);

    if (!$ticketId) {
        echo json_encode(["success" => false, "message" => "Ticket no válido"]);
        return;
    }

    $model = new AsignacionModel();
    $tec = $model->asignarAutomaticamente($ticketId);

    if (!$tec) {
        echo json_encode(["success" => false, "message" => "No se pudo asignar automáticamente"]);
        return;
    }

  echo json_encode([
    "success" => true,
    "message" => "Asignado automáticamente",
    "tecnico" => [
        "id" => $tec->tecnico_id,
        "nombre" => $tec->nombre,
        "puntaje" => $tec->puntaje,
        "regla_id" => $tec->regla_id,
        "regla_nombre" => $tec->regla_nombre
    ]
]);

}
public function manual()
{
    header('Content-Type: application/json');

    try {
        $ticketId  = intval($_POST['ticket_id'] ?? 0);
        $tecnicoId = intval($_POST['tecnico_id'] ?? 0);
        $just      = trim($_POST['justificacion'] ?? '');

        if (!$ticketId || !$tecnicoId) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Faltan parámetros"
            ]);
            return;
        }

        $model = new AsignacionModel();
        $ok = $model->asignarManual($ticketId, $tecnicoId);

        echo json_encode([
            "success" => true,
            "message" => "Asignación manual realizada correctamente"
        ]);

    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Error interno",
            "error" => $e->getMessage()
        ]);
    }
}





public function asignarPendientes()
{
    try {
        header('Content-Type: application/json; charset=utf-8');

        $model = new AsignacionModel();
        $result = $model->asignarTodosPendientes();

        echo json_encode([
            "success" => true,
            "message" => "Asignación automática completada",
            "data"    => $result
        ]);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Error en el servidor",
            "error"   => $e->getMessage()
        ]);
    }
}

public function pendientes()
{
    header('Content-Type: application/json; charset=utf-8');

    try {
        $model = new AsignacionModel();
        $data  = $model->listPendientes();

        echo json_encode([
            "success" => true,
            "data"    => $data
        ]);
        return;

    } catch (Throwable $e) {

        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Error cargando los tickets pendientes",
            "error"   => $e->getMessage()
        ]);
        return;
    }
}




}
