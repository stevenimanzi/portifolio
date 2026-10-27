<?php
// Contact form messages API

declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    $pdo = getDb();

    if ($method === 'POST') {
        $input = getJsonInput();
        $name = trim((string)($input['name'] ?? ''));
        $email = trim((string)($input['email'] ?? ''));
        $subject = trim((string)($input['subject'] ?? ''));
        $message = trim((string)($input['message'] ?? ''));

        // Validation matching previous Firestore rules
        if (mb_strlen($name) < 1 || mb_strlen($name) > 100) {
            jsonError('Please provide a valid name (1-100 characters)');
        }
        if (mb_strlen($email) < 5 || mb_strlen($email) > 200 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonError('Please provide a valid email address');
        }
        if (mb_strlen($subject) < 1 || mb_strlen($subject) > 150) {
            jsonError('Please provide a subject (1-150 characters)');
        }
        if (mb_strlen($message) < 1 || mb_strlen($message) > 5000) {
            jsonError('Please provide a message (1-5000 characters)');
        }

        $stmt = $pdo->prepare('
            INSERT INTO messages (name, email, subject, message, is_read, created_at)
            VALUES (?, ?, ?, ?, 0, NOW())
        ');
        $stmt->execute([$name, $email, $subject, $message]);

        jsonResponse([
            'success' => true,
            'id' => (int)$pdo->lastInsertId(),
            'message' => 'Your message has been sent successfully!'
        ], 201);
    }

    // Admin endpoints
    $admin = requireAdmin();

    if ($method === 'GET') {
        $stmt = $pdo->query('
            SELECT id, name, email, subject, message, is_read AS `read`, created_at AS createdAt
            FROM messages
            ORDER BY created_at DESC
            LIMIT 300
        ');
        $rows = array_map(function ($r) {
            $r['id'] = (string)$r['id'];
            $r['read'] = (bool)$r['read'];
            return $r;
        }, $stmt->fetchAll());
        jsonResponse($rows);
    } elseif ($method === 'PATCH') {
        $input = getJsonInput();
        $id = (int)($input['id'] ?? ($_GET['id'] ?? 0));
        $read = isset($input['read']) ? ((bool)$input['read'] ? 1 : 0) : 1;

        if ($id <= 0) jsonError('Invalid message ID');

        $stmt = $pdo->prepare('UPDATE messages SET is_read = ? WHERE id = ?');
        $stmt->execute([$read, $id]);
        jsonResponse(['success' => true, 'id' => $id, 'read' => (bool)$read]);
    } elseif ($method === 'DELETE') {
        $id = (int)($_GET['id'] ?? (getJsonInput()['id'] ?? 0));
        if ($id <= 0) jsonError('Invalid message ID');

        $stmt = $pdo->prepare('DELETE FROM messages WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse(['success' => true, 'deleted' => $id]);
    } else {
        jsonError('Method not allowed', 405);
    }
} catch (\Throwable $e) {
    jsonError('Database error: ' . $e->getMessage(), 500);
}
