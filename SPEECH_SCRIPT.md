# Inventory & Order Management System — Speech Script

---

## Slide 1: Title Slide

> "Good morning/afternoon everyone. Today I'll be presenting my **Inventory & Order Management System** — a full-stack web application designed to help businesses manage their products, customers, orders, and inventory in real time."

---

## Slide 2: Problem Statement

> "Running a small or medium business involves juggling multiple moving parts — tracking what products you have, who your customers are, what they've ordered, and whether you have enough stock to fulfill new orders.
>
> Spreadsheets break down under concurrent access. Paper records get lost. And most off-the-shelf solutions are either too expensive or too complex.
>
> This project solves that: a single, unified dashboard where you can manage everything — products, customers, orders, and inventory — from one place."

---

## Slide 3: Tech Stack

> "Let me walk you through the technology choices.
>
> The **backend** is built with **Python and FastAPI** — a modern, high-performance web framework. It uses **SQLAlchemy** as the ORM to talk to a **PostgreSQL** database.
>
> The **frontend** is built with **React 18** and uses **React Router** for navigation and **Axios** for HTTP calls.
>
> The entire application is **containerized with Docker** — both the backend and frontend have their own Dockerfiles, and a Docker Compose file orchestrates everything, including the database.
>
> This makes deployment incredibly simple — a single `docker-compose up` command starts the entire stack."

---

## Slide 4: Architecture Overview

> "Here's the high-level architecture.
>
> The user interacts with the **React frontend** running on port 3000. All API requests go to the **FastAPI backend** on port 8000. The backend processes business logic and talks to the **PostgreSQL database** on port 5432.
>
> The frontend never talks to the database directly — everything goes through the REST API. This separation of concerns makes the system modular, testable, and scalable."

---

## Slide 5: Dashboard

> "Let me show you the main features, starting with the **Dashboard**.
>
> The Dashboard is the home page. It gives you a bird's-eye view of your business:
> - Total number of products in your catalog
> - Total customers registered
> - Total orders placed
> - Low stock items that need attention
>
> Below the summary cards, there's a dedicated **Low Stock Alerts** table that lists every product with stock below 10 units. Zero-stock items are highlighted in red, and low-stock items in orange — so you can quickly identify what needs restocking."

---

## Slide 6: Products Management

> "Next is the **Products** page.
>
> Here you can view all your products in a table — ID, Name, SKU, Price, and current Stock level.
>
> You can **add** a new product by clicking the 'Add Product' button. The form requires a name and a unique SKU — the system enforces SKU uniqueness and will reject duplicates with a clear error message.
>
> You can **edit** any product inline via the Edit button, which opens a pre-populated form.
>
> And you can **delete** products that are no longer needed.
>
> The price is stored with two decimal precision, and stock defaults to zero if not specified."

---

## Slide 7: Customers Management

> "The **Customers** page works similarly.
>
> You can view, add, edit, and delete customers. Each customer has a name, a unique email address, and an optional phone number.
>
> The system enforces email uniqueness — trying to register the same email twice will show a 400 error. This prevents duplicate customer records, which is a common problem in business databases."

---

## Slide 8: Orders — The Core Feature

> "The **Orders** page is the most feature-rich part of the application.
>
> You can view all orders in a table showing the order ID, customer name, current status, total amount, and date.
>
> **Creating an order** is a multi-step process:
> 1. You select a customer from a dropdown
> 2. You add one or more line items — each with a product and quantity
> 3. The system checks stock availability for every item
> 4. If stock is sufficient, the order is created, stock quantities are deducted, and the total is calculated automatically
>
> The **status workflow** includes: Pending, Confirmed, Shipped, Delivered, and Cancelled. Status can be changed inline from the table using a dropdown — no need to open a modal.
>
> You can also **view order details**, which shows every line item with its quantity, unit price, and subtotal.
>
> And you can **cancel** an order if needed."

---

## Slide 9: Business Logic — Stock Management

