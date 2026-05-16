import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../src/app";

describe("POST /deliveries", () => {
    it("should return 201 with delivery details for valid input", async () => {
        const res = await request(app)
            .post("/deliveries").send({
                customer_id: 7,
                truck_plate: "ABC-123",
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty("customer_id", 7);
        expect(res.body).toHaveProperty("truck_plate", "ABC-123");
        expect(res.body).toHaveProperty("status", "departed");
        expect(res.body).toHaveProperty("departed_at");
        expect(res.body).toHaveProperty("arrived_at", null);
    });

    it("should return 401 for non-existent customer_id", async () => {
        const res = await request(app)
            .post("/deliveries").send({
                customer_id: 999,
                truck_plate: "ABC-123",
            });

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toHaveProperty("code", "NOT_FOUND");
    });

    it("should return 400 for unreachable customer_id", async () => {
        const res = await request(app)
            .post("/deliveries").send({
                customer_id: 11,
                truck_plate: "ABC-123",
            });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
    });

    it("should return 400 for missing fields", async () => {
        const res = await request(app)
            .post("/deliveries").send({
                truck_plate: "ABC-123",
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
    });
});

describe("PATCH /deliveries/:id/status", () => {
    it("should return 200 when transitioning from departed to arrived", async () => {
        const created = await request(app).post("/deliveries").send({
            customer_id: 7,
            truck_plate: "XYZ-789",
        });
        expect(created.status).toBe(201);

        const deliveryId = created.body.id;

        const res = await request(app)
            .patch(`/deliveries/${deliveryId}/status`).send({
                status: "arrived",
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("id", deliveryId);
        expect(res.body).toHaveProperty("status", "arrived");
        expect(res.body).toHaveProperty("arrived_at");
        expect(res.body.arrived_at).not.toBeNull();
    });

    it("should return 422 for invalid transition (arrived -> arrived)", async () => {
        const created = await request(app).post("/deliveries").send({
            customer_id: 7,
            truck_plate: "LMN-456",
        });
        expect(created.status).toBe(201);

        const deliveryId = created.body.id;

        await request(app)
            .patch(`/deliveries/${deliveryId}/status`).send({
                status: "arrived",
            });
        const second = await request(app)
            .patch(`/deliveries/${deliveryId}/status`).send({
                status: "arrived",
            });

        expect(second.status).toBe(422);
        expect(second.body).toHaveProperty("error");
        expect(second.body.error).toHaveProperty("code", "UNPROCESSABLE_STATE");
    });

    it("should return 404 for non-existent delivery", async () => {
        const res = await request(app)
            .patch("/deliveries/999/status").send({
                status: "arrived",
            });

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toHaveProperty("code", "NOT_FOUND");
    });

    it("should return 400 for invalid status value", async () => {
        const created = await request(app).post("/deliveries").send({
            customer_id: 7,
            truck_plate: "PQR-321",
        });
        expect(created.status).toBe(201);

        const deliveryId = created.body.id;

        const res = await request(app)
            .patch(`/deliveries/${deliveryId}/status`).send({
                status: "invalid_status",
            });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
    });

    it("should return 400 for invalid id parameter", async () => {
        const res = await request(app)
            .patch("/deliveries/abc/status").send({
                status: "arrived",
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
    });
});

describe("GET /deliveries/summary", () => {
    it("should return 200 with summary data per customer", async () => {
        const res = await request(app).get("/deliveries/summary");

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);

        const first = res.body[0];
        expect(first).toHaveProperty("customer_id");
        expect(first).toHaveProperty("customer_name");
        expect(first).toHaveProperty("total_deliveries");
        expect(first).toHaveProperty("most_recent_delivery_at");
    });
});
