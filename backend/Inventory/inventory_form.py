import os
from supabase import create_client
from fastapi import HTTPException
from dotenv import load_dotenv
import logging

# Configure logging for better error tracking
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv(".env.local")

class InventoryItem:
    def __init__(self, item_name, price, stock, tags=None, discount=None):
        # Initialize inventory item with required and optional fields
        self.item_name = item_name
        self.price = price
        self.stock = stock
        self.tags = tags
        self.discount = discount
        self.supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

    def validate_data(self):
        # Validate all inventory item data before processing
        try:
            # Check required fields
            if not all([self.item_name, str(self.price), str(self.stock)]):
                raise HTTPException(status_code=400, detail="Item name, price, and stock are required")
            
            # Validate price format and value
            try:
                price_val = float(self.price)
                if price_val < 0:
                    raise HTTPException(status_code=400, detail="Price must be a positive number")
            except (ValueError, TypeError):
                raise HTTPException(status_code=400, detail="Invalid price format")
            
            # Validate stock format and value
            try:
                stock_val = int(self.stock)
                if stock_val < 0:
                    raise HTTPException(status_code=400, detail="Stock must be a positive number")
            except (ValueError, TypeError):
                raise HTTPException(status_code=400, detail="Invalid stock format")
            
            # Validate discount if provided
            if self.discount is not None and self.discount != "":
                try:
                    discount_val = float(self.discount)
                    if discount_val < 0 or discount_val > 100:
                        raise HTTPException(status_code=400, detail="Discount must be between 0 and 100")
                except (ValueError, TypeError):
                    logger.error(f"Invalid discount format: {self.discount}")
                    raise HTTPException(status_code=400, detail="Invalid discount format")

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Validation error: {e}")
            raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")

    def save(self):
        # Save validated inventory item to database
        try:
            # Validate data before saving
            self.validate_data()
            
            # Prepare data for database insertion
            data = {
                "item_name": self.item_name,
                "price": float(self.price),
                "stock": int(self.stock),
                "tags": self.tags if self.tags else "",
                "discount": float(self.discount) if self.discount else 0
            }
            
            # Insert data into Supabase
            result = self.supabase.table("inventory").insert(data).execute()
            
            if result.data:
                logger.info(f"Inventory item saved successfully: {self.item_name}")
                return result
            else:
                raise HTTPException(status_code=500, detail="Failed to save item to database")
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Save error: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to save item: {str(e)}")