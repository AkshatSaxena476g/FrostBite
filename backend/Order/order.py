from fastapi import HTTPException
from supabase import create_client
import os
import logging

# Configure logging for better error tracking
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Order:
    def __init__(self, item_id, item_name, quantity, total_price, customer_name, customer_phone, delivery_address=None, user_id=None):
        # Initialize order with required and optional fields
        self.item_id = item_id
        self.item_name = item_name
        self.quantity = quantity
        self.total_price = total_price
        self.customer_name = customer_name
        self.customer_phone = customer_phone
        self.delivery_address = delivery_address
        self.user_id = user_id
        self.supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

    def validate_data(self):
        # Validate all order data before processing
        try:
            # Check required fields
            if not all([self.item_id, self.item_name, self.quantity, self.total_price, self.customer_name, self.customer_phone]):
                raise HTTPException(status_code=400, detail="Missing required fields")

            # Validate quantity
            try:
                quantity_val = int(self.quantity)
                if quantity_val <= 0:
                    raise HTTPException(status_code=400, detail="Quantity must be positive")
            except (ValueError, TypeError):
                raise HTTPException(status_code=400, detail="Invalid quantity format")

            # Validate price
            try:
                price_val = float(self.total_price)
                if price_val <= 0:
                    raise HTTPException(status_code=400, detail="Total price must be positive")
            except (ValueError, TypeError):
                raise HTTPException(status_code=400, detail="Invalid price format")

            # Validate phone number - must be exactly 10 digits
            if not self.customer_phone.isdigit() or len(self.customer_phone) != 10:
                raise HTTPException(status_code=400, detail="Phone number must be exactly 10 digits")

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Validation error: {e}")
            raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")

    def save(self):
        # Save validated order to database
        try:
            # Validate data before saving
            self.validate_data()
            
            # Prepare data for database insertion
            data = {
                "item_id": self.item_id,
                "item_name": self.item_name,
                "quantity": int(self.quantity),
                "total_price": float(self.total_price),
                "customer_name": self.customer_name,
                "customer_phone": self.customer_phone,
                "delivery_address": self.delivery_address,
                "user_id": self.user_id,
                "order_status": "pending"
            }
            
            # Insert data into Supabase
            result = self.supabase.table("orders").insert(data).execute()
            
            if result.data:
                logger.info(f"Order saved successfully: {self.item_name} x {self.quantity}")
                return result
            else:
                raise HTTPException(status_code=500, detail="Failed to save order to database")
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Save error: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to save order: {str(e)}") 