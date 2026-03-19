# AI Coding Agent Guidelines for Scheduler API

Welcome to the Scheduler API codebase! This document provides essential guidelines for AI coding agents to be productive and aligned with the project's architecture, workflows, and conventions.

## Project Overview

The Scheduler API is a backend service built using the [NestJS](https://nestjs.com) framework. It is designed to handle scheduling-related operations efficiently and scalably. The project follows a modular architecture, with each module encapsulating specific functionality.

### Key Components

- **Modules**: Each module (e.g., `appointment`, `user`, `clinic-keys`) encapsulates related controllers, services, and repositories.
- **Common Utilities**: Shared functionality resides in the `src/common` and `src/shared` directories, including guards, interceptors, DTOs, and utility functions.
- **Database Integration**: The project uses TypeORM for database interactions, with configurations in `src/config/typeorm.config.ts`.
- **Middleware and Guards**: Custom middleware and guards (e.g., `clinic-context.guard.ts`, `jwt-auth.guard.ts`) enforce security and context-specific logic.

## Developer Workflows

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run start:dev
   ```

### Testing

- **Unit Tests**:
  ```bash
  npm run test
  ```
- **End-to-End Tests**:
  ```bash
  npm run test:e2e
  ```
- **Test Coverage**:
  ```bash
  npm run test:cov
  ```

### Build and Deployment

- **Build for Production**:
  ```bash
  npm run build
  ```
- **Run Production Build**:
  ```bash
  npm run start:prod
  ```

## Project-Specific Conventions

1. **Modular Structure**: Each module should have its own `controller`, `service`, and `repository` files. Example: `src/modules/appointment/appointment.controller.ts`.
2. **DTOs**: Data Transfer Objects (DTOs) are used for input validation and reside in `src/common/dto` or module-specific directories.
3. **Guards and Interceptors**: Custom guards (e.g., `RolesGuard`) and interceptors (e.g., `LoggingInterceptor`) are used to enforce security and logging standards.
4. **Error Handling**: Use the `AllExceptionsFilter` in `src/common/filters` for consistent error handling.

## Integration Points

- **Database**: TypeORM is configured in `src/config/typeorm.config.ts`. Migrations are located in `src/database/migrations`.
- **Authentication**: JWT-based authentication is implemented with guards and middleware in `src/common/guards` and `src/common/middleware`.
- **External APIs**: The `opendental` module integrates with external systems.

## Examples

### Creating a New Module

1. Create a new directory under `src/modules`.
2. Add `module`, `controller`, `service`, and `repository` files.
3. Register the module in `src/app.module.ts`.

### Adding a New Guard

1. Create the guard in `src/common/guards`.
2. Implement the `CanActivate` interface.
3. Apply the guard using the `@UseGuards` decorator in controllers.

## References

- **NestJS Documentation**: [https://docs.nestjs.com](https://docs.nestjs.com)
- **Project README**: [README.md](../README.md)

---

This document is a living guide. Update it as the project evolves to ensure AI agents remain effective contributors.