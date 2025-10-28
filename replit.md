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
**Schema:** Includes `users` (auth, roles), `agents` (AI agent configs with IA fields), `documents` (LGPD compliant), `conversations`, `messages`, and `userProgress`.
**AI Integration:** Multi-provider AI system (Groovia Intelligence Nativo 1.0, OpenAI, Groq) with intelligent caching, webhook support, and fallback mechanisms.
**AI Service:** `server/aiService.ts` - Centralized AI service with node-cache (1h TTL), webhook-first execution, and comprehensive error handling.

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
**Administrative Features:** 
- Agent management (CRUD, enable/disable, test functionality)
- AI Configuration (provider, model, system prompt, fallback prompt)
- Integration support (WebHook with fallback, N8N, LangChain)
- Real-time agent testing with detailed metrics (latency, tokens, cache status)
- Statistics and cache management
**Data Architecture:** Static constants (`constants.ts`), `getAgentWorkspaceConfig()` factory for dynamic agent configurations, and example conversation system for demonstration.

## Build and Development

**Build Configuration:** Vite with path aliases, environment variable injection, and React plugin.
**TypeScript Configuration:** ES2022 target, bundler module resolution, JSX transform.
**Development Workflow:** HMR, preview mode, Vercel-optimized deployment (now Replit).

## Theme System

**Implementation:** `useTheme` hook with localStorage persistence, system preference detection, and default light mode.
**Mechanism:** Toggles `dark` class on document root, leverages Tailwind's dark mode variants.
**Color Palette:** Custom primary (purple), surface, and on-surface colors.

# Recent Changes (October 28, 2025)

## AI Agent Testing System (COMPLETE ✅)
- **Database Schema Updates**: Added AI configuration fields to agents table (ai_model, ai_provider, system_prompt, fallback_prompt, webhook_url, webhook_enabled)
- **AI Service Implementation**: Multi-provider support (Groovia Intelligence Nativo 1.0, OpenAI, Groq) with intelligent caching and webhook integration
- **API Endpoints**: `/api/agents/test`, `/api/cache/stats`, `/api/cache` (DELETE)
- **Admin Interface**: Complete agent management UI with test button, detailed result panels showing latency, tokens, cache status
- **Integration**: Groovia Intelligence Nativo 1.0 (IA nativa do sistema, sem necessidade de API key externa)
- **Testing**: Manual validation completed - 2.8s response time, 255 tokens, full functionality verified

## Responsive Pagination System (COMPLETE ✅)
- **Dynamic Card Display**: Adjusted cards per page based on screen resolution (1-6 cards)
- **Backend Integration**: Cards now populate from PostgreSQL via `/api/agents` endpoint
- **Pagination Controls**: Numbered page buttons with Previous/Next navigation
- **Smart Page Clamping**: Automatically adjusts current page when screen resizes or data changes
- **Empty States**: Proper handling when no active agents available
- **Performance**: Memoized calculations and optimized rendering

# External Dependencies

## NPM Packages

**Production:** `react`, `react-dom`, `openai`, `groq-sdk`, `node-cache`, `express`, `cors`, `bcryptjs`, `drizzle-orm`, `pg`.
**Development:** `@vitejs/plugin-react`, `typescript`, `@types/node`, `vite`, `drizzle-kit`, `tsx`.

## CDN Resources

**Styling:** Tailwind CSS.
**Fonts:** Google Fonts - Poppins, Material Icons Outlined.
**JavaScript:** React and React DOM via `aistudiocdn.com`.

## Third-Party Services

**AI Providers:** 
- Groovia Intelligence Nativo 1.0 (IA nativa do sistema, sem necessidade de API key externa)
- OpenAI (opcional, requer OPENAI_API_KEY)
- Groq (opcional, requer GROQ_API_KEY)
**API Integration:** Google Drive, Google Slides, Custom WebHooks.
**Deployment:** Replit.
**Cache:** node-cache for AI response caching (reduces costs and latency).

## Development Tools

**Claude AI Workflow:** `.claude/` directory for AI-assisted, spec-driven development (requirements, design, tasks, implementation, testing, judging).
**Agent System:** Specialized agents for different development phases (`spec-requirements`, `spec-design`, `spec-tasks`, `spec-impl`, `spec-test`, `spec-judge`).