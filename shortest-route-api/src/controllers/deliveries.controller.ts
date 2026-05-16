import { NextFunction, Request, Response } from "express";
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
        const { id, status } = (req as any).validated;
        const updated = await markDeliveryArrived({
            delivery_id: id,
            status
        });

        return res.status(200).json(updated);
    } catch (err) {
        return next(err);
    }
}

export async function postDeliveryDeparture(req: Request, res: Response, next: NextFunction) {
    try {
        const { customer_id, truck_plate } = (req as any).validated;
        const created = await createDeliveryDepature({
            customer_id,
            truck_plate
        })

        return res.status(201).json(created);
    } catch (err) {
        return next(err);
    }
}