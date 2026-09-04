<?php
/**
 * Panel de historial de conversaciones del chatbot.
 * Lee la base SQLite que arma chat.php (public/data/conversaciones.sqlite),
 * protegido con usuario/contraseña definidos en admin-config.php.
 */

session_start();

$configPath = __DIR__ . '/admin-config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    die('Falta configurar admin-config.php (copia admin-config.php.example, cambia el usuario/clave, y súbelo por FTP).');
}
require $configPath;

// ===== Login =====
$error = '';
if (isset($_POST['login_user'], $_POST['login_pass'])) {
    if ($_POST['login_user'] === HISTORIAL_USER && $_POST['login_pass'] === HISTORIAL_PASS) {
        $_SESSION['historial_ok'] = true;
    } else {
        $error = 'Usuario o contraseña incorrectos.';
    }
}

if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: historial.php');
    exit;
}

$isLogged = !empty($_SESSION['historial_ok']);

// ===== Estilos compartidos (login + panel) =====
$styles = <<<CSS
<style>
  :root {
    --navy: #16307A;
    --blue: #2F56DC;
    --teal: #0EA5A3;
    --bg: #f4f6fb;
    --border: #e6eaf5;
    --muted: #8a93ad;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--bg);
    color: #1c2a4a;
  }
  .topbar {
    background: linear-gradient(135deg, var(--blue) 0%, var(--navy) 100%);
    color: #fff;
    padding: 18px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .topbar h1 {
    font-size: 1.05rem;
    margin: 0;
    font-weight: 700;
  }
  .topbar a {
    color: #dbe6ff;
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid rgba(255,255,255,0.35);
    padding: 6px 14px;
    border-radius: 999px;
    transition: background 0.2s ease;
  }
  .topbar a:hover { background: rgba(255,255,255,0.15); }

  .login-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .login-card {
    background: #fff;
    width: 100%;
    max-width: 380px;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(11,30,77,0.12);
  }
  .login-card .head {
    background: linear-gradient(135deg, var(--blue) 0%, var(--navy) 100%);
    padding: 28px 28px 24px;
    text-align: center;
  }
  .login-card .head img { width: 48px; height: 48px; border-radius: 50%; margin-bottom: 10px; }
  .login-card .head h2 { color: #fff; margin: 0; font-size: 1.15rem; }
  .login-card .head p { color: #cfdcff; margin: 4px 0 0; font-size: 0.82rem; }
  .login-card form { padding: 24px 28px 28px; }
  .login-card label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: .03em;
    margin: 14px 0 6px;
  }
  .login-card input {
    width: 100%;
    padding: 11px 14px;
    border: 1px solid var(--border);
    border-radius: 10px;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s ease;
  }
  .login-card input:focus { border-color: var(--blue); }
  .login-card button {
    width: 100%;
    margin-top: 22px;
    padding: 12px;
    border: none;
    border-radius: 999px;
    background: var(--blue);
    color: #fff;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  .login-card button:hover { background: var(--navy); }
  .error-msg {
    background: #fdecec;
    color: #b02a2a;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 0.85rem;
    margin: 0 28px;
    text-align: center;
  }

  .content { max-width: 900px; margin: 0 auto; padding: 28px 20px 60px; }
  .empty {
    text-align: center;
    color: var(--muted);
    padding: 60px 20px;
    font-size: 0.95rem;
  }

  .conv-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
    margin-bottom: 16px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(11,30,77,0.04);
  }
  .conv-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    cursor: pointer;
    gap: 12px;
    flex-wrap: wrap;
  }
  .conv-header:hover { background: #fafbfe; }
  .conv-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .conv-date { font-size: 0.8rem; color: var(--muted); }
  .conv-count {
    font-size: 0.72rem;
    background: #eef2ff;
    color: var(--blue);
    padding: 2px 10px;
    border-radius: 999px;
    font-weight: 600;
  }
  .lead-badge {
    font-size: 0.72rem;
    background: #e7f9f7;
    color: var(--teal);
    padding: 2px 10px;
    border-radius: 999px;
    font-weight: 700;
  }
  .toggle-icon { color: var(--muted); font-size: 0.8rem; transition: transform 0.2s ease; }
  .conv-card.open .toggle-icon { transform: rotate(180deg); }

  .conv-body { display: none; padding: 4px 18px 18px; border-top: 1px solid var(--border); }
  .conv-card.open .conv-body { display: block; }

  .lead-box {
    background: #f6fefd;
    border: 1px solid #d5f2ee;
    border-radius: 10px;
    padding: 10px 14px;
    margin: 14px 0 6px;
    font-size: 0.82rem;
    color: var(--navy);
  }
  .lead-box b { color: var(--teal); }

  .bubble-row { margin: 12px 0; }
  .bubble-row.user { text-align: right; }
  .bubble {
    display: inline-block;
    max-width: 78%;
    padding: 9px 13px;
    border-radius: 14px;
    font-size: 0.86rem;
    line-height: 1.4;
    text-align: left;
    white-space: pre-wrap;
  }
  .bubble-row.bot .bubble { background: #f1f4fb; color: #1c2a4a; }
  .bubble-row.user .bubble { background: var(--teal); color: #fff; }
  .bubble-label { display: block; font-size: 0.65rem; opacity: 0.65; margin-bottom: 3px; font-weight: 700; text-transform: uppercase; }
</style>
CSS;

if (!$isLogged) {
    echo $styles;
    echo '<div class="login-wrap"><div class="login-card">';
    echo '<div class="head"><img src="/assets/img/servicios/chatbot-robot-ia.webp" alt="Nova"><h2>Historial del Chatbot</h2><p>Acceso privado</p></div>';
    if ($error) echo '<p class="error-msg">' . htmlspecialchars($error) . '</p>';
    echo '<form method="POST">
        <label>Usuario</label>
        <input type="text" name="login_user" required autofocus>
        <label>Contraseña</label>
        <input type="password" name="login_pass" required>
        <button type="submit">Ingresar</button>
    </form>';
    echo '</div></div>';
    exit;
}

// ===== Panel con las conversaciones =====
$dbPath = __DIR__ . '/data/conversaciones.sqlite';
$grupos = [];

if (file_exists($dbPath)) {
    try {
        $db = new PDO('sqlite:' . $dbPath);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $rows = $db->query("SELECT * FROM conversaciones ORDER BY id DESC LIMIT 1000")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as $row) {
            $cid = $row['conversation_id'];
            if (!isset($grupos[$cid])) {
                $grupos[$cid] = ['turnos' => [], 'ultima_fecha' => $row['creado_en'], 'lead' => null];
            }
            array_unshift($grupos[$cid]['turnos'], $row);
            if (!empty($row['lead_nombre'])) {
                $grupos[$cid]['lead'] = [
                    'nombre' => $row['lead_nombre'],
                    'contacto' => $row['lead_contacto'],
                    'interes' => $row['lead_interes'],
                ];
            }
        }
    } catch (Exception $e) {
        // silencioso: se muestra el estado vacio
    }
}

echo $styles;
echo '<div class="topbar"><h1>💬 Historial de conversaciones</h1><a href="?logout=1">Cerrar sesión</a></div>';
echo '<div class="content">';

if (empty($grupos)) {
    echo '<div class="empty">Todavía no hay conversaciones registradas.</div>';
} else {
    foreach ($grupos as $cid => $g) {
        $cantidad = count($g['turnos']);
        $fecha = date('d-m-Y H:i', strtotime($g['ultima_fecha'] . ' UTC'));
        echo '<div class="conv-card">';
        echo '<div class="conv-header" onclick="this.parentElement.classList.toggle(\'open\')">';
        echo '<div class="conv-meta">';
        echo '<span class="conv-date">' . htmlspecialchars($fecha) . '</span>';
        echo '<span class="conv-count">' . $cantidad . ' mensaje' . ($cantidad === 1 ? '' : 's') . '</span>';
        if ($g['lead']) {
            echo '<span class="lead-badge">📇 ' . htmlspecialchars($g['lead']['nombre']) . '</span>';
        }
        echo '</div><span class="toggle-icon">▼</span>';
        echo '</div>';

        echo '<div class="conv-body">';
        if ($g['lead']) {
            echo '<div class="lead-box"><b>Contacto capturado:</b> ' . htmlspecialchars($g['lead']['nombre'])
                . ' — ' . htmlspecialchars($g['lead']['contacto'])
                . ' (' . htmlspecialchars($g['lead']['interes']) . ')</div>';
        }
        foreach ($g['turnos'] as $t) {
            echo '<div class="bubble-row user"><div class="bubble"><span class="bubble-label">Visitante</span>' . nl2br(htmlspecialchars($t['visitante'])) . '</div></div>';
            if (!empty($t['bot'])) {
                echo '<div class="bubble-row bot"><div class="bubble"><span class="bubble-label">Nova</span>' . nl2br(htmlspecialchars($t['bot'])) . '</div></div>';
            }
        }
        echo '</div></div>';
    }
}

echo '</div>';
