# Shortest Route Finder API

REST API for an oil delivery dispatch system, implemented with Express + TypeScript and SQLite.

## Tech Stack
- Language: TypeScript (Node.js)
- Framework: Express.js
- Database: SQLite (`sqlite3`, raw SQL only, no ORM)

Why this stack:
- Express is lightweight and clear for REST endpoints.
- TypeScript gives better safety and maintainability.
- Raw SQL directly matches the assignment requirement.

## Repository Layout
```text
asssessment/
  shortest-route-api/
    src/
    tests/
    delivery.db
    requests.http
```

## Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm 9+
- Git (for cloning)

## Setup (Clone, Install, Run)
1. Clone your repository:
```bash
git clone https://github.com/eddy862/shortest-route-finder.git
```

2. Enter project folder:
```bash
cd asssessment/shortest-route-api
```

3. Install dependencies:
```bash
npm install
```

4. Create `.env` from example:
```bash
cp .env.example .env
```
Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

5. Start development server:
```bash
npm run dev
```

Server default: `http://localhost:3000`

## Environment Variables
- `PORT` (default `3000`)
- `DB_PATH` (default `delivery.db`)

Examples:
- `DB_PATH=delivery.db` (baseline)
- `DB_PATH=delivery.dev.db` (safe local testing copy)

## How the Algorithm Works
The road network is treated as a graph:
- locations are nodes
- roads are weighted edges (`distance_km`)
- roads are bidirectional (A->B and B->A)

For reachability checks (for example, depot to customer validation for `POST /deliveries`), the API uses DFS:
- DFS checks connectivity only (reachable or not reachable)
- this avoids running a heavier shortest-path algorithm when distance/path is not required

To find the shortest route, the API uses Dijkstra's algorithm:
- start from source node
- repeatedly choose the nearest unvisited node
- relax/update neighbor distances
- reconstruct path from destination back to source

If no path exists, it returns `reachable: false`, `path: []`, and `total_distance_km: null`.

## Endpoints
- `GET /route?from=<id>&to=<id>`
- `GET /locations`
- `POST /deliveries`
- `PATCH /deliveries/:id/status`
- `GET /locations/unreachable`
- `GET /deliveries/summary`

## Example cURL Commands
### 1) GET /route
```bash
curl "http://localhost:3000/route?from=1&to=7"
```

### 2) GET /locations
```bash
curl "http://localhost:3000/locations"
```

### 3) POST /deliveries
```bash
curl -X POST "http://localhost:3000/deliveries" \
  -H "Content-Type: application/json" \
  -d "{\"customer_id\":7,\"truck_plate\":\"WB5678C\"}"
```

### 4) PATCH /deliveries/:id/status
```bash
curl -X PATCH "http://localhost:3000/deliveries/1/status" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"arrived\"}"
```

### 5) GET /locations/unreachable
```bash
curl "http://localhost:3000/locations/unreachable"
```

### 6) GET /deliveries/summary
```bash
curl "http://localhost:3000/deliveries/summary"
```

## Error Format
All non-2xx responses follow:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [
      { "field": "customer_id", "issue": "invalid_integer" }
    ]
  }
}
```

## Testing
Run all tests:
```bash
npm run test
```

This project uses a separate test DB (`delivery.test.db`) reset from `delivery.backup.initial.db` for deterministic integration tests.

## Assumptions
- Exactly one depot exists in `locations`.
- New deliveries are created with `status = departed`.
- Only `departed -> arrived` transition is valid.
- Unreachable detection is graph-based, not only road-count-based.
