# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Amigo (Spanish for "friend") is a mobile-first vehicle maintenance web application that tracks all data in local storage (browser) with no backend required. The application follows a minimal design approach with less colors and uses vehicle-themed icons and buttons. Supports multiple vehicles including cars, vans, buses, and bikes with tagging system.

## Current State

This is a new repository with only a basic README.md file. The project structure and implementation files need to be created from scratch.

## Architecture Notes

- **Mobile-First Design**: Bottom fixed navigation menu like mobile apps
- **Navigation**: Each page includes back button for mobile app-like navigation
- **Interactions**: Mobile app-style interactions and gestures
- **Storage**: Uses browser local storage for all data persistence
- **Frontend-only**: No backend or server-side components required
- **Theme**: Vehicle maintenance focused with automotive icons and minimal color palette
- **Multi-Vehicle Support**: Manage cars, vans, buses, motorcycles, and other vehicles
- **Tagging System**: Each vehicle can have custom tags for organization
- **Data Model**: Support maintenance records, schedules, and tracking data for multiple vehicles

## Development Setup

Since this is a new project, the development setup will depend on the technology stack chosen. Common approaches for browser-based applications include:

- Plain HTML/CSS/JavaScript
- React/Vue/Angular with build tools
- Static site generators

## Key Considerations

- All data persistence must use browser localStorage
- Mobile-first responsive design with touch-friendly interactions
- Bottom fixed navigation menu (mobile app style)
- Back button on each page for intuitive navigation
- UI should be minimal and vehicle-themed
- Support for multiple vehicle types (cars, vans, buses, bikes, etc.)
- Vehicle tagging system for organization
- No server-side dependencies or API calls
- Focus on vehicle maintenance workflow and data tracking across multiple vehicles