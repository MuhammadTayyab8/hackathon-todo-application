# Project Overview: Hackathon Todo Application

## Overview
A full-stack Todo application built during the AI Hackathon, designed with Spec-Driven Development (SDD) principles. The application enables users to manage tasks across different interfaces (Console, Web, and Chatbot) with a centralized FastAPI backend and Neon PostgreSQL database.

## Technology Stack
- **Frontend**: Next.js 16+ (App Router)
- **Backend**: Python FastAPI
- **Database**: Neon Serverless PostgreSQL
- **ORM**: SQLModel
- **Authentication**: Better Auth (Next.js) with JWT tokens
- **API Style**: RESTful

## Development Phases
1. **Phase 1 (phase1-console)**: Core Task CRUD logic (Console-based interaction).
2. **Phase 2 (phase2-web)**: Task CRUD + Authentication + Web UI using Next.js.
3. **Phase 3 (phase3-chatbot)**: Task CRUD + Authentication + Chatbot integration.

## Core Requirements
- All API routes must be protected by JWT authentication.
- All data must be scoped to the authenticated user (`/api/{user_id}/tasks`).
- Users can only access and modify their own data.
- Shared secret `BETTER_AUTH_SECRET` is used for JWT verification on the backend.

## Project Structure
- `/frontend`: Next.js application.
- `/backend`: FastAPI server.
- `/specs`: Specification files (Single Source of Truth).
