<?php
class AsignacionController
{
    public function semana()
    {
        try {
            header('Content-Type: application/json; charset=utf-8');

            // 1️⃣ Parámetros del query
            $rolId  = isset($_GET['rol_id'])  ? intval($_GET['rol_id'])  : 0;
            $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
            $base   = isset($_GET['date'])    ? trim($_GET['date'])      : null;

            // 2️⃣ Validaciones mínimas
            if (!$rolId || !$userId) {
                http_response_code(400);
                echo json_encode([
                    "success" => false,
                    "message" => "Faltan parámetros: rol_id y user_id"
                ]);
                return;
            }

            // 3️⃣ Validar formato de date si viene
            if ($base && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $base)) {
                http_response_code(400);
                echo json_encode([
                    "success" => false,
                    "message" => "Formato de fecha inválido (usa YYYY-MM-DD)"
                ]);
                return;
            }

            // 4️⃣ Instanciar el modelo
            $model = new AsignacionModel();

            // 5️⃣ Si se envía fecha → calcular semana (lunes a domingo)
            if ($base) {
                $ts = strtotime($base);
                if ($ts === false) {
                    http_response_code(400);
                    echo json_encode([
                        "success" => false,
                        "message" => "Fecha inválida"
                    ]);
                    return;
                }

                $dow    = (int)date('N', $ts); // 1=Lunes, 7=Domingo
                $monday = date('Y-m-d', strtotime("-" . ($dow - 1) . " days", $ts));
                $sunday = date('Y-m-d', strtotime("+" . (7 - $dow) . " days", $ts));

                // 6️⃣ Consultar modelo según rol
                $rows = $model->weeklyByRole($rolId, $userId, $monday, $sunday);
                $week = ['monday' => $monday, 'sunday' => $sunday];
            } else {
                // 7️⃣ Si no hay fecha → obtener TODAS las asignaciones
                $rows = $model->allByRole($rolId, $userId);
                $week = null;
            }

            // 8️⃣ Agrupar por día (si aplica)
        $byDay = [];
foreach ($rows as $r) {
    // 🟢 Validar si hay fecha asignada
    $fecha = $r->fecha_asignacion ?? null;
    if ($fecha && strtotime($fecha)) {
        $day = date('Y-m-d', strtotime($fecha));
        $hora = date('H:i', strtotime($fecha));
    } else {
        // 🟡 Si no hay fecha (ticket sin asignar)
        $day = 'Sin fecha';
        $hora = null;
    }

    $byDay[$day][] = [
        'ticket_id'    => $r->ticket_id,
        'titulo'       => $r->titulo,
        'categoria'    => $r->categoria,
        'estado'       => $r->estado,
        'estado_color' => $r->estado_color,
        'estado_icon'  => $r->estado_icon,
        'tecnico'      => $r->tecnico ?? 'N/A',
        'hora'         => $hora,
        'sla_hrs'      => $r->horas_restantes_sla,
        'sla_status'   => $r->sla_status ?? 'N/A',
        'sla_progress' => $r->sla_progress ?? 0,
        'ver_detalle'  => "/tickets/" . $r->ticket_id
    ];
}

            // 9️⃣ Armar respuesta
            $payload = [
                'week' => $week,
                'asignaciones' => $byDay
            ];

            echo json_encode([
                "success" => true,
                "message" => "Asignaciones obtenidas correctamente",
                "data"    => $payload
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
}