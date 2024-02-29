import { Router } from "express";
import getAutomoxDataExtracts from "../mongo/controllers/Automox/automoxDataExtracts.controller";
import automoxDeviceController from "../mongo/controllers/Automox/automoxDevice.controller";
import { getAutomoxServerGroups } from "../mongo/controllers/Automox/automoxServerGroups.controller";
import getAutomoxDeviceSoftware from "../mongo/controllers/Automox/automoxSoftware.controller";

const automoxRouter = Router();

automoxRouter.get("/device", automoxDeviceController.getDevice);
automoxRouter.get("/software", getAutomoxDeviceSoftware.getSoftware);
automoxRouter.get(
  "/data_extract",
  getAutomoxDataExtracts.requestNewAutomoxDataExtracts
);
automoxRouter.get("/server-reports", getAutomoxServerGroups);

export default automoxRouter;
