-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES register_user(id),
    item_id UUID REFERENCES inventory(id),
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    order_status TEXT NOT NULL DEFAULT 'pending',
    order_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivery_address TEXT,
    customer_name TEXT NOT NULL,
    customer_phone NUMERIC(10) NOT NULL UNIQUE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status); 