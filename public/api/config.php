<?php
// Database configuration and PDO helper
// Works both locally and on Hostinger

declare(strict_types=1);

// Allow cross-origin requests during local development
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json; charset=utf-8');

// Environment variables or fallback credentials
// For Hostinger: you can set these or edit the fallback strings below
$DB_HOST = getenv('DB_HOST') ?: '127.0.0.1';
$DB_NAME = getenv('DB_NAME') ?: 'stevenimanzi_db';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASS') !== false ? getenv('DB_PASS') : 'Enterin@12';
$JWT_SECRET = getenv('JWT_SECRET') ?: 'stevenimanzi_secret_key_kigali_2026';

function getDb(): PDO {
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS;
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
    }
    return $pdo;
}

function jsonResponse(mixed $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit();
}

function jsonError(string $message, int $status = 400): void {
    jsonResponse(['error' => $message], $status);
}

function getJsonInput(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// Simple token authentication
function createToken(string $email, string $displayName): string {
    global $JWT_SECRET;
    $payload = [
        'email' => $email,
        'displayName' => $displayName,
        'exp' => time() + (86400 * 30) // 30 days
    ];
    $json = json_encode($payload);
    $b64 = rtrim(strtr(base64_encode($json), '+/', '-_'), '=');
    $sig = hash_hmac('sha256', $b64, $JWT_SECRET);
    return "$b64.$sig";
}

function verifyToken(?string $authHeader): ?array {
    global $JWT_SECRET;
    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        return null;
    }
    $token = substr($authHeader, 7);
    $parts = explode('.', $token);
    if (count($parts) !== 2) return null;

    [$b64, $sig] = $parts;
    $expected = hash_hmac('sha256', $b64, $JWT_SECRET);
    if (!hash_equals($expected, $sig)) return null;

    $json = base64_decode(strtr($b64, '-_', '+/'));
    $payload = json_decode($json, true);
    if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
        return null;
    }
    return $payload;
}

function requireAdmin(): array {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $user = verifyToken($authHeader);
    if (!$user) {
        jsonError('Unauthorized', 401);
    }
    return $user;
}
