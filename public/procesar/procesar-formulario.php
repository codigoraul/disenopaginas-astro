<?php
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Clave secreta de Google reCAPTCHA
    $secretKey = "6Lc1VBsTAAAAAADwdisnT8GFZWEgcdi058LhJuFm";
    $captcha = $_POST['g-recaptcha-response'];

    // Verificar si el reCAPTCHA se completó
    if (!$captcha) {
        http_response_code(400);
        echo json_encode(['error' => 'Por favor, verifica el reCAPTCHA.']);
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
    $response = file_get_contents($url, false, $context);
    $result = json_decode($response, true);

    if (!$result['success']) {
        http_response_code(400);
        echo json_encode(['error' => 'Error de reCAPTCHA. Inténtalo de nuevo.']);
        exit;
    }

    // ---- Continuar con el procesamiento del formulario ----
    $nombre = htmlspecialchars(trim($_POST['nombre']));
    $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
    $fono = htmlspecialchars(trim($_POST['fono']));
    $desde = htmlspecialchars(trim($_POST['desde'] ?? ''));
    $presupuesto = htmlspecialchars(trim($_POST['presupuesto']));
    $mensaje = htmlspecialchars(trim($_POST['mensaje']));

    if (!$email) {
        http_response_code(400);
        echo json_encode(['error' => 'Email no válido.']);
        exit;
    }

    $to = "codigoraul@gmail.com";
    $subject = "Mensaje Formulario Diseñopaginas.cl";
    $message = "NUEVO MENSAJE DE CONTACTO\n";
    $message .= str_repeat("=", 30) . "\n\n";
    $message .= "NOMBRE: $nombre\n";
    $message .= "EMAIL: $email\n";
    $message .= "TELÉFONO: $fono\n\n";
    $message .= "PLAN: $presupuesto\n\n";
    $message .= "MENSAJE:\n$mensaje\n\n";
    $message .= str_repeat("=", 30);
    
    $headers = [
        'From' => 'formulario@' . $_SERVER['HTTP_HOST'],
        'Reply-To' => $email,
        'X-Mailer' => 'PHP/' . phpversion(),
        'Content-Type' => 'text/plain; charset=UTF-8'
    ];
    
    $headers_str = '';
    foreach ($headers as $key => $value) {
        $headers_str .= "$key: $value\r\n";
    }

    if (mail($to, $subject, $message, $headers_str)) {
        echo json_encode(['success' => true, 'message' => '¡Mensaje enviado correctamente!']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Hubo un error al enviar el mensaje.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>
