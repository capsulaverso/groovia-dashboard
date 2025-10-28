# Overview

Groovia Dashboard is a modern, responsive dashboard application built with React 19, TypeScript, and Vite. The application serves as a strategic business intelligence platform for managing various AI-powered analysis agents and workflow plugins. It features a clean, card-based UI with a comprehensive theme system supporting both light and dark modes with localStorage persistence.

# User Preferences

Preferred communication style: Simple, everyday language.
Preferred language: Portuguese (PT-BR).

# System Architecture

## Frontend Architecture

**Framework Stack:**
- React 19.2.0 with TypeScript for type-safe component development
- Vite 6.2.0 as the build tool and development server
- Tailwind CSS (via CDN) for utility-first styling
- Material Icons (via CDN) for consistent iconography
- Poppins font family for typography

**Component Architecture:**
The application follows a modular component-based architecture with clear separation of concerns:

**Dashboard Components:**
- **App.tsx**: Root component implementing a three-column flex layout (Sidebar, MainContent, RightAside)
- **Sidebar**: Left navigation panel featuring branding and theme toggle functionality
- **MainContent**: Central content area displaying plugin cards, scan progress, and chat history
- **RightAside**: Right information panel for contextual help and actions
- **ScanCard**: Reusable card component for displaying plugin/agent status with progress indicators
- **ProgressRing**: SVG-based circular progress indicator using stroke-dashoffset animation
- **InfoItem**: Informational card components for the right aside
- **InstructionBox**: Reusable component for displaying instructions, guidance, warnings, and announcements throughout the system with closeable functionality and action buttons
- **AgentCard**: Interactive card component with animated progress bars, circular context indicator, and clickable workspace integration for AI agent interactions

**Agent Workspace System (Full-Page Dedicated Interface):**
- **AgentWorkspace**: Main workspace container with three-panel layout providing dedicated full-page environment for agent interactions
- **WorkspaceLeftSidebar**: Conversation history panel displaying past conversations with timestamps, active conversation highlighting, and context data visualization (phases, progress, metrics)
- **WorkspaceChatArea**: Central chat interface with message history, agent-specific functions (clickable action buttons), markdown support for formatted messages, and localStorage-based conversation persistence
- **WorkspaceRightSidebar**: Information panel with tabbed interface for documents (client files with preview/download) and help (contextual messages and interactive tooltips with target references)

**State Management:**
- Custom React hooks pattern (`useTheme`) for theme management
- LocalStorage for theme persistence
- Component-level state using React hooks (useState, useEffect)

**Design Patterns:**
- Composition pattern for building UI from smaller, reusable components
- Custom hooks for cross-cutting concerns (theme switching)
- Props-based component communication with TypeScript interfaces
- Presentational vs. Container component separation

**Styling Strategy:**
- Tailwind CSS utility classes with dark mode support via `dark:` prefix
- Custom Tailwind configuration extending default theme with brand colors
- CSS custom properties for theming (defined in tailwind.config)
- Responsive design using Tailwind breakpoints (sm, md, lg, xl)

**Type System:**
TypeScript interfaces defined in `types.ts`:

*Dashboard Types:*
- `ScanCardData`: Structure for plugin/agent card information
- `InfoItemData`: Structure for informational items in right sidebar
- `InstructionBoxProps`: Structure for instruction/notification boxes with variants (info, warning, success, error), action callbacks, and close functionality
- `AgentCardData`: Structure for interactive agent cards with context progress, act phase, internal tracking codes, and agent type classification

*Workspace Types:*
- `AgentFunction`: Configuration for agent-specific action buttons (id, label, icon, description)
- `DocumentItem`: Client document metadata (id, name, type, size, uploadDate, preview link)
- `ConversationHistory`: Conversation metadata for history panel (id, title, timestamp, messageCount)
- `ContextData`: Agent context information (currentPhase, contextProgress, analysisDepth, dataPoints)
- `TooltipConfig`: Interactive tooltip configuration (id, target, position, title, content)
- `AgentWorkspaceConfig`: Complete workspace configuration including metadata, functions, documents, context, help messages, and tooltips
- `ChatMessage`: Message structure for chat interface with sender identification, content, and timestamps

## Build and Development

**Build Configuration (vite.config.ts):**
- Path aliases (`@/`) for cleaner imports
- Environment variable injection for API keys (Gemini)
- React plugin with fast refresh support
- Development server on port 5000 with host 0.0.0.0 for accessibility

