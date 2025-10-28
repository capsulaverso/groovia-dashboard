# Overview

Groovia Dashboard is a modern, responsive dashboard application built with React, TypeScript, and Vite. It serves as a strategic business intelligence platform for managing AI-powered analysis agents and workflow plugins, featuring a card-based UI with comprehensive light/dark theme support. The project aims to provide a robust and intuitive platform for users to interact with and manage various AI capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.
Preferred language: Portuguese (PT-BR).
Default theme: Light mode (tema claro).

# System Architecture

## Backend Architecture

**Database:** PostgreSQL 16 (Neon-backed) with Drizzle ORM for type-safe operations.
**API:** Express.js RESTful API handling CRUD for users, agents, documents, conversations, and messages.
**Security:** bcryptjs for password hashing, environment-based credentials.
**Schema:** Includes `users` (auth, roles), `agents` (AI agent configs), `documents` (LGPD compliant), `conversations`, `messages`, and `userProgress`.

## Frontend Architecture

**Framework:** React 19.2.0 with TypeScript, Vite 6.2.0.
**Styling:** Tailwind CSS (CDN), Material Icons (CDN), Poppins font.
**Component Architecture:** Modular, component-based with clear separation of concerns.
- **Dashboard Components:** `App.tsx` (routing), `Sidebar` (adaptive navigation), `MainContent` (dashboard home), `RightAside` (contextual help), `ScanCard`, `ProgressRing`, `InfoItem`, `InstructionBox`, `FloatingTooltip`, `AgentCard`, `UserMenu`.
- **Content Pages:** `DocumentsPage`, `MyAgentsPage`, `ProfilePage`, informational pages (`DocsPage`, `PrivacyPage`, `EULAPage`), and admin pages (`UsersManagementPage`, `ReportsPage`, `AgentsControlPage`).
- **Agent Workspace System:** Dedicated full-page interface with `AgentWorkspace` (three-panel layout), `WorkspaceLeftSidebar` (conversation history), `WorkspaceChatArea` (central chat with markdown), `WorkspaceRightSidebar` (documents/help).
**State Management:** Custom React hooks (`useTheme`, `useUser`, `useUserProgress`, `useTooltipPositioning`, `useApi`) for cross-cutting concerns and `localStorage` for persistence.
**Design Patterns:** Composition, custom hooks, props-based communication, Presentational/Container components.
**Styling Strategy:** Tailwind CSS with dark mode support and custom color palette.
**Type System:** TypeScript interfaces defined in `types.ts` for dashboard and workspace entities.
**Administrative Features:** Agent management (CRUD, enable/disable), integration support (WebHook, N8N, LangChain), and statistics.
**Data Architecture:** Static constants (`constants.ts`), `getAgentWorkspaceConfig()` factory for dynamic agent configurations, and example conversation system for demonstration.

## Build and Development

**Build Configuration:** Vite with path aliases, environment variable injection, and React plugin.
**TypeScript Configuration:** ES2022 target, bundler module resolution, JSX transform.
**Development Workflow:** HMR, preview mode, Vercel-optimized deployment (now Replit).

## Theme System

**Implementation:** `useTheme` hook with localStorage persistence, system preference detection, and default light mode.
**Mechanism:** Toggles `dark` class on document root, leverages Tailwind's dark mode variants.
**Color Palette:** Custom primary (purple), surface, and on-surface colors.

# External Dependencies

## NPM Packages

**Production:** `react`, `react-dom`.
**Development:** `@vitejs/plugin-react`, `typescript`, `@types/node`, `vite`.

## CDN Resources

**Styling:** Tailwind CSS.
**Fonts:** Google Fonts - Poppins, Material Icons Outlined.
**JavaScript:** React and React DOM via `aistudiocdn.com`.

## Third-Party Services

**API Integration:** Gemini API, Google Drive, Google Slides.
**Deployment:** Replit.

## Development Tools

**Claude AI Workflow:** `.claude/` directory for AI-assisted, spec-driven development (requirements, design, tasks, implementation, testing, judging).
**Agent System:** Specialized agents for different development phases (`spec-requirements`, `spec-design`, `spec-tasks`, `spec-impl`, `spec-test`, `spec-judge`).