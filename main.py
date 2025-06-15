from fastapi import FastAPI, Request, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
import sys
import logging
from backend.Registeration.admin_form import AdminRegistration
from backend.Registeration.user_form import UserRegistration
from backend.Inventory.inventory_form import InventoryItem
from backend.Inventory.inventory_monitor import InventoryMonitor
from backend.Order.order import Order
from backend.Order.monitor_order import OrderMonitor
from backend.Order.track_order import TrackOrder

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

inventory_monitor = InventoryMonitor()
order_monitor = OrderMonitor()
track_order = TrackOrder()

@app.post("/api/admin/register")
async def register_admin(request: Request):
    try:
        data = await request.json()
        admin = AdminRegistration(
            full_name=data.get("fullName"),
            organization_name=data.get("organizationName"),
            email=data.get("email"),
            password=data.get("password"),
            confirm_password=data.get("confirmPassword"),
            access_code=data.get("accessCode")
        )
        admin.save()
        return JSONResponse({"message": "Admin registered successfully"})
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Admin registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/user/register")
async def register_user(request: Request):
    try:
        data = await request.json()
        user = UserRegistration(
            full_name=data.get("fullName"),
            email=data.get("email"),
            password=data.get("password"),
            confirm_password=data.get("confirmPassword")
        )
        user.save()
        return JSONResponse({"message": "User registered successfully"})
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"User registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/inventory/add")
async def add_inventory_item(
    itemName: str = Form(...),
    price: str = Form(...),
    stock: str = Form(...),
    tags: str = Form(""),
    discount: str = Form("")
):
    try:
        item = InventoryItem(
            item_name=itemName,
            price=price,
            stock=stock,
            tags=tags,
            discount=discount
        )
        result = item.save()
        
        return JSONResponse({"message": "Item added successfully", "data": result.data[0]})
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Unexpected error in add_inventory_item: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add item: {str(e)}")

@app.get("/api/inventory/list")
async def list_inventory_items():
    try:
        items = inventory_monitor.get_all_items()
        return items
    except Exception as e:
        logger.error(f"Error listing inventory items: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch inventory items")

@app.delete("/api/inventory/delete/{item_id}")
async def delete_inventory_item(item_id: str):
    try:
        return inventory_monitor.delete_item(item_id)
    except Exception as e:
        logger.error(f"Error deleting inventory item: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete item")

@app.put("/api/inventory/update/{item_id}")
async def update_inventory_item(
    item_id: str,
    itemName: str = Form(None),
    price: str = Form(None),
    stock: str = Form(None),
    tags: str = Form(None),
    discount: str = Form(None)
):
    try:
        update_data = {}
        if itemName:
            update_data["item_name"] = itemName
        if price is not None and price != "":
            update_data["price"] = float(price)
        if stock is not None and stock != "":
            update_data["stock"] = int(stock)
        if tags is not None:
            update_data["tags"] = tags
        if discount is not None and discount != "":
            update_data["discount"] = float(discount)

        result = inventory_monitor.update_item(item_id, update_data)
        return JSONResponse({"message": "Item updated successfully", "data": result})
        
    except Exception as e:
        logger.error(f"Error updating inventory item: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update item: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Backend server is running"}

# Order endpoints
@app.post("/api/orders/add")
async def add_order(
    item_id: str = Form(...),
    item_name: str = Form(...),
    quantity: str = Form(...),
    total_price: str = Form(...),
    customer_name: str = Form(...),
    customer_phone: str = Form(...),
    delivery_address: str = Form(None),
    user_id: str = Form(None)
):
    try:
        order = Order(
            item_id=item_id,
            item_name=item_name,
            quantity=quantity,
            total_price=total_price,
            customer_name=customer_name,
            customer_phone=customer_phone,
            delivery_address=delivery_address,
            user_id=user_id
        )
        result = order.save()
        return JSONResponse({"message": "Order placed successfully", "data": result.data[0]})
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Unexpected error in add_order: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to place order: {str(e)}")

@app.get("/api/orders/list")
async def list_orders():
    try:
        orders = order_monitor.get_all_orders()
        return orders
    except Exception as e:
        logger.error(f"Error listing orders: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch orders")

@app.put("/api/orders/update-status/{order_id}")
async def update_order_status(order_id: str, status: str = Form(...)):
    try:
        result = order_monitor.update_order_status(order_id, status)
        if result:
            return JSONResponse({"message": "Order status updated successfully", "data": result})
        raise HTTPException(status_code=404, detail="Order not found")
    except Exception as e:
        logger.error(f"Error updating order status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update order status")

@app.delete("/api/orders/delete/{order_id}")
async def delete_order(order_id: str):
    try:
        result = order_monitor.delete_order(order_id)
        if result:
            return JSONResponse({"message": "Order deleted successfully", "data": result})
        raise HTTPException(status_code=404, detail="Order not found")
    except Exception as e:
        logger.error(f"Error deleting order: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete order")

# Order tracking endpoints
@app.get("/api/orders/track/{order_id}")
async def track_order_by_id(order_id: str):
    try:
        order = track_order.get_order_by_id(order_id)
        if order:
            return order
        raise HTTPException(status_code=404, detail="Order not found")
    except Exception as e:
        logger.error(f"Error tracking order: {e}")
        raise HTTPException(status_code=500, detail="Failed to track order")

@app.get("/api/orders/track-by-phone/{phone}")
async def track_orders_by_phone(phone: str):
    try:
        orders = track_order.get_orders_by_phone(phone)
        return orders
    except Exception as e:
        logger.error(f"Error tracking orders: {e}")
        raise HTTPException(status_code=500, detail="Failed to track orders")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)