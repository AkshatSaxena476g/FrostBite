import os
from supabase import create_client
from fastapi import HTTPException
from dotenv import load_dotenv
import logging

load_dotenv(".env.local")

logger = logging.getLogger(__name__)

class InventoryMonitor:
    def __init__(self):
        self.supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

    def get_all_items(self):
        try:
            result = self.supabase.table("inventory").select("*").order("created_at", desc=True).execute()
            return result.data
        except Exception as e:
            logger.error(f"Failed to fetch inventory items: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch inventory items")

    def delete_item(self, item_id: str):
        try:
            # First check if item exists
            existing = self.supabase.table("inventory").select("*").eq("id", item_id).execute()
            if not existing.data:
                raise HTTPException(status_code=404, detail="Item not found")
            
            # Delete the item
            result = self.supabase.table("inventory").delete().eq("id", item_id).execute()
            return {"message": "Item deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to delete item: {e}")
            raise HTTPException(status_code=500, detail="Failed to delete item")

    def update_item(self, item_id: str, update_data: dict):
        try:
            # First check if item exists
            existing = self.supabase.table("inventory").select("*").eq("id", item_id).execute()
            if not existing.data:
                raise HTTPException(status_code=404, detail="Item not found")

            # Validate numeric fields if they exist in update_data
            if "price" in update_data:
                try:
                    price_val = float(update_data["price"])
                    if price_val < 0:
                        raise ValueError("Price must be positive")
                    update_data["price"] = price_val
                except (ValueError, TypeError):
                    raise HTTPException(status_code=400, detail="Invalid price format")

            if "stock" in update_data:
                try:
                    stock_val = int(update_data["stock"])
                    if stock_val < 0:
                        raise ValueError("Stock must be positive")
                    update_data["stock"] = stock_val
                except (ValueError, TypeError):
                    raise HTTPException(status_code=400, detail="Invalid stock format")

            if "discount" in update_data:
                try:
                    discount_val = float(update_data["discount"])
                    if discount_val < 0 or discount_val > 100:
                        raise ValueError("Discount must be between 0 and 100")
                    update_data["discount"] = discount_val
                except (ValueError, TypeError):
                    raise HTTPException(status_code=400, detail="Invalid discount format")

            # Add updated_at timestamp
            update_data["updated_at"] = "now()"

            # Update the item
            result = self.supabase.table("inventory").update(update_data).eq("id", item_id).execute()
            
            if not result.data:
                raise HTTPException(status_code=500, detail="Update failed - no data returned")
            
            return result.data[0]
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to update item: {e}")
            raise HTTPException(status_code=500, detail="Failed to update item")