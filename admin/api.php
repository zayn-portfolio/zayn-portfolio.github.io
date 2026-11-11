<?php
/* Admin Panel backend: login, save content, upload files, change password. */
declare(strict_types=1);
error_reporting(0);
ini_set('display_errors', '0');
$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
session_name('adminsess');
session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>$https,'httponly'=>true,'samesite'=>'Lax']);
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const ROOT_DIR = __DIR__ . '/..';
$AUTH_FILE = __DIR__ . '/auth.php';
$CONTENT   = ROOT_DIR . '/data/content.json';
$UPLOADS   = ROOT_DIR . '/uploads';
$TRIES     = __DIR__ . '/attempts.json';

function out(array $d, int $code = 200): never { http_response_code($code); echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }
function body(): array { $j = json_decode(file_get_contents('php://input') ?: '', true); return is_array($j) ? $j : []; }
function authData(): array { global $AUTH_FILE; return is_file($AUTH_FILE) ? (require $AUTH_FILE) : []; }
function writeAtomic(string $file, string $data): bool {
  $tmp = $file . '.tmp' . bin2hex(random_bytes(4));
  if (file_put_contents($tmp, $data, LOCK_EX) === false) return false;
  return rename($tmp, $file);
}
function requireAuth(): void {
  if (empty($_SESSION['in'])) out(['ok'=>false,'error'=>'Please log in again.','auth'=>false], 401);
  $t = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
  if (!hash_equals($_SESSION['csrf'] ?? '', $t)) out(['ok'=>false,'error'=>'Security check failed. Refresh the page and try again.'], 403);
}
function throttle(bool $record): ?int {
  global $TRIES; $ip = $_SERVER['REMOTE_ADDR'] ?? 'x'; $now = time();
  $all = is_file($TRIES) ? (json_decode((string)file_get_contents($TRIES), true) ?: []) : [];
  foreach ($all as $k => $v) if (($v['t'] ?? 0) < $now - 900) unset($all[$k]);
  $r = $all[$ip] ?? ['n'=>0,'t'=>$now];
  if ($record === false) { return ($r['n'] >= 5 && $r['t'] > $now - 600) ? 600 - ($now - $r['t']) : null; }
  $r['n']++; $r['t'] = $now; $all[$ip] = $r; @file_put_contents($TRIES, json_encode($all), LOCK_EX); return null;
}
function clearTries(): void { global $TRIES; $ip = $_SERVER['REMOTE_ADDR'] ?? 'x'; $all = is_file($TRIES) ? (json_decode((string)file_get_contents($TRIES), true) ?: []) : []; unset($all[$ip]); @file_put_contents($TRIES, json_encode($all), LOCK_EX); }

$action = $_GET['action'] ?? '';

if ($action === 'status') {
  if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(24));
  $a = authData();
  out(['ok'=>true,'loggedIn'=>!empty($_SESSION['in']),'csrf'=>$_SESSION['csrf'],'user'=>!empty($_SESSION['in']) ? ($a['user'] ?? '') : '','isDefault'=>!empty($_SESSION['in']) && !empty($a['default']),'maxUpload'=>min(return_bytes(ini_get('upload_max_filesize')), return_bytes(ini_get('post_max_size')))]);
}
function return_bytes(string $v): int { $v = trim($v); $n = (int)$v; return match (strtolower(substr($v, -1))) { 'g'=>$n*1073741824, 'm'=>$n*1048576, 'k'=>$n*1024, default=>$n }; }

if ($action === 'login') {
  if ($wait = throttle(false)) out(['ok'=>false,'error'=>'Too many wrong attempts. Please wait '.ceil($wait/60).' minute(s) and try again.'], 429);
  $b = body(); $a = authData();
  $okUser = isset($a['user']) && hash_equals((string)$a['user'], (string)($b['user'] ?? ''));
  $okPass = isset($a['hash']) && password_verify((string)($b['pass'] ?? ''), (string)$a['hash']);
  if ($okUser && $okPass) {
    clearTries(); session_regenerate_id(true);
    $_SESSION['in'] = true; $_SESSION['csrf'] = bin2hex(random_bytes(24));
    out(['ok'=>true,'csrf'=>$_SESSION['csrf'],'user'=>$a['user'],'isDefault'=>!empty($a['default'])]);
  }
  throttle(true); usleep(400000);
  out(['ok'=>false,'error'=>'Wrong username or password.'], 401);
}

