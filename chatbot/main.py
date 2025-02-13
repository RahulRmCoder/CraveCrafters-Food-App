from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
import os
from groq import Groq
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
import json
from datetime import datetime
from bson import ObjectId
import requests

app = FastAPI()

# MongoDB Configuration
MONGODB_URL = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGODB_URL)
db = client.craveCraftersDB
dishes_collection = db.dishes
orders_collection = db.orders
users_collection = db.users

# Load environment variables
GROQ_API_KEY = 'Your API Key'
NODE_SERVER_URL = os.getenv('NODE_SERVER_URL', 'http://localhost:3019')

# Initialize Groq client
groq_client = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model_name='mixtral-8x7b-32768'
)

# Define models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    userId: Optional[str] = None

class MenuItem(BaseModel):
    name: str
    category: str
    description: str
    price: float
    isVeg: bool
    tags: List[str]
    imageUrl: str
    rating: float

class OrderItem(BaseModel):
    name: str
    price: float
    quantity: int

class OrderRequest(BaseModel):
    userId: str
    items: List[OrderItem]
    address: str
    totalAmount: float

# Enhanced system prompt
SYSTEM_PROMPT = """
You are a customer service chatbot for CraveCrafters, an authentic Indian restaurant.

Key Functions:
1. Menu Display:
   - Show complete menu with categories
   - Display prices, descriptions, and veg/non-veg status
   - Indicate ratings and special tags

2. Order Processing:
   - Help customers select items
   - Ask for quantities
   - Calculate total amount
   - Collect delivery address
   - Confirm order details

3. General Information:
   - Explain dishes and ingredients
   - Answer questions about spice levels
   - Provide recommendations based on preferences

When taking orders:
- Clearly confirm each item and quantity
- Calculate and show the total
- Verify the delivery address
- Process the order through our system

Be friendly, helpful, and knowledgeable about Indian cuisine. If you don't understand a request, ask for clarification.
"""

async def get_menu():
    """Fetch menu from MongoDB"""
    try:
        menu_items = []
        cursor = dishes_collection.find({})
        async for document in cursor:
            document['_id'] = str(document['_id'])
            menu_items.append(document)
        return menu_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching menu: {str(e)}")

async def format_menu(menu_data):
    """Format menu data into a readable string"""
    formatted_menu = "🍽️ CraveCrafters Menu 🍽️\n\n"
    
    categories = {}
    for item in menu_data:
        category = item.get('category', 'Other')
        if category not in categories:
            categories[category] = []
        categories[category].append(item)
    
    for category in sorted(categories.keys()):
        formatted_menu += f"📌 {category.upper()}\n"
        formatted_menu += "─" * 40 + "\n"
        
        sorted_items = sorted(categories[category], key=lambda x: x['name'])
        for item in sorted_items:
            veg_status = "🌱" if item.get('isVeg', False) else "🍖"
            formatted_menu += f"{item['name']} {veg_status}\n"
            if item.get('description'):
                formatted_menu += f"   {item['description']}\n"
            formatted_menu += f"   ₹{item['price']:.2f}"
            if item.get('rating'):
                formatted_menu += f" | Rating: {'⭐' * round(item['rating'])}"
            if item.get('tags'):
                formatted_menu += f"\n   Tags: {', '.join(item['tags'])}"
            formatted_menu += "\n\n"
    
    return formatted_menu

async def parse_order_items(message: str):
    """Parse order items and quantities from message"""
    try:
        menu_data = await get_menu()
        menu_items = {item['name'].lower(): item for item in menu_data}
        
        # Extract quantities and items
        order_items = []
        words = message.lower().split()
        current_quantity = 1
        current_item = []
        
        for word in words:
            if word.isdigit():
                current_quantity = int(word)
            else:
                current_item.append(word)
                full_item = " ".join(current_item)
                
                # Check if we have a complete item name
                for menu_item_name in menu_items:
                    if menu_item_name in full_item:
                        item_data = menu_items[menu_item_name]
                        order_items.append({
                            "name": item_data['name'],
                            "price": item_data['price'],
                            "quantity": current_quantity
                        })
                        current_item = []
                        current_quantity = 1
                        break
        
        return order_items
    except Exception as e:
        print(f"Error parsing order items: {str(e)}")
        return []

