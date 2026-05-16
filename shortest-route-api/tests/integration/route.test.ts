import request from 'supertest';
import app from '../../src/app';
import { describe, it, expect } from "vitest";

describe("GET /route", () => {
    it("should return 200 with reachable=true for reachable locations", async () => {
        const res = await request(app).get("/route?from=1&to=7");

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("from");
        expect(res.body).toHaveProperty("to");
        expect(res.body).toHaveProperty("reachable", true);
        expect(res.body).toHaveProperty("path");
        expect(res.body).toHaveProperty("total_distance_km");
        expect(Array.isArray(res.body.path)).toBe(true);
        expect(res.body.path.length).toBeGreaterThan(0);
    });

    it("should return 200 with reachable=false for unreachable locations", async () => {
        const res = await request(app).get("/route?from=1&to=11");

        expect(res.status).toBe(200);
        expect(res.body.reachable).toBe(false);
        expect(res.body.path).toEqual([]);
        expect(res.body.total_distance_km).toBeNull();
    });

    it("should return 400 for missing query parameters", async () => {
        const res = await request(app).get("/route?from=1");

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toHaveProperty("code");
        expect(res.body.error).toHaveProperty("message");
        expect(res.body.error).toHaveProperty("details");
        expect(Array.isArray(res.body.error.details)).toBe(true);
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for non-numeric query parameters", async () => {
        const res = await request(app).get("/route?from=abc&to=def");

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 404 for non-existent location", async () => {
        const res = await request(app).get("/route?from=999&to=1");

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("error");
        expect(res.body.error.code).toBe("NOT_FOUND");
    });
});
        