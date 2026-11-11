<?php
// PHP built-in server router
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?? '');

// If accessing /admin without trailing slash, redirect to /admin/
if ($uri === '/admin') {
    header('Location: /admin/', true, 301);
    exit;
}

$file = __DIR__ . $uri;

// Serve existing files
if ($uri !== '/' && file_exists($file) && !is_dir($file)) {
    return false;
}

// Serve directories with index
if (is_dir($file)) {
    if (file_exists($file . '/index.html') || file_exists($file . '/index.php')) {
        return false;
    }
}

return false;
