# Database setup

1. Create the `nellai_specialz` MySQL database with `utf8mb4` support.
2. Configure the existing credentials in `backend/config/database.php`.
3. Run migrations `001` through `006` in filename order.
4. Create the first admin account with the CLI bootstrap script:

```text
php backend/database/create_admin.php
```

The script prompts for the name, email, and password. It never stores a plaintext password.

The migration files use `CREATE TABLE IF NOT EXISTS` and do not delete or alter existing tables.
