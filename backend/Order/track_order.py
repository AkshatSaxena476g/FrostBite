from supabase import create_client
import os
import logging
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TrackOrder:
    def __init__(self):
        self.supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

    def get_order_by_id(self, order_id):
        try:
            result = self.supabase.table("orders").select("*").eq("id", order_id).execute()
            if not result.data:
                return None
            
            order = result.data[0]
            order["estimated_delivery"] = self._calculate_estimated_delivery(order)
            return order
        except Exception as e:
            logger.error(f"Error fetching order: {e}")
            return None

    def get_orders_by_phone(self, phone):
        try:
            result = self.supabase.table("orders").select("*").eq("customer_phone", phone).order("order_time", desc=True).execute()
            if not result.data:
                return []
            
            # Add estimated delivery time to each order
            for order in result.data:
                order["estimated_delivery"] = self._calculate_estimated_delivery(order)
            
            return result.data
        except Exception as e:
            logger.error(f"Error fetching orders: {e}")
            return []

    def _calculate_estimated_delivery(self, order):
        order_time = datetime.fromisoformat(order["order_time"].replace("Z", "+00:00"))
        
        if order["order_status"] == "completed":
            return "Delivered"
        elif order["order_status"] == "shipped":
            # If shipped, delivery should be within 1-2 hours
            return (order_time + timedelta(hours=2)).strftime("%I:%M %p")
        elif order["order_status"] == "pending":
            # If pending, delivery should be within 2-3 hours
            return (order_time + timedelta(hours=3)).strftime("%I:%M %p")
        else:
            return "Not available" 