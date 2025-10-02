<?php
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Clave secreta de Google reCAPTCHA
    $secretKey = "6Lc1VBsTAAAAAADwdisnT8GFZWEgcdi058LhJuFm";
    $captcha = $_POST['g-recaptcha-response'] ?? '';

    // Verificar si el reCAPTCHA se completó
    if (empty($captcha)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Por favor, verifica el reCAPTCHA.']);
        exit;
    }

    // Validar el reCAPTCHA con Google
    $url = "https://www.google.com/recaptcha/api/siteverify";
    $data = [
        'secret' => $secretKey,
        'response' => $captcha,
        'remoteip' => $_SERVER['REMOTE_ADDR']
    ];

    $options = [
        'http' => [
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data)
        ]
    ];

    $context = stream_context_create($options);
    $response = @file_get_contents($url, false, $context);
    
    if ($response === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error al validar el reCAPTCHA.']);
        exit;
    }

    $result = json_decode($response, true);

    if (!$result['success']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Error de reCAPTCHA. Inténtalo de nuevo.']);
        exit;
    }

    // Validar campos requeridos
    $required = ['nombre', 'email', 'fono', 'presupuesto', 'mensaje'];
    $missing = [];
    
    foreach ($required as $field) {
        if (empty($_POST[$field])) {
            $missing[] = $field;
        }
    }
    
    if (!empty($missing)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Faltan campos requeridos: ' . implode(', ', $missing)]);
        exit;
    }

    // Limpiar y validar datos
    $nombre = htmlspecialchars(trim($_POST['nombre']));
    $email = filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL);
    $fono = htmlspecialchars(trim($_POST['fono']));
    $presupuesto = htmlspecialchars(trim($_POST['presupuesto']));
    $mensaje = htmlspecialchars(trim($_POST['mensaje']));

    if (!$email) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'El formato del correo electrónico no es válido.']);
        exit;
    }

    // Configurar destinatario y asunto
    $to = "codigoraul@gmail.com";
    $subject = "[Solicitud de Presupuesto] $presupuesto - $nombre";
    
    // Construir el mensaje
    $message = "Nombre: $nombre\n";
    $message .= "Email: $email\n";
    $message .= "Teléfono: $fono\n";
    $message .= "Presupuesto: $presupuesto\n\n";
    $message .= "Mensaje:\n$mensaje";
    
    // Configurar cabeceras
    $headers = [
        'From' => 'codigoraul@gmail.com',
        'Reply-To' => $email,
        'X-Mailer' => 'PHP/' . phpversion(),
        'Content-Type' => 'text/plain; charset=UTF-8'
    ];
    
    // Convertir el array de cabeceras en una cadena
    $headersStr = '';
    foreach ($headers as $key => $value) {
        $headersStr .= "$key: $value\r\n";
    }
    
    // Enviar el correo
    if (mail($to, $subject, $message, $headersStr)) {
        echo json_encode(['success' => true, 'message' => '¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
}
