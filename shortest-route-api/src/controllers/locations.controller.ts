import { NextFunction, Request, Response } from "express";
import { listLocations, listUnreachableLocations } from "../services/locations.service";

export async function getUnreachableLocations(_req: Request, res: Response, next: NextFunction) {
    try {
        const locations = await listUnreachableLocations();
        return res.status(200).json(locations);
    } catch (err) {
        next(err);
    }
}

export async function getLocations(_req: Request, res: Response, next: NextFunction) {
    try {
        const locations = await listLocations();
        return res.status(200).json(locations);
    } catch (err) {
        next(err);
    }
}