import { Router } from "express";
import { getRoute } from "../controllers/route.controller";
import { requireIntQuery } from "../middleware/validators";

const router = Router();

router.get(
    "/", 
    requireIntQuery("from"),
    requireIntQuery("to"),
    getRoute
);

export default router;