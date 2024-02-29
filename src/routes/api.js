/* eslint-disable import/no-import-module-exports */
// API Routes
import multer from "multer";
import { userAuth } from "../middlewares/auth.middleware";
import { userRoleCustomerAdmin } from "../middlewares/auth.role.admin";
import notificationController from "../Mysql/Notification/notification.controller";
// import { getAsset } from "../controllers/inventory/assetsController";
import {
  saveAssetsController,
  scanAutomoxAsset,
  restartAutomoxAsset,
} from "../Mysql/Assets/asset.controller";
import {
  assertByRisk,
  getAssetByType,
} from "../Mysql/GetAssets/getAssets.controller";
import integrationController from "../Mysql/Integration/integration.controller";
import invitationController from "../Mysql/Invitations/invitation.controller";
import { createGroup } from "../Mysql/PatchingGroups/patchingGroups.controller";
import {
  getAllSoftwareNames,
  getAllSoftwareOfCompany,
  getAssetSoftwareSearchFilter,
} from "../Mysql/AssetSoftwares/assetSoftware.controller";
import malwareBytesRouter from "./malwareBytes.Routes";
import auvikRouter from "./auvik.routes";
import humanRouter from "./human/routes";
import authRouter from "./auth.routes";
import userRouter from "./user.routes";
import integrationsRouter from "./integration.routes";
import automoxRouter from "./automox.routes";
import customerAdminRouter from "./customerAdmin.routes";
import assetsRouter from "./assets.routes";
import patchingAssetsRouter from "./patchingAssets.routes";
import { getCompanyTags } from "../Mysql/Tags/tags.controller";
import applicationRouter from "./application/routes";
import logsRouter from "./logs.routes";
import devRouter from "./dev.routes";
import secretsRouter from "./secrets.routes";
import riskViewRouter from "./riskView.routes";
import partnerRouter from "./partner.routes";
import assetsScoreManagementsRouter from "./assetsScoreManagement/routes";
import PrivilegeAccessScoreManagementsRouter from "./PrivilegeAccessScoreManagement/routes";
import ApplicationScoreManagementsRouter from "./ApplicationScoreManagement/routes";
import HumanScoreManagementsRouter from "./HumanScoreManagement/routes";
import adminRouter from "./superAdmin/routes";
import CVEsRouter from "./CVEs/routes";
import assetRouter from "./Asset/routes";
import riskCostFactorRouter from "./riskCostFactor/routes";
import downtimeProbabilityRouter from "./downtimeProbablity/routes";
import riskTolerance from "./riskTolerance/routes";
import VendorsRouter from "./Vendors/routes";
import OpenCVEsRouter from "./OpenCVEsApi/routes";
import backupAssetRouter from "./BackupAssets/routes";

const express = require("express");
const userController = require("../Mysql/Users/users.controller").default;
const adminController = require("../Mysql/Admin/admin.controller").default;

const router = express.Router();

router.use("/malware-bytes", malwareBytesRouter);
router.use(auvikRouter);
router.use(humanRouter);
router.use(riskViewRouter);
router.use("/risk-cost-factor", riskCostFactorRouter);
router.use("/downtime-probability", downtimeProbabilityRouter);
router.use("/risk-tolerance", riskTolerance);
router.use("/auth", authRouter);
router.use("/partner", partnerRouter);
router.use("/admin", adminRouter);
router.use("/users", userRouter);
router.use("/vendors", VendorsRouter);
router.use("/opencve", OpenCVEsRouter);

router.use("/", devRouter);
router.use("/", logsRouter);
router.use("/secrets", secretsRouter);
router.use("/admin", customerAdminRouter);

router.use("/automox", automoxRouter);

router.use("/asset", assetRouter);
router.use("/assets", assetsRouter);
router.use("/patching", patchingAssetsRouter);
router.use("/backup", backupAssetRouter);

router.use("/application", applicationRouter);

// assets score management routes
router.use("/asm", assetsScoreManagementsRouter);

// privilege access management routes
router.use("/pasm", PrivilegeAccessScoreManagementsRouter);

// applications management routes
router.use("/app-sm", ApplicationScoreManagementsRouter);

// Human management routes
router.use("/hsm", HumanScoreManagementsRouter);

// CVEs routes
router.use("/cves", CVEsRouter);

// integrations routes
router.use("/integrations", integrationsRouter);
router.get("/device/all", userAuth, getAssetByType);
router.post("/device/type/:device", userAuth, assertByRisk);
router.get("/firewal", (req, res) => {
  res.send("About us");
});
router.delete(
  "/delete/user/:id",
  userAuth,
  // userRoleCustomerAdmin,
  userController.deleteUser
);

const upload = multer({ dest: `public/uploads/profile_image/` });
upload.single("image");
router.post(
  "/profile/image",
  userAuth,
  upload.single("image"),
  userController.uploadProfileImage
);
router.post("/update/role/:id", userAuth, userController.updateRole);
router.delete(
  "/cancel-invitation/:id",
  userAuth,
  // userRoleCustomerAdmin,
  invitationController.cancelInvitation
);

// AdmiRoutes
router.get("/admins", userAuth, adminController.getUsers);
router.post("/admins/update", userAuth, adminController.updateUser);
router.get("/patch-url", userAuth, adminController.getPatchUrl);
router.post("/patch-url", userAuth, adminController.addPatchUrl);

// NotificationRoutes
router.get("/notification", userAuth, notificationController.getNotifications);
router.put(
  "/notification-seen/:id",
  userAuth,
  notificationController.makeNotificationSeen
);

router.get("/assets", userAuth, saveAssetsController);

router.get("/automox/org/:orgId", integrationController.getAutomoxOrganization);
router.post("/automoxasset/scan/:id", userAuth, scanAutomoxAsset);
router.post("/automoxasset/reboot/:id", userAuth, restartAutomoxAsset);

router.get("/company/software", userAuth, getAllSoftwareOfCompany);
router.get("/company/software/device/name", userAuth, getAllSoftwareNames);
router.get("/software/filter/:id", userAuth, getAssetSoftwareSearchFilter);

// Create New Group
router.post("/createGroup", userAuth, createGroup);
/* *************get tag api  ***************** */

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Tags
 *     tags: [Tags]
 *     security:
 *      - BearerAuth: []
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/sendInvite'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
router.get("/tags", userAuth, getCompanyTags);

module.exports = router;
