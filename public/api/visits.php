<?php
// Visitor tracking and analytics API

declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    $pdo = getDb();

    if ($method === 'POST') {
        $input = getJsonInput();
        $path = mb_substr(trim((string)($input['path'] ?? '')), 0, 200);
        $referrer = mb_substr(trim((string)($input['referrer'] ?? '')), 0, 200);
        $newVisitor = !empty($input['newVisitor']) ? 1 : 0;
        $device = in_array($input['device'] ?? '', ['mobile', 'tablet', 'desktop'], true) ? $input['device'] : 'desktop';
        $lang = mb_substr(trim((string)($input['lang'] ?? '')), 0, 20);
        $country = mb_substr(strtoupper(trim((string)($input['country'] ?? ''))), 0, 5);
        $city = mb_substr(trim((string)($input['city'] ?? '')), 0, 100);
        $lat = isset($input['lat']) && is_numeric($input['lat']) ? (float)$input['lat'] : null;
        $lng = isset($input['lng']) && is_numeric($input['lng']) ? (float)$input['lng'] : null;

        if ($path === '') {
            jsonError('Path is required');
        }

        $stmt = $pdo->prepare('
            INSERT INTO visits (path, referrer, is_new_visitor, device, lang, country, city, lat, lng, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ');
        $stmt->execute([$path, $referrer, $newVisitor, $device, $lang, $country, $city, $lat, $lng]);

        jsonResponse(['success' => true]);
    }

    // Admin analytics
    $admin = requireAdmin();

    if ($method === 'GET') {
        // Recent visits for visitor map & logs
        $stmt = $pdo->query('
            SELECT id, path, referrer, is_new_visitor AS newVisitor, device, lang, country, city, lat, lng, created_at AS createdAt
            FROM visits
            ORDER BY created_at DESC
            LIMIT 500
        ');
        $visits = array_map(function ($r) {
            $r['id'] = (string)$r['id'];
            $r['newVisitor'] = (bool)$r['newVisitor'];
            $r['lat'] = $r['lat'] !== null ? (float)$r['lat'] : null;
            $r['lng'] = $r['lng'] !== null ? (float)$r['lng'] : null;
            return $r;
        }, $stmt->fetchAll());

        // Aggregate statistics
        $totalVisits = (int)$pdo->query('SELECT COUNT(*) FROM visits')->fetchColumn();
        $uniqueVisitors = (int)$pdo->query('SELECT COUNT(*) FROM visits WHERE is_new_visitor = 1')->fetchColumn();

        jsonResponse([
            'visits' => $visits,
            'summary' => [
                'totalVisits' => $totalVisits,
                'uniqueVisitors' => $uniqueVisitors
            ]
        ]);
    } else {
        jsonError('Method not allowed', 405);
    }
} catch (\Throwable $e) {
    jsonError('Database error: ' . $e->getMessage(), 500);
}
