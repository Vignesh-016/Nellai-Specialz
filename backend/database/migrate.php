<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$db = getDbConnection();
if (!$db) { fwrite(STDERR, "Database connection unavailable.\n"); exit(1); }
$db->exec('CREATE TABLE IF NOT EXISTS schema_migrations (filename VARCHAR(255) PRIMARY KEY, applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB');
$files = glob(__DIR__ . '/migrations/*.sql') ?: [];
sort($files, SORT_NATURAL);
$check = $db->prepare('SELECT 1 FROM schema_migrations WHERE filename = :filename');
$mark = $db->prepare('INSERT INTO schema_migrations(filename) VALUES(:filename)');
foreach ($files as $file) {
    $filename = basename($file);
    $check->execute([':filename' => $filename]);
    if ($check->fetchColumn()) { echo "Skipped {$filename}\n"; continue; }
    $db->beginTransaction();
    try {
        $db->exec((string) file_get_contents($file));
        if (!$db->inTransaction()) {
            $db->beginTransaction();
        }
        $mark->execute([':filename' => $filename]);
        $db->commit();
        echo "Applied {$filename}\n";
    } catch (Throwable $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        fwrite(STDERR, "Failed {$filename}: {$e->getMessage()}\n");
        exit(1);
    }
}
