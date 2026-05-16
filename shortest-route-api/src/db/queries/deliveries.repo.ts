import { DeliveryRow, DeliveryStatus, DeliverySummaryRow } from "../types";
import { all, get, run } from "../sqlite";

export interface CreateDeliveryInput {
    customer_id: number;
    truck_plate: string;
    status: Extract<DeliveryStatus, "departed">;
}

export async function getDeliveryById(id: number): Promise<DeliveryRow | null> {
    const row = await get<DeliveryRow>(
        `SELECT id, customer_id, truck_plate, status, departed_at, arrived_at
         FROM deliveries
         WHERE id = ?`,
        [id]
    );
    return row ?? null;
}

export async function createDelivery(input: CreateDeliveryInput): Promise<DeliveryRow> {
    const status = input.status;
    // departed_at should looks like "2025-05-01 08:00:00"
    const departedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
    const result = await run(
        `INSERT INTO deliveries (customer_id, truck_plate, status, departed_at, arrived_at)
         VALUES (?, ?, ?, ?, NULL)`,
        [input.customer_id, input.truck_plate, status, departedAt]
    );

    const created = await getDeliveryById(result.lastID);
    if (!created) {
        throw new Error("Failed to load created delivery");
    }
    return created;
}

export async function updateDeliveryStatusToArrived(id: number): Promise<DeliveryRow | null> {
    const arrivedAt = new Date().toISOString().replace("T", " ").substring(0, 19);

    const result = await run(
        `UPDATE deliveries
         SET status = 'arrived', arrived_at = ?
         WHERE id = ? AND status = 'departed'`,
        [arrivedAt, id]
    );

    if (result.changes === 0) {
        return null;
    }

    return getDeliveryById(id);
}

export async function getDeliveriesByCustomerId(customerId: number): Promise<DeliveryRow[]> {
    return all<DeliveryRow>(
        `SELECT id, customer_id, truck_plate, status, departed_at, arrived_at
         FROM deliveries
         WHERE customer_id = ?
         ORDER BY departed_at DESC, id DESC`,
        [customerId]
    );
}

export async function getDeliverySummaryByCustomer(): Promise<DeliverySummaryRow[]> {
    return all<DeliverySummaryRow>(
        `SELECT
            l.id AS customer_id,
            l.name AS customer_name,
            COUNT(d.id) AS total_deliveries,
            MAX(d.departed_at) AS most_recent_delivery_at
         FROM locations l
         LEFT JOIN deliveries d
            ON d.customer_id = l.id
         WHERE l.type = 'customer'
         GROUP BY l.id, l.name
         ORDER BY l.id`
    );
}
