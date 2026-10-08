<?php
declare(strict_types=1);
require_once __DIR__ . '/../../config/database.php'; require_once __DIR__ . '/../shared/response.php'; require_once __DIR__ . '/../shared/request.php'; require_once __DIR__ . '/otp-mail.php';
methodOnly('POST');
safeApi(function (): void {
    $i=jsonRequest(); $name=inputString($i,'name',true); $email=strtolower(trim((string)inputString($i,'email',true))); $password=(string)inputString($i,'password',true); $confirm=(string)inputString($i,'confirm_password',true);
    if(!filter_var($email,FILTER_VALIDATE_EMAIL))jsonResponse(false,'Valid email required.',null,['email'=>'Invalid email.'],422);
    if(strlen($password)<8||$password!==$confirm)jsonResponse(false,'Password validation failed.',null,['password'=>'Password must be at least 8 characters and match confirmation.'],422);
    $db=getDbConnection();if(!$db)jsonResponse(false,'Database connection unavailable.',null,[],503);
    $a=$db->prepare('SELECT id FROM admin_users WHERE email=:email LIMIT 1');$a->execute([':email'=>$email]);if($a->fetch())jsonResponse(false,'An admin account already exists with this email.',null,[],409);
    $hash=password_hash($password,PASSWORD_DEFAULT);$p=$db->prepare('SELECT id FROM admin_pending_registrations WHERE email=:email AND expires_at>NOW() LIMIT 1');$p->execute([':email'=>$email]);
    if($p->fetch()){$u=$db->prepare('UPDATE admin_pending_registrations SET name=:name,password_hash=:hash,expires_at=DATE_ADD(NOW(),INTERVAL 30 MINUTE) WHERE email=:email');$u->execute([':name'=>$name,':hash'=>$hash,':email'=>$email]);}else{$db->prepare('DELETE FROM admin_pending_registrations WHERE email=:email')->execute([':email'=>$email]);$u=$db->prepare('INSERT INTO admin_pending_registrations(name,email,password_hash,expires_at) VALUES(:name,:email,:hash,DATE_ADD(NOW(),INTERVAL 30 MINUTE))');$u->execute([':name'=>$name,':email'=>$email,':hash'=>$hash]);}
    $db->prepare("UPDATE admin_email_otps SET used_at=NOW() WHERE email=:email AND purpose='SIGNUP' AND used_at IS NULL")->execute([':email'=>$email]);$otp=(string)random_int(100000,999999);$q=$db->prepare("INSERT INTO admin_email_otps(email,otp_hash,purpose,expires_at) VALUES(:email,:hash,'SIGNUP',DATE_ADD(NOW(),INTERVAL 10 MINUTE))");$q->execute([':email'=>$email,':hash'=>password_hash($otp,PASSWORD_DEFAULT)]);
    if(!sendAdminOtpEmail($email,$otp))jsonResponse(false,'We could not send the verification email. Please try again or resend the code.',null,[],503);jsonResponse(true,'Verification code sent to your email.',['email'=>$email],[],200);
});
