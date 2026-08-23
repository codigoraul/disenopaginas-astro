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

header('Content-Type: application/json; charset=utf-8');

// Solo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'method']);
    exit;
}

// La clave se carga desde gemini-key.php (NO se sube a git, súbelo por FTP al hosting)
require __DIR__ . '/gemini-key.php';
define('GEMINI_MODEL', 'gemini-2.0-flash');

// Leer el cuerpo de la petición
$input = json_decode(file_get_contents('php://input'), true);
$message = isset($input['message']) ? trim((string)$input['message']) : '';
$history = isset($input['history']) && is_array($input['history']) ? $input['history'] : [];

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
chatbot con inteligencia artificial para WhatsApp y sitios web, ofrecido por
DiseñoPaginas.cl (agencia chilena con más de 13 años de experiencia).

Sobre el servicio que representas:
- Se implementa un chatbot con IA conectado a WhatsApp Business y/o a un
  widget de chat en el sitio web del cliente.
- El chatbot responde preguntas frecuentes, atiende 24/7, y deriva a una
  persona real cuando la consulta es compleja.
- Se entrena con la información real del negocio del cliente: productos,
  precios, horarios, preguntas frecuentes.
- Captura datos de contacto de los interesados (nombre, teléfono, interés).
- El valor depende de los canales contratados (solo WhatsApp, solo web, o
  ambos) y el volumen de conversaciones — se cotiza a medida, sin costos
  ocultos. No inventes precios exactos.
- La implementación toma normalmente entre 1 y 3 semanas.
- Contacto: formulario en la misma página, o al +56 9 6176 5268.

Instrucciones de estilo:
- Responde en español de Chile, cercano pero profesional, con emojis con
  moderación (máximo uno por respuesta).
- Respuestas cortas: 2 a 4 frases como máximo.
- Si preguntan algo fuera de este tema (clima, otras empresas, etc.),
  redirige amablemente hacia el servicio de chatbot con IA.
- Si preguntan por un precio exacto, explica que se cotiza según canales y
  volumen, e invita a dejar sus datos en el formulario de la página.
- No inventes funcionalidades que no se mencionan arriba.
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
        'maxOutputTokens' => 300,
    ],
];

function callGemini($payload) {
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
    curl_close($ch);

    if ($httpCode !== 200 || !$response) {
        return null;
    }

    $data = json_decode($response, true);
    $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
    return $text;
}

// Intento 1
$reply = callGemini($payload);

// Reintento silencioso: la capa gratuita de Gemini a veces falla una
// consulta puntual por sobrecarga momentánea — un segundo intento suele bastar.
if ($reply === null) {
    $reply = callGemini($payload);
}

if ($reply === null) {
    http_response_code(200);
    echo json_encode(['reply' => null]);
    exit;
}

echo json_encode(['reply' => trim($reply)]);
