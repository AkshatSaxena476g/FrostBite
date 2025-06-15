from supabase import create_client
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OrderMonitor:
    def __init__(self):
        self.supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

    def get_all_orders(self):
        try:
            result = self.supabase.table("orders").select("*").order("order_time", desc=True).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error fetching orders: {e}")
            return []

    def update_order_status(self, order_id, new_status):
        try:
            result = self.supabase.table("orders").update({"order_status": new_status}).eq("id", order_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error updating order status: {e}")
            return None

    def delete_order(self, order_id):
        try:
            result = self.supabase.table("orders").delete().eq("id", order_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error deleting order: {e}")
            return None 