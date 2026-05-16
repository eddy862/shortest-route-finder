import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError";
import { createDeliveryDepature, getDeliverySummary, markDeliveryArrived } from "../services/deliveries.service";

export async function getDeliverySummaryController(_req: Request, res: Response, next: NextFunction) {
    try {
        const summary = await getDeliverySummary();
        return res.status(200).json(summary);
    } catch (err) {
        return next(err);
    }
}

export async function patchDeliveryStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const idRaw = req.params.id;
        const deliveryId = Number(idRaw);

        if (isNaN(deliveryId)) {
            throw new HttpError(
                400,
                "VALIDATION_ERROR",
                "Invalid delivery id in path parameter",
                [
                    {
                        field: "id",
                        issue: "invalid integer"
                    }
                ]
            );
        }

        const body = req.body as Partial<{ status: unknown }>;

        if (body.status === undefined) {
            throw new HttpError(
                400,
                "VALIDATION_ERROR",
                "status is a required field",
                [
                    {
                        field: "status",
                        issue: "required"
                    }
                ]
            );
        }

        if (typeof body.status !== "string" || body.status.trim() === "") {
            throw new HttpError(
                400,
                "VALIDATION_ERROR",
                "status must be a non-empty string",
                [
                    {
                        field: "status",
                        issue: "invalid string value"
                    }
                ]
            );
        }

        const updated = await markDeliveryArrived({
            delivery_id: deliveryId,
            status: body.status
        });

        return res.status(200).json(updated);
    } catch (err) {
        return next(err);
    }
}

export async function postDeliveryDeparture(req: Request, res: Response, next: NextFunction) {
    try {
        const body = req.body as Partial<{ customer_id: unknown; truck_plate: unknown }>;

        if (body.customer_id === undefined || body.truck_plate === undefined) {
            throw new HttpError(
                400,
                "VALIDATION_ERROR",
                "customer_id and truck_plate are required fields",
                [
                    {
                        field: "customer_id",
                        issue: body.customer_id === undefined ? "required" : "ok"
                    },
                    {
                        field: "truck_plate",
                        issue: body.truck_plate === undefined ? "required" : "ok"
                    }
                ]
            );
        }

        const customerId = Number(body.customer_id);
        const truckPlate = String(body.truck_plate);

        if (isNaN(customerId)) {
            throw new HttpError(
                400,
                "VALIDATION_ERROR",
                "customer_id must be a valid integer",
                [
                    {
                        field: "customer_id",
                        issue: "invalid integer"
                    }
                ]
            );
        }

        if (typeof truckPlate !== "string" || truckPlate.trim() === "") {
            throw new HttpError(
                400,
                "VALIDATION_ERROR",
                "truck_plate must be a non-empty string",
                [
                    {
                        field: "truck_plate",
                        issue: "invalid string value"
                    }
                ]
            );
        }

        const created = await createDeliveryDepature({
            customer_id: customerId,
            truck_plate: truckPlate
        })

        return res.status(201).json(created);
    } catch (err) {
        return next(err);
    }
}