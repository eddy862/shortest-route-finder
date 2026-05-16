import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../src/app";

describe("GET /locations", () => {
    it("should return 200 with a list of locations", async () => {
        const res = await request(app).get("/locations");

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);

        const first = res.body[0];
        expect(first).toHaveProperty("id");
        expect(first).toHaveProperty("name");
        expect(first).toHaveProperty("type");
        expect(first).toHaveProperty("road_count");
    });
});

describe("GET /locations/unreachable", () => {
    it("should return 200 with a list of unreachable locations", async () => {
        const res = await request(app).get("/locations/unreachable");

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        const ids = res.body.map((x: { id: number }) => x.id);
        expect(ids).toContain(11);
        expect(ids).toContain(12);
    });
});