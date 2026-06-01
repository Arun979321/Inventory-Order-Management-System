from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Order, OrderItem, Product, Customer
from schemas import OrderCreate, OrderStatusUpdate, OrderResponse, OrderListResponse

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=201)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    total_amount = 0
    db_order = Order(customer_id=order.customer_id, status="pending")
    db.add(db_order)
    db.flush()

    for item in order.items:
        product = db.query(Product).with_for_update().filter(Product.id == item.product_id).first()
        if not product:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Product with id {item.product_id} not found")
        if product.stock_quantity < item.quantity:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for product: {product.name}"
            )
        product.stock_quantity -= item.quantity
        unit_price = product.price
        total_amount += float(unit_price) * item.quantity
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=unit_price
        )
        db.add(db_item)

    db_order.total_amount = total_amount
    db.commit()
    db.refresh(db_order)
    return db_order


@router.get("", response_model=List[OrderListResponse])
def list_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    result = []
    for o in orders:
        customer_name = o.customer.name if o.customer else None
        result.append(OrderListResponse(
            id=o.id,
            customer_id=o.customer_id,
            status=o.status,
            total_amount=o.total_amount,
            created_at=o.created_at,
            customer_name=customer_name
        ))
    return result


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, status_update: OrderStatusUpdate, db: Session = Depends(get_db)):
    valid_statuses = {"pending", "confirmed", "shipped", "delivered", "cancelled"}
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    db_order.status = status_update.status
    db.commit()
    db.refresh(db_order)
    return db_order


@router.delete("/{order_id}", status_code=204)
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    db_order.status = "cancelled"
    db.commit()
