import { NextFunction, Request, Response } from "express";
import { findShortestRoute } from "../services/route.service";

export async function getRoute(req: Request, res: Response, next: NextFunction) {
    try {
        const { from, to } = (req as any).validated;
        const result = await findShortestRoute(from, to);
        return res.status(200).json(result);
    } catch (err) {
        return next(err);
    }
}