> "Let me highlight the most important business logic — **stock management during order placement**.
>
> When an order is created, the system uses a **database-level row lock** — `SELECT ... FOR UPDATE` — to prevent race conditions. This means if two users try to order the same product simultaneously, one will wait for the other to finish, ensuring we never oversell.
>
> If the stock is insufficient for any item, the **entire order is rejected** with a clear message like 'Insufficient stock for product: Product Name'. No partial orders — it's all or nothing.
>
> And importantly, when an order is **cancelled**, stock is **not restored**. This is a deliberate business decision — cancellation could mean the stock is already allocated elsewhere or damaged."

---

## Slide 10: Inventory Management

> "The **Inventory** page gives you a direct view of stock levels for all products.
>
> The unique feature here is **inline editing** — you can click directly on any stock quantity, edit it in place, and save. There's no modal, no page reload — just click, type, and save.
>
> Low stock items are visually highlighted — red and bold for zero stock, orange and bold for levels between 1 and 9. The system also validates that stock quantities cannot be negative."

---

## Slide 11: Technical Highlights

> "Let me walk through some technical highlights.
>
> **Pessimistic locking with `with_for_update()`** ensures data integrity during concurrent order placements — critical for any inventory system.
>
> **Price snapshotting** — when an order is created, the current product price is copied into the order item record. This means historical orders always reflect the price at the time of purchase, even if prices change later.
>
> **Atomic transactions** — the entire order creation process (validating stock, deducting quantities, calculating totals) happens in a single database transaction. If anything fails, everything rolls back. No partial states.
>
> The **Docker setup** means you can deploy this anywhere — a developer's laptop, a VPS, or a cloud platform like Render or Railway — with zero configuration beyond environment variables."

---

## Slide 12: How It All Ties Together

> "Let me quickly show how the frontend and backend communicate.
>
> The React app has an Axios client configured with a base URL pointing to the backend. Each feature — products, customers, orders, inventory — has its own API module with clean functions like `getAll()`, `create()`, `update()`, and `delete()`.
>
> When you perform an action on the frontend, it sends an HTTP request to the corresponding FastAPI endpoint. The backend validates the data, runs the business logic, and returns a response. The frontend then shows a success toast or an error message.
>
> Every page fetches fresh data after every mutation — so the UI is always in sync with the database."

---

## Slide 13: Deployment

> "Deployment is straightforward thanks to Docker.
>
> You can run the entire stack locally with a single command:
> `docker-compose up --build`
>
> This starts PostgreSQL, the FastAPI backend on port 8000, and the React frontend on port 3000.
>
> For production, you can:
> - Push the Docker images to Docker Hub
> - Deploy the backend to Render or Railway with a PostgreSQL add-on
> - Deploy the frontend to Vercel or Netlify
> - Or run the whole stack on a VPS using the same Docker Compose file

---

## Slide 14: Challenges & Solutions

> "During development, I faced a few interesting challenges.
>
> **Concurrent stock access** — without row-level locking, two simultaneous orders could oversell the same product. The solution was `SELECT ... FOR UPDATE`, which locks the product row until the transaction completes.
>
> **Snapshot pricing** — if a product's price changes after an order is placed, the order total should still reflect the original price. The solution was copying the unit price into the order item at creation time.
>
> **Real-time UI updates** — after any CRUD operation, the relevant page needed to refresh its data. The solution was a simple `fetchData()` pattern called after every mutation, keeping the architecture simple without needing WebSockets or state management libraries."

---

## Slide 15: Future Enhancements

> "There are several exciting directions for future work:
>
> 1. **Authentication & Authorization** — adding user login with roles (admin, staff)
> 2. **Reporting & Analytics** — sales reports, popular products, revenue trends
> 3. **Notification system** — email alerts when stock runs low
> 4. **Bulk import/export** — CSV upload and download for products and customers
> 5. **Audit logging** — track who changed what and when
> 6. **Unit & integration tests** — comprehensive test coverage for both backend and frontend"

---

## Slide 16: Conclusion

> "To wrap up — this Inventory & Order Management System is a production-ready application that demonstrates:
>
> - A clean **full-stack architecture** with React, FastAPI, and PostgreSQL
> - **Real business logic** including atomic transactions, row-level locking, and data integrity
> - A **polished user interface** with inline editing, status workflows, and real-time feedback
> - **Containerized deployment** with Docker for easy setup and scaling
>
> The code is open-source and available on GitHub. Thank you for your time — I'm happy to take any questions."
