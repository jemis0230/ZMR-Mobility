# Project Architecture & Design System

## Architecture: Clean Architecture (Uncle Bob)

This project follows the principles of **Clean Architecture** to ensure separation of concerns, testability, and independence from external frameworks.

### Layers:

1.  **Domain Layer (`src/domain`)**
    -   **Entities**: Core business objects (e.g., `Vehicle`, `LeasePlan`).
    -   **Use Cases**: Business rules specific to the application (e.g., `CalculateLease`, `ProcureVehicle`).
    -   *Dependencies*: None. This is the heart of the application.

2.  **Application Layer (`src/application`)**
    -   **Interfaces**: Abstractions for repositories and services.
    -   **DTOs**: Data Transfer Objects for communication between layers.
    -   *Dependencies*: Domain Layer.

3.  **Infrastructure Layer (`src/infrastructure`)**
    -   **Repositories**: Implementations of data access (e.g., Prisma/PostgreSQL).
    -   **Services**: Implementations of external APIs (e.g., Payment Gateways, AI Valuation).
    -   *Dependencies*: Application Layer.

4.  **Presentation Layer (`src/presentation`)**
    -   **Components**: React components (Shadcn/UI, Tailwind).
    -   **Hooks**: UI-specific logic.
    -   **State Management**: React Context/Zustand.
    -   *Dependencies*: Domain & Application Layers.

5.  **App Layer (`src/app`)**
    -   Next.js App Router pages and server actions.
    -   Entry points for the application.

---

## Design System & Theme

### Colors
-   **Primary**: `#00D1FF` (Electric Blue) - Represents technology and energy.
-   **Secondary**: `#1A1A1A` (Dark Slate) - Professional and modern background.
-   **Accent**: `#70FF00` (Neon Green) - Represents sustainability and eco-friendliness.
-   **Background**: `#0A0A0A` (Deep Black) - For a high-end, premium feel.
-   **Foreground**: `#FFFFFF` (Pure White) - For high readability.

### Typography
-   **Headings**: Bold, Sans-serif (Inter/Geist) for a professional look.
-   **Body**: Regular, Sans-serif for clarity.

### UI Principles
-   **Dark Mode First**: The entire site is designed for dark mode to match the premium EV aesthetic.
-   **Glassmorphism**: Use of subtle blurs and borders for a modern feel.
-   **Animations**: Minimal but smooth transitions using `framer-motion`.
