<?php
/**
 * Endpoint de chat con IA para la landing "Chatbot WhatsApp con IA".
 * Mismo patrón que /paneles-solares/chat.php: recibe { message, history },
 * llama a Gemini con la clave guardada SOLO en el servidor, y devuelve { reply }.
 *
 * IMPORTANTE: reemplaza el valor de GEMINI_API_KEY antes de subir este archivo
 * a tu hosting. Consíguela gratis en https://aistudio.google.com/apikey
 * Nunca pongas la clave en el código que corre en el navegador (JS/Astro).
 */

// ===== CORS: permite que este chat.php sea llamado desde la web de un cliente =====
// Este mismo archivo puede vivir en TU servidor mientras el widget corre en el
// dominio del cliente (o viceversa). Agrega aquí cada dominio autorizado.
$allowedOrigins = [
    'https://disenopaginas.cl',
    'https://www.disenopaginas.cl',
    // 'https://web-del-cliente.com', // <- agrega el dominio de cada cliente aquí
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// El navegador manda un preflight OPTIONS antes del POST real cuando hay CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

// Solo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'method']);
    exit;
}

// La clave se carga desde gemini-key.php (NO se sube a git, súbelo por FTP al hosting)
require __DIR__ . '/gemini-key.php';
define('GEMINI_MODEL', 'gemini-3.6-flash');

// ===== Historial de conversaciones (SQLite, un solo archivo, sin MySQL) =====
function getHistorialDb() {
    $dir = __DIR__ . '/data';
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    $dbPath = $dir . '/conversaciones.sqlite';
    try {
        $db = new PDO('sqlite:' . $dbPath);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $db->exec("CREATE TABLE IF NOT EXISTS conversaciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id TEXT NOT NULL,
            creado_en TEXT NOT NULL,
            visitante TEXT NOT NULL,
            bot TEXT,
            lead_nombre TEXT,
            lead_contacto TEXT,
            lead_interes TEXT
        )");
        return $db;
    } catch (Exception $e) {
        return null;
    }
}

