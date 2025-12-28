# Production Pack

Lekki, skalowalny system do zarządzania zamówieniami i procesem produkcji (sałatki/warzywa, krojenie–pakowanie–zgrzewanie).

## 🧱 Stos technologiczny

- Frontend: React (Vite), TypeScript, Axios, Less

- Backend: Node.js, Express, TypeScript, Prisma ORM

- Bazy danych: PostgreSQL

- Gateway: HAProxy

- Konteneryzacja: Docker, docker-compose

## Plik .env

Lokalizacja: `./backend/.env`

```
# PostgreSQL Database Configuration

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# JWT Secret Key for authentication

JWT_SECRET="productionpack"

# Database connection strings for Prisma

DATABASE_URL_USER=postgresql://postgres:postgres@database:5432/userdb
DATABASE_URL_ORDER=postgresql://postgres:postgres@database:5432/orderdb
DATABASE_URL_PRODUCTION=postgresql://postgres:postgres@database:5432/productiondb
DATABASE_URL_REPORT=postgresql://postgres:postgres@database:5432/reportdb

# Service Ports

PORT_DATABASE_SERVICE=5432
PORT_API_GATEWAY=8080
PORT_USER_SERVICE=8081
PORT_ORDER_SERVICE=8082
PORT_PRODUCTION_SERVICE=8083
PORT_REPORTING_SERVICE=8084
```
