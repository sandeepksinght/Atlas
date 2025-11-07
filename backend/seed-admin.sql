-- Seed script to create initial dStudio Admin user
-- This should be run after the database is initialized

-- First, check if admin exists
DO $$
DECLARE
    admin_exists boolean;
BEGIN
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'admin@dstudio.com') INTO admin_exists;

    IF NOT admin_exists THEN
        -- Create dStudio Admin user
        -- Email: admin@dstudio.com
        -- Password: Admin@123 (hashed with bcrypt)
        -- Password hash for 'Admin@123' using bcrypt with 10 rounds
        INSERT INTO users (
            email,
            password_hash,
            full_name,
            role,
            is_active,
            organization_id
        ) VALUES (
            'admin@dstudio.com',
            '$2a$10$8ZqVZ1QZ5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5',  -- This needs to be replaced with actual hash
            'dStudio Administrator',
            'dstudio_admin',
            true,
            NULL  -- dStudio admins don't belong to any organization
        );

        RAISE NOTICE 'dStudio Admin user created successfully!';
        RAISE NOTICE 'Email: admin@dstudio.com';
        RAISE NOTICE 'Password: Admin@123';
        RAISE NOTICE '';
        RAISE NOTICE 'IMPORTANT: Change this password immediately after first login!';
    ELSE
        RAISE NOTICE 'dStudio Admin user already exists. Skipping creation.';
    END IF;
END $$;
