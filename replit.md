# PDF OCR Pro - Replit Coding Agent Guide

## Overview

PDF OCR Pro is a full-stack web application built for intelligent PDF text extraction and processing. The application combines traditional PDF text extraction with AI-powered enhancement using Google's Gemini API to provide clean, formatted, and structured text output from PDF documents.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend, backend, and shared components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom design tokens

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **File Processing**: PDF.js for text extraction, Multer for file uploads
- **AI Integration**: Google Gemini API for text enhancement
- **Development**: Hot module replacement with Vite middleware

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Defined in shared directory for type safety
- **Development Storage**: In-memory storage implementation for development
- **Session Management**: Express sessions with PostgreSQL store

## Key Components

### PDF Processing Pipeline
1. **File Upload**: Multer handles PDF file uploads with 50MB size limit
2. **Text Extraction**: PDF.js extracts raw text from uploaded documents
3. **Text Processing**: Custom text processor handles formatting, footnotes, and structure
4. **AI Enhancement**: Gemini API improves text quality and provides summaries
5. **Output Generation**: Multiple format support (text, Word, Markdown)

### AI Enhancement System
- **Service**: GeminiService handles all AI interactions
- **Levels**: Basic, Standard, and Advanced processing options
- **Features**: Text enhancement, document type detection, summary generation
- **Error Handling**: Graceful fallbacks when AI services are unavailable

### Real-time Processing Status
- **State Management**: In-memory processing states for real-time updates
- **Progress Tracking**: Step-by-step progress with timing information
- **Logging**: Detailed processing logs for debugging and transparency

### UI Components
- **Upload Area**: Drag-and-drop file upload with sample document support
- **Processing View**: Real-time progress display with animated status
- **Results View**: Tabbed interface for summary, text, and debug information
- **Settings Panel**: Configurable processing options

## Data Flow

1. **File Upload**: User uploads PDF through drag-and-drop or file picker
2. **Processing Initiation**: Server creates document record and processing state
3. **Text Extraction**: PDF.js extracts raw text from the document
4. **Text Enhancement**: Gemini API processes text based on user settings
5. **Result Storage**: Processed text and metadata stored in database
6. **Client Updates**: Real-time status updates via polling
7. **Download**: Multiple format downloads available upon completion

## External Dependencies

### Core Dependencies
- **@google/genai**: Google Gemini AI integration
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **pdfjs-dist**: PDF text extraction library
- **@tanstack/react-query**: Server state management

### UI Dependencies
- **@radix-ui/***: Comprehensive UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **wouter**: Lightweight routing

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety and enhanced development experience
- **drizzle-kit**: Database migration and management

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for frontend
- **Express Middleware**: Vite integration for seamless development
- **In-Memory Storage**: Development-friendly storage implementation
- **Environment Variables**: API keys and database configuration

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: esbuild bundles server code for Node.js
- **Database**: PostgreSQL with Drizzle migrations
- **Static Assets**: Served through Express static middleware

### Environment Configuration
- **Database**: `DATABASE_URL` for PostgreSQL connection
- **AI Service**: `GEMINI_API_KEY` for Google AI integration
- **Session**: Secure session configuration for production

### File Structure
```
├── client/          # React frontend application
├── server/          # Express backend server
├── shared/          # Shared types and schemas
├── migrations/      # Database migration files
└── dist/           # Production build output
```

The application is designed to be easily deployable on platforms like Replit, with clear separation of concerns and comprehensive error handling throughout the processing pipeline.