**TypeScript Configuration:**
- ES2022 target with DOM libraries
- Bundler module resolution for Vite compatibility
- JSX transform to react-jsx
- Experimental decorators enabled
- Path mapping for alias support

**Development Workflow:**
- Hot module replacement (HMR) in development
- Preview mode for production build testing
- Vercel-optimized deployment configuration

## Theme System

**Implementation:**
The `useTheme` hook manages theme state with three-tier fallback logic:
1. Check localStorage for saved preference
2. Respect system preference via `prefers-color-scheme` media query
3. Default to light mode

**Mechanism:**
- Theme applied by toggling `dark` class on document root
- Tailwind's dark mode variant system handles conditional styling
- Persistent across sessions via localStorage

**Color Palette:**
Custom color system defined in Tailwind config:
- Primary: Purple (#6D28D9)
- Surface colors for light/dark modes
- On-surface colors for text contrast
- Secondary text colors for hierarchy

## Data Architecture

**Static Data Constants (constants.ts):**
- `SCAN_CARDS_DATA`: Array of diagnostic scan plugin configurations
- `ANALYSIS_CARDS_DATA`: Array of analysis agent configurations with 7 pre-configured agents (SCAN CLARITY, Market Research, Persona Creation, Behavioral Analysis, Brand Strategy, Cross-Channel Strategy, Innovation Strategy)
- `INFO_ITEMS_DATA`: Array of informational items for right sidebar

**Workspace Configuration System (utils/agentWorkspaceConfig.ts):**
- `getAgentWorkspaceConfig()`: Factory function generating complete workspace configuration based on agent type
- Pre-configured settings for 7 agent types with unique internal codes (AGT-SC-001 through AGT-BR-007) for resource tracking
- Each agent has customized functions, context data, help messages, and tooltips relevant to their specialty
- `getConversationHistory()`: Generates agent-specific conversation history with realistic past sessions showing titles, last messages, timestamps, and message counts

**Example Conversations System (utils/populateConversations.ts):**
- Pre-populated conversation examples for demonstration purposes
- Realistic message histories for key agent types (Diagnóstico, Pesquisa)
- Automatically populated on first app load
- Full conversation transcripts saved to localStorage for testing workspace conversation loading functionality

**Data Flow:**
- Dashboard: Constants → Component Props → Rendering via map functions
- Workspace: Agent Type → Configuration Factory → Workspace Components → LocalStorage Persistence

# External Dependencies

## NPM Packages

**Production:**
- `react@^19.2.0`: Core UI library
- `react-dom@^19.2.0`: DOM rendering for React

**Development:**
- `@vitejs/plugin-react@^5.0.0`: Vite plugin for React support with Fast Refresh
- `typescript@~5.8.2`: TypeScript compiler and language support
- `@types/node@^22.14.0`: Node.js type definitions
- `vite@^6.2.0`: Next-generation frontend build tool

## CDN Resources

**Styling:**
- Tailwind CSS (latest via cdn.tailwindcss.com): Utility-first CSS framework

**Fonts:**
- Google Fonts - Poppins family (400, 500, 600, 700 weights)
- Material Icons Outlined: Icon system

**JavaScript:**
- React 19.2.0 via aistudiocdn.com (importmap configuration)
- React DOM 19.2.0 via aistudiocdn.com

## Third-Party Services

**API Integration:**
- Gemini API: Environment variable `GEMINI_API_KEY` configured in Vite for AI capabilities
- Google Drive integration (indicated by DRIVE badge in UI)
- Google Slides integration (indicated by SLIDE badge in UI)

**Deployment Platforms:**
- Replit: Primary deployment platform with autoscale configuration
- Previous platforms: Migrated from Vercel to Replit on October 28, 2025

## Development Tools

**Claude AI Workflow:**
The repository includes a comprehensive `.claude/` directory structure for AI-assisted development:
- Spec-driven development workflow with dedicated agents
- Requirements gathering (EARS format)
- Design documentation
- Task planning and implementation
- Testing framework

**Agent System:**
Multiple specialized agents for development workflow:
- `spec-requirements`: EARS-format requirements documentation
- `spec-design`: Architecture and design documentation
- `spec-tasks`: Implementation task breakdown
- `spec-impl`: Code implementation
- `spec-test`: Test creation and validation
- `spec-judge`: Document evaluation and selection