function guardarTurno($conversationId, $visitorMsg, $botReply, $lead = null) {
    $db = getHistorialDb();
    if (!$db) return;
    try {
        $stmt = $db->prepare("INSERT INTO conversaciones
            (conversation_id, creado_en, visitante, bot, lead_nombre, lead_contacto, lead_interes)
            VALUES (:cid, :fecha, :visitante, :bot, :nombre, :contacto, :interes)");
        $stmt->execute([
            ':cid' => $conversationId,
            ':fecha' => gmdate('Y-m-d H:i:s'),
            ':visitante' => $visitorMsg,
            ':bot' => $botReply,
            ':nombre' => $lead['nombre'] ?? null,
            ':contacto' => $lead['contacto'] ?? null,
            ':interes' => $lead['interes'] ?? null,
        ]);
    } catch (Exception $e) {
        // Si falla el guardado, no interrumpe la respuesta al visitante.
    }
}

// Leer el cuerpo de la petición
$input = json_decode(file_get_contents('php://input'), true);
$message = isset($input['message']) ? trim((string)$input['message']) : '';
$history = isset($input['history']) && is_array($input['history']) ? $input['history'] : [];
$conversationId = isset($input['conversationId']) ? substr((string)$input['conversationId'], 0, 100) : 'sin-id';

if ($message === '') {
    http_response_code(400);
    echo json_encode(['error' => 'empty_message']);
    exit;
}

// Límite básico de longitud para evitar abuso
if (mb_strlen($message) > 500) {
    $message = mb_substr($message, 0, 500);
}

// ===== Contexto del negocio: aquí se entrena el asistente sobre TU servicio =====
$systemPrompt = <<<PROMPT
Eres "Nova", el asistente virtual de una landing que vende un servicio de
chatbot con inteligencia artificial para sitios web, ofrecido por
DiseñoPaginas.cl (agencia chilena con más de 13 años de experiencia).

Sobre el servicio que representas (por ahora SOLO chatbot con IA para
sitio web, sin integración de WhatsApp):
- Es un chatbot con inteligencia artificial que se instala como widget de
  chat en el sitio web del cliente.
- Responde preguntas frecuentes de los visitantes y atiende 24/7 — la
  atención la cubre completamente la IA, no hay una persona humana detrás
  respondiendo en vivo.
- Se entrena con la información real del negocio del cliente: productos,
  servicios, horarios, preguntas frecuentes.
- Captura datos de contacto de los interesados (nombre, teléfono, interés)
  para que el negocio les haga seguimiento.
- Precios fijos mensuales (sin costos ocultos):
  · Empresas: $15.000 CLP mensual
  · Pymes/emprendimientos: $10.000 CLP mensual
- Forma de pago: transferencia bancaria.
- Implementación: una vez que el cliente entrega el acceso a su hosting,
  el chatbot queda instalado y funcionando en 24 horas.
- DiseñoPaginas.cl también ofrece diseño y creación de sitios web completos
  (no solo el chatbot) — si preguntan por una página web nueva, menciónalo
  como parte de los servicios de la agencia.
- Contacto: formulario en la misma página, o al +56 9 6176 5268.

Cómo funciona (usa esto si preguntan "¿cómo funciona?", "¿las respuestas
las dan ustedes?", "¿quién responde?" o similar):
- El cliente no tiene que escribir respuestas una por una. Le entrega a
  DiseñoPaginas.cl la información de su negocio (qué hace, servicios,
  horarios, precios si quiere mostrarlos, preguntas frecuentes de sus
  clientes) y con eso se "entrena" al chatbot.
- Desde ahí, la inteligencia artificial genera las respuestas sola, en
  tiempo real, para lo que pregunte cada visitante — no son respuestas
  fijas tipo menú.
- Si preguntan algo que no está cubierto en esa información, el chatbot
  ofrece dejar sus datos de contacto para que el negocio los contacte
  directamente.
- Si más adelante el negocio quiere agregar o cambiar información (nuevos
  precios, un servicio nuevo), se actualiza fácil y el chatbot ya responde
  con lo nuevo — no hay que reprogramar nada complicado.

Instrucciones de estilo:
- Responde en español de Chile, cercano pero profesional, con emojis con
  moderación (máximo uno por respuesta).
- Respuestas cortas: 2 a 4 frases como máximo.
- Si preguntan algo fuera de este tema (clima, otras empresas, etc.),
  redirige amablemente hacia el servicio de chatbot con IA.
- Si preguntan el precio, da los valores exactos de arriba según sea
  empresa o pyme; si no está claro cuál es, pregunta primero o menciona
  ambos casos.
- No ofrezcas integración con WhatsApp: por ahora el servicio es solo para
  sitio web. Si preguntan por WhatsApp, indica que actualmente el chatbot
  es para el sitio web y que puede consultar por WhatsApp dejando sus datos.
- Si preguntan qué tecnología usa el chatbot, qué modelo de IA es, o con
  qué está hecho: NO menciones proveedores ni nombres técnicos específicos
  (por ejemplo no digas Gemini, Google, GPT, OpenAI, ni nombres de modelos).
  Responde en general, algo como "usamos inteligencia artificial avanzada,
  la misma tecnología detrás de los asistentes más modernos, entrenada
  especialmente con la información de tu negocio". Si insisten en el
  detalle técnico, redirige la conversación hacia los beneficios (atención
  24/7, fácil de mantener, resultados) en vez de dar más especificaciones.
- No inventes funcionalidades que no se mencionan arriba.

Captura de datos de contacto (MUY IMPORTANTE, uso interno):
- Durante la conversación, intenta obtener naturalmente el nombre y un
  teléfono o email de contacto del visitante, sobre todo si muestra interés
  real (pregunta precios, quiere cotizar, dice que le interesa, pide que lo
  contacten, etc.). Pídelo de a poco, sin sonar a formulario.
- Apenas tengas AL MENOS el nombre y un teléfono o email, agrega al FINAL
  de tu respuesta (después de tu mensaje normal para el usuario), en una
  línea nueva, exactamente este formato, sin explicarlo ni mencionarlo:
  [LEAD_CAPTURADO]{"nombre":"...","contacto":"...","interes":"..."}
  Donde "interes" es un resumen breve de qué necesita (ej: "cotizar plan
  empresa", "duda sobre precio pyme"). Usa comillas dobles y una sola línea
  de JSON válido. Esto es una señal técnica para el sistema, el visitante
  NUNCA debe ver este texto ni saber que existe — tu respuesta visible para
  él debe sonar 100% natural, como si solo estuvieras conversando.
- Solo incluye [LEAD_CAPTURADO] la PRIMERA vez que reúnas esos datos en la
  conversación, no lo repitas en cada mensaje siguiente.
PROMPT;

// Mapear historial al formato de Gemini (roles: user / model)
$contents = [];
foreach ($history as $turn) {
    if (!isset($turn['role'], $turn['text'])) continue;
    $role = $turn['role'] === 'model' ? 'model' : 'user';
    $contents[] = [
        'role' => $role,
        'parts' => [['text' => (string)$turn['text']]],
    ];
}
// Mensaje actual del usuario
$contents[] = [
    'role' => 'user',
    'parts' => [['text' => $message]],
];

$payload = [
    'system_instruction' => [
        'parts' => [['text' => $systemPrompt]],
    ],
    'contents' => $contents,
    'generationConfig' => [
        'temperature' => 0.6,
        // NOTA: el parametro thinkingConfig/thinkingBudget=0 que se usaba aqui
        // para desactivar el "pensamiento" del modelo dejo de ser un argumento
        // valido para la API (devuelve 400 INVALID_ARGUMENT). Se saco. Como el
        // modelo ahora puede gastar algunos tokens "pensando" antes de
        // responder, subimos el limite para que la respuesta visible no se
        // corte.
        'maxOutputTokens' => 2048,
    ],
];

function callGemini($payload, &$debug = null) {
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . GEMINI_MODEL . ':generateContent?key=' . GEMINI_API_KEY;

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_TIMEOUT => 20,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErrNo = curl_errno($ch);
    $curlErr = curl_error($ch);

    // DEBUG TEMPORAL: guarda el detalle del intento para diagnosticar por que
    // falla en este hosting. Quitar este bloque (y el uso de $debug) una vez
    // resuelto el problema.
    $debug = [
        'http_code' => $httpCode,
        'curl_errno' => $curlErrNo,
        'curl_error' => $curlErr,
        'response_snippet' => $response ? mb_substr($response, 0, 500) : null,
    ];

    if ($httpCode !== 200 || !$response) {
        return null;
    }

    $data = json_decode($response, true);
    $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
    return $text;
}

// Intento 1
$debug1 = null;
$reply = callGemini($payload, $debug1);

// Reintento silencioso: la capa gratuita de Gemini a veces falla una
// consulta puntual por sobrecarga momentánea — un segundo intento suele bastar.
$debug2 = null;
if ($reply === null) {
    $reply = callGemini($payload, $debug2);
}

// DEBUG TEMPORAL: agrega ?debug=1 a la URL de chat.php (o manda debug:true en
// el body) para ver por que esta fallando la llamada a Gemini en este hosting.
// Quitar este bloque despues de diagnosticar.
$wantsDebug = (isset($_GET['debug']) && $_GET['debug'] === '1') || (isset($input['debug']) && $input['debug'] === true);

if ($reply === null) {
    http_response_code(200);
    $out = ['reply' => null];
    if ($wantsDebug) {
        $out['debug_intento_1'] = $debug1;
        $out['debug_intento_2'] = $debug2;
    }
    echo json_encode($out);
    exit;
}

$reply = trim($reply);

// ===== Captura de leads: detecta el marcador [LEAD_CAPTURADO]{...} que el
// modelo agrega cuando junta nombre + contacto, avisa por correo y lo saca
// de la respuesta visible para el usuario. =====
$lead = null;
if (preg_match('/\[LEAD_CAPTURADO\]\s*(\{.*\})/s', $reply, $m)) {
    $reply = trim(str_replace($m[0], '', $reply));
    $lead = json_decode($m[1], true);

    if (is_array($lead)) {
        $leadNombre = htmlspecialchars($lead['nombre'] ?? 'Sin nombre');
        $leadContacto = htmlspecialchars($lead['contacto'] ?? 'Sin contacto');
        $leadInteres = htmlspecialchars($lead['interes'] ?? 'Sin detalle');

        // Construye las burbujas de la conversacion completa
        $chatHtml = '';
        $renderBurbuja = function ($who, $text) {
            $isBot = $who === 'Bot';
            $align = $isBot ? 'left' : 'right';
            $bg = $isBot ? '#f1f4fb' : '#2F56DC';
            $color = $isBot ? '#16307A' : '#ffffff';
            $label = $isBot ? 'Nova (bot)' : 'Visitante';
            return '<div style="text-align:' . $align . ';margin:0 0 10px;">'
                . '<div style="display:inline-block;max-width:80%;background:' . $bg . ';color:' . $color . ';'
                . 'padding:10px 14px;border-radius:14px;font-size:14px;line-height:1.4;text-align:left;">'
                . '<strong style="display:block;font-size:11px;opacity:0.7;margin-bottom:3px;">' . $label . '</strong>'
                . nl2br(htmlspecialchars($text))
                . '</div></div>';
        };
        foreach ($history as $turn) {
            $who = ($turn['role'] ?? '') === 'model' ? 'Bot' : 'Visitante';
            $chatHtml .= $renderBurbuja($who, (string)($turn['text'] ?? ''));
        }
        $chatHtml .= $renderBurbuja('Visitante', $message);

        $to = "codigoraul@gmail.com";
        $subject = "Nuevo lead del chatbot: $leadNombre";

        $htmlBody = '
<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;background:#f6f8fc;padding:24px;">
  <div style="background:linear-gradient(135deg,#2F56DC,#16307A);border-radius:16px 16px 0 0;padding:20px 24px;">
    <h2 style="color:#ffffff;margin:0;font-size:18px;">🤖 Nuevo lead capturado por el chatbot</h2>
  </div>
  <div style="background:#ffffff;border-radius:0 0 16px 16px;padding:0;overflow:hidden;box-shadow:0 4px 14px rgba(11,30,77,0.08);">
    <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
      <tr>
        <td style="padding:14px 20px;border-bottom:1px solid #eef1f8;color:#8a93ad;font-size:12px;text-transform:uppercase;letter-spacing:.04em;width:120px;">Nombre</td>
        <td style="padding:14px 20px;border-bottom:1px solid #eef1f8;color:#16307A;font-size:15px;font-weight:600;">' . $leadNombre . '</td>
      </tr>
      <tr>
        <td style="padding:14px 20px;border-bottom:1px solid #eef1f8;color:#8a93ad;font-size:12px;text-transform:uppercase;letter-spacing:.04em;">Contacto</td>
        <td style="padding:14px 20px;border-bottom:1px solid #eef1f8;color:#16307A;font-size:15px;font-weight:600;">' . $leadContacto . '</td>
      </tr>
      <tr>
        <td style="padding:14px 20px;color:#8a93ad;font-size:12px;text-transform:uppercase;letter-spacing:.04em;">Interés</td>
        <td style="padding:14px 20px;color:#16307A;font-size:15px;font-weight:600;">' . $leadInteres . '</td>
      </tr>
    </table>
    <div style="padding:20px 24px 24px;">
      <p style="color:#8a93ad;font-size:12px;text-transform:uppercase;letter-spacing:.04em;margin:0 0 12px;">Conversación completa</p>
      ' . $chatHtml . '
    </div>
  </div>
  <p style="text-align:center;color:#aab2c8;font-size:11px;margin-top:16px;">Enviado automáticamente por el chatbot de diseñopaginas.cl</p>
</div>';

        $boundaryHeaders = "From: codigoraul@gmail.com\r\n"
            . "Content-Type: text/html; charset=UTF-8\r\n";
        @mail($to, $subject, $htmlBody, $boundaryHeaders);
    }
}

// Guarda el intercambio en el historial (no interrumpe la respuesta si falla)
guardarTurno($conversationId, $message, $reply, $lead);

$out = ['reply' => $reply];
if ($wantsDebug) {
    $out['debug_intento_1'] = $debug1;
}
echo json_encode($out);
