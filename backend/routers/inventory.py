from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Product
from schemas import InventoryResponse, InventoryUpdate

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


@router.get("", response_model=List[InventoryResponse])
def list_inventory(db: Session = Depends(get_db)):
    return db.query(Product).all()


@router.put("/{product_id}", response_model=InventoryResponse)
def update_inventory(product_id: int, inventory: InventoryUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if inventory.stock_quantity < 0:
        raise HTTPException(status_code=400, detail="Stock quantity cannot be negative")
    product.stock_quantity = inventory.stock_quantity
    db.commit()
    db.refresh(product)
    return product
