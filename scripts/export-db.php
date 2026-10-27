<?php
// Exports stevenimanzi_db into a clean, Hostinger-ready SQL file

$dumpPath = 'C:\\Program Files\\MySQL\\MySQL Server 9.7\\bin\\mysqldump.exe';
$user = 'root';
$pass = 'Enterin@12';
$db = 'stevenimanzi_db';
$out = __DIR__ . '/../database/hostinger_import.sql';

if (!file_exists($dumpPath)) {
    // Attempt standard PATH
    $dumpPath = 'mysqldump';
}

$cmd = sprintf(
    '"%s" -u %s -p%s --set-gtid-purged=OFF --no-tablespaces --default-character-set=utf8mb4 %s --result-file="%s"',
    $dumpPath,
    $user,
    $pass,
    $db,
    $out
);

echo "Exporting database $db to $out...\n";
exec($cmd, $output, $code);

if ($code === 0 && file_exists($out)) {
    echo "SUCCESS: Database exported to database/hostinger_import.sql (" . round(filesize($out) / 1024, 2) . " KB)\n";
    echo "You can import this file into phpMyAdmin on Hostinger.\n";
} else {
    echo "ERROR: Failed to export database (Exit code: $code).\n";
}
