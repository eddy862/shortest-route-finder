import { Router } from "express";
import { getDeliverySummaryController, patchDeliveryStatus, postDeliveryDeparture } from "../controllers/deliveries.controller";

const router = Router();

router.post("/", postDeliveryDeparture);
router.patch("/:id/status", patchDeliveryStatus);
router.get("/summary", getDeliverySummaryController);

export default router;