<?php
class AsignacionController
{
    // ============================================================
    // PRUEBA EN POSTMAN (AGENDA / TABLERO SEMANAL DEL TÉCNICO)
    //
    // Forma A (controlador/acción):
    // GET -> http://localhost:81/Proyecto/api/AsignacionController/semana?rol_id=2&user_id=2
    // GET -> http://localhost:81/Proyecto/api/AsignacionController/semana?rol_id=2&user_id=2&date=2025-10-13
    //
    //
    // Parámetros (query):
    //   - rol_id  : 2 (obligatorio; solo técnicos pueden ver su agenda)
    //   - user_id : ID del técnico (obligatorio; coincide con usuarios.id)
    //   - date    : YYYY-MM-DD (opcional; si no viene, usa la fecha de hoy)
    //
    // Comportamiento:
    //   - Calcula la semana (Lunes..Domingo) que contiene `date` (u hoy).
    //   - Lista las asignaciones VIGENTES (a.vigente=1) del técnico en ese rango.
    //   - Respuesta lista para UI de tablero/agenda:
    //       week: { monday, sunday }
    //       asignaciones: { 'YYYY-MM-DD': [ { ticket_id, titulo, categoria, estado,
    //                                        estado_color, estado_icon, hora,
    //                                        sla_hrs, sla_status, sla_progress,
    //                                        ver_detalle } ] }
    //
    // HTTP:
    //   - 200 OK: éxito (con data o vacío)
    //   - 400 Bad Request: faltan parámetros o `date` inválido
    //   - 403 Forbidden: rol distinto de 2
    //   - 500 Error: error inesperado
    // ============================================================
    public function semana()
    {
        try {
            header('Content-Type: application/json; charset=utf-8');

            // Leer parámetros (igual que Tickets: “manda normal”)
            $rolId  = isset($_GET['rol_id'])  ? intval($_GET['rol_id'])  : 0;
            $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
            $base   = isset($_GET['date'])    ? trim($_GET['date'])      : date('Y-m-d');

            // Validaciones mínimas
            if (!$rolId || !$userId) {
                http_response_code(400);
                echo json_encode([
                    "success" => false,
                    "message" => "Faltan parámetros rol_id y user_id"
                ]);
                return;
            }
            if ($rolId !== 2) {
                http_response_code(403);
                echo json_encode([
                    "success" => false,
                    "message" => "Solo técnicos pueden ver su agenda semanal (rol_id=2)"
                ]);
                return;
            }
            // Validar formato de date si viene por query
            if (!empty($_GET['date']) && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $base)) {
                http_response_code(400);
                echo json_encode([
                    "success" => false,
                    "message" => "Formato de date inválido (usa YYYY-MM-DD)"
                ]);
                return;
            }

            // Calcular semana: lunes a domingo de la fecha base
            $ts = strtotime($base);
            if ($ts === false) {
                http_response_code(400);
                echo json_encode([
                    "success" => false,
                    "message" => "Fecha inválida"
                ]);
                return;
            }
            $dow    = (int)date('N', $ts); // 1=Lunes … 7=Domingo
            $monday = date('Y-m-d', strtotime("-" . ($dow - 1) . " days", $ts));
            $sunday = date('Y-m-d', strtotime("+" . (7 - $dow) . " days", $ts));

            // Consultar modelo
            $model = new AsignacionModel();
            $rows  = $model->weeklyForTech($userId, $monday, $sunday);

            // Armar estructura tipo tablero agrupada por día
            $byDay = [];
            foreach ($rows as $r) {
                $day = date('Y-m-d', strtotime($r->fecha_asignacion));
                $byDay[$day][] = [
                    'ticket_id'    => $r->ticket_id,
                    'titulo'       => $r->titulo,
                    'categoria'    => $r->categoria,
                    'estado'       => $r->estado,
                    'estado_color' => $r->estado_color,   // para UI (badge/label)
                    'estado_icon'  => $r->estado_icon,    // para UI (icono)
                    'hora'         => date('H:i', strtotime($r->fecha_asignacion)),
                    'sla_hrs'      => $r->horas_restantes_sla, // tiempo restante SLA resolución
                    'sla_status'   => $r->sla_status,     // 'Dentro de SLA' | 'Vencido' | 'N/A'
                    'sla_progress' => $r->sla_progress,   // 0/50/80/100 (barra)
                    'ver_detalle'  => "/tickets/" . $r->ticket_id
                ];
            }

            $payload = [
                'week' => ['monday' => $monday, 'sunday' => $sunday],
                'asignaciones' => $byDay  // puede venir vacío si no hay asignaciones en esa semana
            ];

            echo json_encode([
                "success" => true,
                "message" => "Agenda semanal del técnico",
                "data"    => $payload
            ]);

        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Error",
                "error"   => $e->getMessage()
            ]);
        }
    }
}