import { Router } from "express";
import { getDeliverySummaryController, patchDeliveryStatus, postDeliveryDeparture } from "../controllers/deliveries.controller";
import { requireBodyInt, requireBodyString, requireIntParam } from "../middleware/validators";

const router = Router();

router.post(
    "/", 
    requireBodyInt("customer_id"),
    requireBodyString("truck_plate"),
    postDeliveryDeparture
);
router.patch(
    "/:id/status", 
    requireIntParam("id"),
    requireBodyString("status"),
    patchDeliveryStatus
);
router.get("/summary", getDeliverySummaryController);

export default router;