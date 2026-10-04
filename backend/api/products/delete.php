<?php
declare(strict_types=1);
require_once __DIR__ . '/../shared/response.php'; require_once __DIR__ . '/../shared/request.php'; require_once __DIR__ . '/../shared/auth.php';
methodOnly('DELETE'); requireAdmin(); safeApi(function (): void { $db=apiDatabase(); $id=requestId(); $statement=$db->prepare('DELETE FROM products WHERE id=:id'); $statement->execute([':id'=>$id]); if(!$statement->rowCount()){jsonResponse(false,'Product not found.',null,[],404);} jsonResponse(true,'Product deleted successfully.'); });
