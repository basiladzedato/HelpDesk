# HelpDesk

A full-stack support ticket management system built with **Spring Boot, PostgreSQL, Spring Security, JavaScript, and Docker**.

## Features

- User registration and login
- BCrypt password hashing
- Session-based authentication
- Roles: `USER` and `SUPPORT`
- Users can create and view their own tickets
- Support users can view all tickets and update ticket status
- Ticket statuses: `OPEN`, `IN_PROGRESS`, `RESOLVED`
- Validation and global error handling
- Responsive frontend dashboard
- Dockerized Spring Boot backend and PostgreSQL database

## Tech Stack

- Java / Spring Boot
- Spring Security
- Spring Data JPA / Hibernate
- PostgreSQL
- HTML / CSS / JavaScript
- Docker / Docker Compose
- Maven
- Git / GitHub

## Run with Docker

Clone the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
cd helpdesk
```

Create a `.env` file based on `.env.example`:

```env
POSTGRES_DB=helpdesk
POSTGRES_USER=helpdesk
POSTGRES_PASSWORD=your_password
```

Start the backend and database:

```bash
docker compose up --build
```

Then run `frontend/index.html` using Live Server.

Frontend:

```text
http://127.0.0.1:5500/frontend/
```

Backend:

```text
http://127.0.0.1:8081
```

## Architecture

```text
Frontend
   ↓
Spring Security
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
PostgreSQL
```

## Roles

**USER**
- Create tickets
- View own tickets

**SUPPORT**
- View all tickets
- Change ticket status

## Docker

The application uses Docker Compose with:

- Spring Boot container
- PostgreSQL container
- Persistent PostgreSQL volume

```bash
docker compose down
```

stops the application while keeping database data.

---
