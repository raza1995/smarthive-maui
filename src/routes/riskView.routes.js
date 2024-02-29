import { checkPermission } from "../middlewares/auth.checkPermission";
import { permissionSlug } from "../Mysql/Permissions/permissionSlugs";

const { Router } = require("express");
const { userAuth } = require("../middlewares/auth.middleware");
const { overviewData } = require("../Mysql/RiskView/riskView.controller");

const riskViewRouter = Router();
// Risk View

/**
 * @swagger
 * /riskview/overview:
 *   get:
 *     summary: Get Risk View
 *     tags: [Risk View]
 *     security:
 *      - BearerAuth: []
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                message:
 *                  type: string
 *                data:
 *                   type: object
 *                   properties:
 *                    totalApplicationsCount:
 *                      type: number
 *                    totalRiskApplicationCount:
 *                      type: number
 *                    totalSharedApplicationsCount:
 *                      type: number
 *                    totalRiskSharedApplicationsCount:
 *                      type: number
 *                    totalAssetsUsingApplication:
 *                      type: number
 *                    totalAssetsUsingApplicationAtRisk:
 *                      type: number
 *                    totalHumansUsingApplication:
 *                      type: number
 *                    totalHumansUsingApplicationAtRisk:
 *                      type: number
 *                    privilegeCount:
 *                      type: number
 *                    privilegeAtRiskCount:
 *                      type: number
 *                    riskScore:
 *                      type: number
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
riskViewRouter.get(
  "/riskview/overview",
  [userAuth, checkPermission(permissionSlug.RISK_VIEW_OVERVIEW, "view")],
  overviewData
);

export default riskViewRouter;
