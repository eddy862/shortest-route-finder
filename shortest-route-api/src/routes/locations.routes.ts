import { Router } from "express";
import { getLocations, getUnreachableLocations } from "../controllers/locations.controller";

const router = Router();

router.get("/", getLocations);
router.get("/unreachable", getUnreachableLocations);

export default router;