async def create_order(user_id: str, items: List[dict], address: str, total_amount: float):
    """Create order in MongoDB"""
    try:
        order = {
            "userId": ObjectId(user_id),
            "items": items,
            "address": address,
            "totalAmount": total_amount,
            "orderDate": datetime.utcnow(),
            "status": "Pending"
        }
        result = await orders_collection.insert_one(order)
        
        # Update user's order history
        await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"orderHistory": result.inserted_id}}
        )
        
        # Send order confirmation email
        try:
            requests.post(f"{NODE_SERVER_URL}/send-order-confirmation-email/{str(result.inserted_id)}")
        except Exception as e:
            print(f"Error sending confirmation email: {str(e)}")
        
        return str(result.inserted_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        message_history = [HumanMessage(content=SYSTEM_PROMPT)]
        
        # Add conversation history
        for msg in request.messages[-5:]:
            if msg.role == "human":
                message_history.append(HumanMessage(content=msg.content))
            else:
                message_history.append(AIMessage(content=msg.content))

        latest_message = request.messages[-1].content.lower()
        
        # Handle menu request
        if "menu" in latest_message:
            menu_data = await get_menu()
            formatted_menu = await format_menu(menu_data)
            return {
                "role": "assistant",
                "content": formatted_menu + "\n\nWould you like to place an order? Just tell me what items you'd like!"
            }
        
        # Handle order intent
        elif "order" in latest_message:
            order_items = await parse_order_items(latest_message)
            
            if order_items:
                total = sum(item['price'] * item['quantity'] for item in order_items)
                
                order_summary = "Here's your order summary:\n\n"
                for item in order_items:
                    order_summary += f"• {item['name']} x{item['quantity']} - ₹{item['price'] * item['quantity']:.2f}\n"
                order_summary += f"\nTotal Amount: ₹{total:.2f}\n\n"
                
                if request.userId:
                    order_summary += "Please provide your delivery address to complete the order."
                else:
                    order_summary += "Please log in to place your order."
                
                return {
                    "role": "assistant",
                    "content": order_summary
                }
            else:
                return {
                    "role": "assistant",
                    "content": "I can help you place an order! Please tell me what items you'd like to order and their quantities (e.g., 'I want 2 Butter Chicken and 1 Naan')."
                }
        
        # Handle address provision for order
        elif request.userId and any(word in latest_message for word in ["address", "deliver", "location"]):
            # Extract address from message
            address = latest_message.replace("address", "").replace("deliver", "").replace("location", "").strip()
            
            if address:
                # Get the last order items from conversation history
                order_items = []
                for msg in reversed(request.messages[:-1]):
                    if msg.role == "assistant" and "order summary" in msg.content.lower():
                        # Parse the previous order summary
                        order_items = await parse_order_items(msg.content)
                        break
                
                if order_items:
                    total = sum(item['price'] * item['quantity'] for item in order_items)
                    order_id = await create_order(request.userId, order_items, address, total)
                    
                    return {
                        "role": "assistant",
                        "content": f"Great! I've placed your order (Order ID: {order_id}). "
                                 f"You'll receive a confirmation email shortly with delivery updates. "
                                 f"Thank you for ordering from CraveCrafters!"
                    }
        
        # Regular chat flow
        prompt = ChatPromptTemplate.from_messages([
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}")
        ])
        
        chain = prompt | groq_client
        response = chain.invoke({
            "history": message_history,
            "input": latest_message
        })
        
        response_content = response.content if hasattr(response, 'content') else str(response)
        
        return {
            "role": "assistant",
            "content": response_content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/place-order")
async def place_order_endpoint(order: OrderRequest):
    try:
        order_id = await create_order(
            order.userId,
            [{
                "name": item.name,
                "price": item.price,
                "quantity": item.quantity
            } for item in order.items],
            order.address,
            order.totalAmount
        )
        return {"success": True, "orderId": order_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
