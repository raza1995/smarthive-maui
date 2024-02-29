import { Router } from "express";
import deviceController from "../mongo/controllers/auvik/deviceController";
import deviceDetailsController from "../mongo/controllers/auvik/deviceDetailsController";
import deviceLifecycleController from "../mongo/controllers/auvik/deviceLifecycleController";
import deviceWarrantyController from "../mongo/controllers/auvik/deviceWarrantyController";

const auvikRouter = Router();
// Auvik APIs to fetch device data
auvikRouter.get("/device/store/info", deviceController.import);
auvikRouter.get("/device/categories", deviceController.deviceCategories);

// Auvik APIs to fetch device detail data
auvikRouter.get("/device/store/details", deviceDetailsController.import);
// Auvik APIs to fetch device lifecycle data
auvikRouter.get("/device/store/lifecycle", deviceLifecycleController.import);
// Auvik APIs to fetch device warranty data
auvikRouter.get("/device/store/warranty", deviceWarrantyController.import);

export default auvikRouter;