if ($action === 'logout') { $_SESSION = []; session_destroy(); out(['ok'=>true]); }

if ($action === 'save') {
  requireAuth();
  $raw = file_get_contents('php://input') ?: '';
  if (strlen($raw) > 3000000) out(['ok'=>false,'error'=>'Content is too large.'], 413);
  $d = json_decode($raw, true);
  foreach (['theme','site','info','home','portfolio','about','services','contactPage'] as $k) if (!is_array($d) || !array_key_exists($k, $d)) out(['ok'=>false,'error'=>'Incomplete data, nothing was saved.'], 400);
  if (is_file($CONTENT)) @copy($CONTENT, ROOT_DIR . '/data/content.backup.json');
  $json = json_encode($d, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  if (!writeAtomic($CONTENT, $json)) out(['ok'=>false,'error'=>'Could not write the data folder. Set the "data" folder permission to 755 or 775 on your hosting.'], 500);
  out(['ok'=>true,'savedAt'=>date('H:i:s')]);
}

if ($action === 'upload') {
  requireAuth();
  $f = $_FILES['file'] ?? null;
  if (!$f) out(['ok'=>false,'error'=>'No file received. The file may be bigger than your hosting allows.'], 400);
  if ($f['error'] !== UPLOAD_ERR_OK) out(['ok'=>false,'error'=>in_array($f['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE]) ? 'That file is bigger than your hosting allows. Try a smaller file.' : 'Upload failed (code '.$f['error'].').'], 400);
  $ext = strtolower(pathinfo((string)$f['name'], PATHINFO_EXTENSION));
  $img = ['jpg','jpeg','png','webp','gif']; $vid = ['mp4','webm'];
  if (in_array($ext, $img, true)) {
    if ($f['size'] > 15*1048576) out(['ok'=>false,'error'=>'Image is over 15 MB.'], 400);
    $info = @getimagesize($f['tmp_name']);
    if (!$info || !in_array($info[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP, IMAGETYPE_GIF], true)) out(['ok'=>false,'error'=>'That file is not a valid image.'], 400);
  } elseif (in_array($ext, $vid, true)) {
    if ($f['size'] > 200*1048576) out(['ok'=>false,'error'=>'Video is over 200 MB.'], 400);
  } else out(['ok'=>false,'error'=>'Only JPG, PNG, WEBP, GIF images and MP4/WEBM videos are allowed.'], 400);
  if (!is_dir($UPLOADS)) @mkdir($UPLOADS, 0755, true);
  $name = date('ymd') . '-' . bin2hex(random_bytes(6)) . '.' . ($ext === 'jpeg' ? 'jpg' : $ext);
  if (!move_uploaded_file($f['tmp_name'], $UPLOADS . '/' . $name)) out(['ok'=>false,'error'=>'Could not save the file. Set the "uploads" folder permission to 755 or 775 on your hosting.'], 500);
  out(['ok'=>true,'path'=>'uploads/'.$name]);
}

if ($action === 'password') {
  requireAuth();
  $b = body(); $a = authData();
  if (!password_verify((string)($b['current'] ?? ''), (string)($a['hash'] ?? ''))) out(['ok'=>false,'error'=>'Your current password is not correct.'], 400);
  $nu = trim((string)($b['newUser'] ?? '')); $np = (string)($b['newPass'] ?? '');
  if (strlen($nu) < 3) out(['ok'=>false,'error'=>'Username must be at least 3 characters.'], 400);
  if (strlen($np) < 8) out(['ok'=>false,'error'=>'New password must be at least 8 characters.'], 400);
  if ($np === 'Admin@123') out(['ok'=>false,'error'=>'Please choose a password different from the default one.'], 400);
  $new = ['user'=>$nu,'hash'=>password_hash($np, PASSWORD_DEFAULT),'default'=>false];
  if (!writeAtomic($AUTH_FILE, "<?php\nreturn " . var_export($new, true) . ";\n")) out(['ok'=>false,'error'=>'Could not save. Set the "admin" folder permission to 755 or 775.'], 500);
  if (function_exists('opcache_invalidate')) @opcache_invalidate($AUTH_FILE, true);
  session_regenerate_id(true); $_SESSION['csrf'] = bin2hex(random_bytes(24));
  out(['ok'=>true,'csrf'=>$_SESSION['csrf'],'user'=>$nu]);
}

out(['ok'=>false,'error'=>'Unknown action.'], 400);
