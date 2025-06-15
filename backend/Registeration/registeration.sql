-- Admin Registration Table
CREATE TABLE IF NOT EXISTS register_admin (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    organization_name TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    confirm_password TEXT NOT NULL,
    access_code TEXT NOT NULL UNIQUE,
    auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- User Registration Table
CREATE TABLE IF NOT EXISTS register_user (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    confirm_password TEXT NOT NULL,
    auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
); 