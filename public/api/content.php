<?php
// Website content API (services, projects, testimonials, settings)

declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    $pdo = getDb();

    if ($method === 'GET') {
        // Query services
        $stmt = $pdo->query('SELECT * FROM services ORDER BY order_index ASC');
        $services = array_map(function ($row) {
            $row['published'] = (bool)$row['published'];
            $row['deleted'] = (bool)$row['deleted'];
            $row['order'] = (int)$row['order_index'];
            unset($row['order_index']);
            return $row;
        }, $stmt->fetchAll());

        // Query projects
        $stmt = $pdo->query('SELECT * FROM projects ORDER BY order_index ASC');
        $projects = array_map(function ($row) {
            $row['published'] = (bool)$row['published'];
            $row['deleted'] = (bool)$row['deleted'];
            $row['order'] = (int)$row['order_index'];
            $row['images'] = json_decode($row['images'] ?? '[]', true) ?: [];
            unset($row['order_index']);
            return $row;
        }, $stmt->fetchAll());

        // Query testimonials
        $stmt = $pdo->query('SELECT * FROM testimonials ORDER BY order_index ASC');
        $testimonials = array_map(function ($row) {
            $row['published'] = (bool)$row['published'];
            $row['deleted'] = (bool)$row['deleted'];
            $row['order'] = (int)$row['order_index'];
            unset($row['order_index']);
            return $row;
        }, $stmt->fetchAll());

        // Query settings
        $stmt = $pdo->query('SELECT id, data FROM settings');
        $settingsRows = $stmt->fetchAll();
        $settings = [];
        foreach ($settingsRows as $row) {
            $settings[$row['id']] = json_decode($row['data'], true);
        }

        jsonResponse([
            'services' => $services,
            'projects' => $projects,
            'testimonials' => $testimonials,
            'settings' => $settings
        ]);
    }

    // All mutating methods require admin
    $admin = requireAdmin();
    $input = getJsonInput();
    $type = (string)($input['type'] ?? ($_GET['type'] ?? ''));

    if ($method === 'POST' || $method === 'PUT') {
        if ($type === 'service') {
            $item = $input['item'] ?? [];
            $id = trim((string)($item['id'] ?? ''));
            if (!$id) jsonError('Service ID is required');

            $stmt = $pdo->prepare('
                INSERT INTO services (id, order_index, title, tag, summary, details, image, published, deleted)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    order_index = VALUES(order_index),
                    title = VALUES(title),
                    tag = VALUES(tag),
                    summary = VALUES(summary),
                    details = VALUES(details),
                    image = VALUES(image),
                    published = VALUES(published),
                    deleted = VALUES(deleted)
            ');
            $stmt->execute([
                $id,
                (int)($item['order'] ?? $item['order_index'] ?? 0),
                (string)($item['title'] ?? ''),
                (string)($item['tag'] ?? ''),
                (string)($item['summary'] ?? ''),
                (string)($item['details'] ?? ''),
                (string)($item['image'] ?? ''),
                isset($item['published']) ? ((bool)$item['published'] ? 1 : 0) : 1,
                isset($item['deleted']) ? ((bool)$item['deleted'] ? 1 : 0) : 0
            ]);
            jsonResponse(['success' => true, 'id' => $id]);
        } elseif ($type === 'project') {
            $item = $input['item'] ?? [];
            $id = trim((string)($item['id'] ?? ''));
            if (!$id) jsonError('Project ID is required');

            $images = is_array($item['images'] ?? null) ? $item['images'] : [];
            $stmt = $pdo->prepare('
                INSERT INTO projects (id, order_index, name, type, description, link, images, published, deleted)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    order_index = VALUES(order_index),
                    name = VALUES(name),
                    type = VALUES(type),
                    description = VALUES(description),
                    link = VALUES(link),
                    images = VALUES(images),
                    published = VALUES(published),
                    deleted = VALUES(deleted)
            ');
            $stmt->execute([
                $id,
                (int)($item['order'] ?? $item['order_index'] ?? 0),
                (string)($item['name'] ?? ''),
                (string)($item['type'] ?? ''),
                (string)($item['description'] ?? ''),
                (string)($item['link'] ?? ''),
                json_encode($images),
                isset($item['published']) ? ((bool)$item['published'] ? 1 : 0) : 1,
                isset($item['deleted']) ? ((bool)$item['deleted'] ? 1 : 0) : 0
            ]);
            jsonResponse(['success' => true, 'id' => $id]);
        } elseif ($type === 'testimonial') {
            $item = $input['item'] ?? [];
            $id = trim((string)($item['id'] ?? ''));
            if (!$id) jsonError('Testimonial ID is required');

            $stmt = $pdo->prepare('
                INSERT INTO testimonials (id, order_index, name, role, text, published, deleted)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    order_index = VALUES(order_index),
                    name = VALUES(name),
                    role = VALUES(role),
                    text = VALUES(text),
                    published = VALUES(published),
                    deleted = VALUES(deleted)
            ');
            $stmt->execute([
                $id,
                (int)($item['order'] ?? $item['order_index'] ?? 0),
                (string)($item['name'] ?? ''),
                (string)($item['role'] ?? ''),
                (string)($item['text'] ?? ''),
                isset($item['published']) ? ((bool)$item['published'] ? 1 : 0) : 1,
                isset($item['deleted']) ? ((bool)$item['deleted'] ? 1 : 0) : 0
            ]);
            jsonResponse(['success' => true, 'id' => $id]);
        } elseif ($type === 'settings') {
            $settingId = trim((string)($input['settingId'] ?? ''));
            $data = $input['data'] ?? [];
            if (!$settingId) jsonError('Setting ID is required');

            $stmt = $pdo->prepare('
                INSERT INTO settings (id, data)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE data = VALUES(data)
            ');
            $stmt->execute([$settingId, json_encode($data)]);
            jsonResponse(['success' => true, 'id' => $settingId]);
        } else {
            jsonError('Invalid content type');
        }
    } elseif ($method === 'DELETE') {
        $id = trim((string)($_GET['id'] ?? $input['id'] ?? ''));
        if (!$id) jsonError('Item ID is required');

        $table = match ($type) {
            'service' => 'services',
            'project' => 'projects',
            'testimonial' => 'testimonials',
            default => null
        };
        if (!$table) jsonError('Invalid type for deletion');

        $stmt = $pdo->prepare("DELETE FROM $table WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(['success' => true, 'deleted' => $id]);
    } else {
        jsonError('Method not allowed', 405);
    }
} catch (\Throwable $e) {
    jsonError('Database error: ' . $e->getMessage(), 500);
}
