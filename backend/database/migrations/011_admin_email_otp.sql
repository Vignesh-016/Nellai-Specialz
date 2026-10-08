-- Add email_verified_at column
ALTER TABLE admin_users ADD COLUMN email_verified_at DATETIME NULL AFTER password_hash;

-- Set existing verified users to ACTIVE (assuming those with non-null created_at are verified)
UPDATE admin_users
SET status = 'ACTIVE'
WHERE email_verified_at IS NOT NULL AND status = 'PENDING';

-- Ensure status is one of the allowed values (PENDING, ACTIVE, DISABLED, INACTIVE)
-- The existing alter already does this, but good to be explicit if we added a new enum value.
-- Since the enum already exists, we don't need to redefine it.

-- Create OTP table
CREATE TABLE IF NOT EXISTS admin_email_otps (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  purpose VARCHAR(40) NOT NULL DEFAULT 'SIGNUP',
  expires_at DATETIME NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_admin_otp_lookup (email, purpose, used_at, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
