# Pulse — Community Civic Issue Reporting Platform

Pulse is a community-powered civic issue reporting platform for discovering, reporting, verifying, and tracking local problems.

It allows people to report issues such as potholes, garbage, broken streetlights, drainage problems, and water issues. Reported problems can be explored on an interactive map, confirmed by other community members, and tracked through a simple status workflow.

## Tagline

**Report. Verify. Resolve.**

## Features

- Report local civic issues
- Capture the user's location using browser geolocation
- Explore reported issues on an interactive map
- Search issues by title, description, or location
- Filter issues by category and status
- View detailed information about individual issues
- Confirm that an existing issue is actually present
- Track issue status:
  - Reported
  - Verified
  - In Progress
  - Resolved
- Maintain status history for each issue
- Detect likely duplicate reports using geographic proximity, category, and text similarity

## What Makes Pulse Different

A major focus of Pulse is reducing duplicate reports.

Instead of treating every submission as a completely separate problem, the backend checks whether a similar issue already exists nearby.

The duplicate detection logic considers:

1. Geographic distance between reports
2. Issue category
3. Similarity between the issue title and description

If a sufficiently similar issue is already present nearby, Pulse prevents another duplicate record from being created.

This keeps the issue list more meaningful and makes the number of reported issues closer to the number of actual problems.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- React Leaflet
- Leaflet

### Backend

- Node.js
- Express
- TypeScript
- CORS

### Database

- PostgreSQL
- Prisma ORM

## Architecture

```text
React Frontend
      |
      | HTTP / REST API
      v
Express Backend
      |
      | Prisma ORM
      v
PostgreSQL