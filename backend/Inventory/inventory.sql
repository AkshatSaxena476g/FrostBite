-- Create storage bucket for inventory images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('inventory_images', 'inventory_images', true)
ON CONFLICT (id) DO NOTHING;

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name TEXT NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL,
    image_url TEXT,
    tags TEXT,
    discount DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);