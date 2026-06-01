from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import products, customers, orders, inventory

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory & Order Management System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(inventory.router)


@app.get("/")
def root():
    return {"message": "Inventory & Order Management System API", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
