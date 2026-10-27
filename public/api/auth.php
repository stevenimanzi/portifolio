<?php
// Admin authentication API

declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'POST') {
    $input = getJsonInput();
    $email = trim((string)($input['email'] ?? ''));
    $password = (string)($input['password'] ?? '');

    if ($email === '' || $password === '') {
        jsonError('Email and password are required', 400);
    }

    try {
        $pdo = getDb();
        $stmt = $pdo->prepare('SELECT id, email, password_hash, display_name FROM admins WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $admin = $stmt->fetch();

        if (!$admin || !password_verify($password, $admin['password_hash'])) {
            jsonError('Invalid email or password', 401);
        }

        $token = createToken($admin['email'], $admin['display_name']);
        jsonResponse([
            'success' => true,
            'token' => $token,
            'user' => [
                'email' => $admin['email'],
                'displayName' => $admin['display_name']
            ]
        ]);
    } catch (\Throwable $e) {
        jsonError('Server error: ' . $e->getMessage(), 500);
    }
} elseif ($method === 'GET') {
    $user = requireAdmin();
    jsonResponse([
        'authenticated' => true,
        'user' => [
            'email' => $user['email'],
            'displayName' => $user['displayName']
        ]
    ]);
} else {
    jsonError('Method not allowed', 405);
}
