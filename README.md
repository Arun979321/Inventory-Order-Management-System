# Inventory & Order Management System

A full-stack, containerized web application for managing products, customers, orders, and inventory. Built with **FastAPI + React + PostgreSQL + Docker**.

## Tech Stack

| Layer     | Technology                           |
| --------- | ------------------------------------ |
| Backend   | Python 3.12, FastAPI, SQLAlchemy     |
| Frontend  | React 18, React Router, Axios        |
| Database  | PostgreSQL 15                        |
| Container | Docker, Docker Compose               |

## Project Structure

```
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── routers/
│   │   ├── products.py
│   │   ├── customers.py
│   │   ├── orders.py
│   │   └── inventory.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── api/
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
├── init.sql
└── README.md
```

## Setup

### Clone & Configure

```powershell
git clone https://github.com/Arun979321/Inventory-Order-Management-System.git
cd Inventory-Order-Management-System
# Recommended on Windows — handle CRLF line endings automatically
git config core.autocrlf true
```

**Common Git Workflow (PowerShell):**
```powershell
git checkout -b feature/your-feature-name
git add .
git commit -m "Describe your change"
git push origin feature/your-feature-name
```

### Local Development (without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your PostgreSQL connection string
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### Docker (recommended)

```bash
docker-compose up --build
```

This starts:
- PostgreSQL on port **5432**
- Backend API on port **8000**
- Frontend on port **3000**

## API Endpoints

### Products
| Method | Endpoint               | Description         |
| ------ | ---------------------- | ------------------- |
| POST   | `/api/products`        | Create product      |
| GET    | `/api/products`        | List all products   |
| GET    | `/api/products/{id}`   | Get single product  |
| PUT    | `/api/products/{id}`   | Update product      |
| DELETE | `/api/products/{id}`   | Delete product      |

### Customers
| Method | Endpoint                | Description          |
| ------ | ----------------------- | -------------------- |
| POST   | `/api/customers`        | Create customer      |
| GET    | `/api/customers`        | List all customers   |
| GET    | `/api/customers/{id}`   | Get single customer  |
| PUT    | `/api/customers/{id}`   | Update customer      |
| DELETE | `/api/customers/{id}`   | Delete customer      |

### Orders
| Method | Endpoint                    | Description            |
| ------ | --------------------------- | ---------------------- |
| POST   | `/api/orders`               | Create order           |
| GET    | `/api/orders`               | List all orders        |
| GET    | `/api/orders/{id}`          | Get order with items   |
| PUT    | `/api/orders/{id}/status`   | Update order status    |
| DELETE | `/api/orders/{id}`          | Cancel order           |

### Inventory
| Method | Endpoint                       | Description              |
| ------ | ------------------------------ | ------------------------ |
| GET    | `/api/inventory`               | List stock levels        |
| PUT    | `/api/inventory/{product_id}`  | Manual stock adjustment  |

## Business Rules

1. **SKU uniqueness**: Duplicate SKU returns `400` error
2. **Email uniqueness**: Duplicate email returns `400` error
3. **Order stock check**: Insufficient stock rejects the entire order with `"Insufficient stock for product: {name}"`
4. **Stock deduction**: Successful orders atomically reduce stock quantities
5. **Cancellation**: Cancelled orders do NOT restore stock

## Live URLs

| Service  | URL                              |
| -------- | -------------------------------- |
| Frontend | *https://inventory-order-management-alpha.vercel.app/*           |
| Backend  | *https://inventory-order-management-system-wxl9.onrender.com*           |
| Docker   | *https://hub.docker.com/repository/docker/arun979321/inventory-management/general*               |

## GitHub

[GitHub Repository](https://github.com/Arun979321/Inventory-Order-Management-System)

## Docker Image

[Docker Hub Image](https://hub.docker.com/r/arun979321/inventory-management)
