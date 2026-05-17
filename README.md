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

## Architecture Decisions
- Layered structure (`routes -> controllers -> services -> repositories`) to separate HTTP concerns, business rules, and SQL access.
- Raw SQL is isolated in repository files to satisfy assignment constraints (no ORM) while keeping query logic maintainable.
- Graph logic is isolated in `src/graph` so shortest path and reachability stay reusable and testable.
- Reachability uses DFS, while shortest route uses Dijkstra, so each endpoint uses the simplest correct algorithm for its goal.
- Environment-based DB path (`DB_PATH`) enables safe local/test database isolation without modifying production-like baseline data.

## Known Tradeoffs
- The graph is rebuilt from SQLite for each request to keep implementation simple and deterministic; under higher traffic, this can be optimized with in-memory caching and cache invalidation on data changes.

## Endpoints
- `GET /route?from=<id>&to=<id>`: Find the shortest route (by `distance_km`) and whether destination is reachable.
- `GET /locations`: List all locations with type and direct road connection count.
- `POST /deliveries`: Create a new delivery departure record for a reachable customer.
- `PATCH /deliveries/:id/status`: Mark a departed delivery as arrived.
- `GET /locations/unreachable`: List customer locations that cannot be reached from depot.
- `GET /deliveries/summary`: Return per-customer delivery totals and most recent delivery time.

## Example cURL Commands
### 1) GET /route
```bash
curl "http://localhost:3000/route?from=1&to=7"
```
Example response:
```json
{
  "from": { "id": 1, "name": "Central Depot" },
  "to": { "id": 7, "name": "Petronas Cyberjaya" },
  "path": [
    { "id": 1, "name": "Central Depot" },
    { "id": 3, "name": "Shell Subang Jaya" },
    { "id": 7, "name": "Petronas Cyberjaya" }
  ],
  "total_distance_km": 40.5,
  "reachable": true
}
```

### 2) GET /locations
```bash
curl "http://localhost:3000/locations"
```
Example response:
```json
[
  { "id": 1, "name": "Central Depot", "type": "depot", "road_count": 3 },
  { "id": 2, "name": "Petronas Ara Damansara", "type": "customer", "road_count": 5 }
]
```

### 3) POST /deliveries
```bash
curl -X POST "http://localhost:3000/deliveries" \
  -H "Content-Type: application/json" \
  -d "{\"customer_id\":7,\"truck_plate\":\"WB5678C\"}"
```
Example response:
```json
{
  "id": 101,
  "customer_id": 7,
  "truck_plate": "WB5678C",
  "status": "departed",
  "departed_at": "2026-05-17T03:20:00.000Z",
  "arrived_at": null
}
```

### 4) PATCH /deliveries/:id/status
```bash
curl -X PATCH "http://localhost:3000/deliveries/1/status" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"arrived\"}"
```
Example response:
```json
{
  "id": 1,
  "customer_id": 7,
  "truck_plate": "WB5678C",
  "status": "arrived",
  "departed_at": "2026-05-16T09:10:00.000Z",
  "arrived_at": "2026-05-17T03:40:00.000Z"
}
```

### 5) GET /locations/unreachable
```bash
curl "http://localhost:3000/locations/unreachable"
```
Example response:
```json
[
  { "id": 11, "name": "Kerteh Terminal", "type": "customer" },
  { "id": 12, "name": "Gebeng Industrial Hub", "type": "customer" }
]
```

### 6) GET /deliveries/summary
```bash
curl "http://localhost:3000/deliveries/summary"
```
Example response:
```json
[
  {
    "customer_id": 7,
    "customer_name": "Petronas Cyberjaya",
    "total_deliveries": 3,
    "most_recent_delivery_at": "2026-05-17T03:20:00.000Z"
  }
]
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

### Unit Tests
Unit tests validate core graph logic without HTTP or database dependency:
- `tests/unit/dijkstra.test.ts`
  - shortest path selection by `distance_km`
  - unreachable destination behavior
  - same source/destination edge case
  - missing node handling
- `tests/unit/reachability.test.ts`
  - DFS reachable node discovery
  - connected vs disconnected node checks
  - non-existent start node behavior

### Integration Tests
Integration tests validate full request flow (route -> controller -> service -> repository -> SQLite):
- `tests/integration/route.test.ts`
  - reachable route (`200`)
  - unreachable route (`200` with `reachable=false`)
  - invalid query (`400`)
  - unknown location (`404`)
- `tests/integration/locations.test.ts`
  - `GET /locations` response shape and fields
  - `GET /locations/unreachable` expected unreachable customers
- `tests/integration/deliveries.test.ts`
  - `POST /deliveries` success and validation failures
  - `PATCH /deliveries/:id/status` valid transition and invalid transition (`422`)
  - `GET /deliveries/summary` response shape

### What Is Verified
- HTTP status codes match endpoint contract.
- Error responses follow the standard error format.
- Success responses include expected fields and types.
- Business rules are enforced (reachable customer validation, status transition rules).

## Assumptions
- Exactly one depot exists in `locations`.
- New deliveries are created with `status = departed`.
- Only `departed -> arrived` transition is valid.
- Unreachable detection is graph-based, not only road-count-based.

## Future Work
- Build a frontend dashboard to visualize the location graph, shortest path, and unreachable nodes interactively.
- Add authentication/authorization (for example, dispatcher/admin roles) for delivery operations.
- Add OpenAPI/Swagger documentation so endpoints can be explored and tested from a web UI.
- Add caching for graph loading to reduce repeated DB reads under higher traffic.
- Add CI pipeline checks (lint, tests, build) for safer and faster delivery.
