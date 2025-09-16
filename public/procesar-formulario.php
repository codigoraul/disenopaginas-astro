<?php
header('Content-Type: application/json');

// Permitir CORS desde tu dominio
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido: Solo se acepta POST']);
    exit;
}

// Verificar reCAPTCHA
$recaptcha_secret = "6Lc1VBsTAAAAAADwdisnT8GFZWEgcdi058LhJuFm";
$recaptcha_response = $_POST['g-recaptcha-response'] ?? '';

if (empty($recaptcha_response)) {
    http_response_code(400);
    echo json_encode(['error' => 'Por favor, completa la verificación de reCAPTCHA']);
    exit;
}

$verify = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret={$recaptcha_secret}&response={$recaptcha_response}");
$captcha_success = json_decode($verify);

if (!$captcha_success->success) {
    http_response_code(400);
    echo json_encode([
        'error' => 'La verificación de reCAPTCHA falló. Por favor, inténtalo nuevamente.',
        'details' => $captcha_success
    ]);
    exit;
}

// Obtener y validar datos del formulario
$campos_requeridos = [
    'nombre' => 'Nombre',
    'fono' => 'Teléfono',
    'email' => 'Email',
    'presupuesto' => 'Plan seleccionado',
    'mensaje' => 'Mensaje'
];

$datos = [];
$campos_faltantes = [];

foreach ($campos_requeridos as $campo => $nombre) {
    $valor = $_POST[$campo] ?? '';
    if (empty($valor)) {
        $campos_faltantes[] = $nombre;
    }
    $datos[$campo] = $valor;
}

if (!empty($campos_faltantes)) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Campos requeridos faltantes: ' . implode(', ', $campos_faltantes)
    ]);
    exit;
}

// Validar email
if (!filter_var($datos['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'El formato del email no es válido']);
    exit;
}

// Configurar el email
$to = 'codigoraul@gmail.com';
$subject = 'Nuevo Mensaje de Contacto - diseñopaginas.cl';
$headers = [
    'From' => 'formulario@' . $_SERVER['HTTP_HOST'],
    'Reply-To' => $datos['email'],
    'X-Mailer' => 'PHP/' . phpversion(),
    'Content-Type' => 'text/plain; charset=UTF-8'
];

$message = "Nuevo mensaje desde el formulario de contacto:\n\n";
foreach ($campos_requeridos as $campo => $nombre) {
    $message .= "$nombre: {$datos[$campo]}\n";
}

// Enviar email
$success = mail($to, $subject, $message, $headers);

if ($success) {
    echo json_encode(['success' => true, 'message' => 'Mensaje enviado correctamente']);
} else {
    $error = error_get_last();
    http_response_code(500);
    echo json_encode([
        'error' => 'Error al enviar el email',
        'details' => $error ? $error['message'] : 'Error desconocido en el servidor de correo'
    ]);
}
