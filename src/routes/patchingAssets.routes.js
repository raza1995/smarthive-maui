import { Router } from "express";
import { checkPermission } from "../middlewares/auth.checkPermission";
import { userAuth } from "../middlewares/auth.middleware";

import {
  getPatchingAssetById,
  getPatchingAssetsFilters,
  patchingAssets,
  patchSoftwareOfAsset,
} from "../Mysql/AssetPatchingInformation/assetPatchingInformation.controller";
import { permissionSlug } from "../Mysql/Permissions/permissionSlugs";

const patchingAssetsRouter = Router();
// Get patching Asset

/**
 * @swagger
 * /patching/assets/list:
 *   get:
 *     summary: Get Patching assets List
 *     tags: [Patching assets]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: size
 *         required: true
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *            type: integer
 *            example: 1
 *       - in: query
 *         name: filter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 search:
 *                   type: string
 *                 severityStatus:
 *                   type: array
 *                   items:
 *                    type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                tableData:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      format: uuid
 *                    asset_name:
 *                      type: string
 *                      description: ""
 *                    group_assets:
 *                      type: array
 *                      items:
 *                        type: string
 *                    agent_status:
 *                      type: boolean
 *                    all_patch_installed:
 *                      type: boolean
 *                      description: ""
 *                    compliant:
 *                      type: boolean
 *                      description: ""
 *                    connected:
 *                      type: boolean
 *                      description: ""
 *                    cpu:
 *                      type: string
 *                    device_status:
 *                      type: string
 *                    display_name:
 *                      type: string
 *                    exception:
 *                      type: boolean
 *                      description: ""
 *                    is_compatible:
 *                      type: boolean
 *                      description: ""
 *                    is_uptoDate:
 *                      type: boolean
 *                    last_logged_in_user:
 *                      type: string
 *                    os_name:
 *                      type: string
 *                    os_family:
 *                      type: string
 *                    os_version:
 *                      type: string
 *                    patch_severity:
 *                      type: string
 *                    policy_status:
 *                      type: string
 *                    risk_score:
 *                      type: number
 *                    volume:
 *                      type: number
 *                    tags:
 *                      type: array
 *                      items:
 *                       type: object
 *                       properties:
 *                       id:
 *                        type: string
 *                        format: uuid
 *                       label:
 *                        type: string
 *                totalCount:
 *                  type: number
 *                  example: 1
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
patchingAssetsRouter.get(
  "/assets/list",
  [
    userAuth,
    checkPermission(permissionSlug.RESILIENCE_PATCHING_DEVICES, "view"),
  ],
  patchingAssets
);
// Patching Filter

/**
 * @swagger
 * /patching/assets/filters:
 *   get:
 *     summary: Get Patching Filter
 *     tags: [Patching assets]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: size
 *         required: true
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *            type: integer
 *            example: 1
 *       - in: query
 *         name: filter
 *         required: false
 *         schema:
 *            type: object
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                policies:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      format: uuid
 *                    name:
 *                      type: string
 *                groups:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      format: uuid
 *                    name:
 *                      type: string
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
patchingAssetsRouter.get(
  "/assets/filters",
  [
    userAuth,
    checkPermission(permissionSlug.RESILIENCE_PATCHING_DEVICES, "view"),
  ],
  getPatchingAssetsFilters
);

// Get All patching Asset By ID

/**
 * @swagger
 * /patching/asset/{id}:
 *   get:
 *     summary: Get Patching assets by Id
 *     tags: [Patching assets]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *          format: uuid
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 company_id:
 *                   type: string
 *                   format: uuid
 *                 asset_name:
 *                   type: string
 *                   description: ""
 *                 ipaddress:
 *                   type: string
 *                   description: ""
 *                 asset_type:
 *                   type: string
 *                   description: ""
 *                 asset_sub_type:
 *                   type: string
 *                 tags:
 *                   type: array
 *                   items:
 *                    type: object
 *                    properties:
 *                    id:
 *                     type: string
 *                     format: uuid
 *                    label:
 *                     type: string
 *                 integration_id:
 *                    type: string
 *                 display_name:
 *                   type: string
 *                 group:
 *                   type: string
 *                   description: ""
 *                 server_group_id:
 *                   type: string
 *                   description: ""
 *                 serial_number:
 *                   type: string
 *                 os_family:
 *                   type: string
 *                 os_name:
 *                   type: string
 *                 os_version:
 *                   type: string
 *                 risk_score:
 *                   type: number
 *                 status:
 *                   type: string
 *                 device_status:
 *                   type: string
 *                 agent_status:
 *                   type: string
 *                 policy_status:
 *                   type: string
 *                 connected:
 *                   type: boolean
 *                 compliant:
 *                   type: boolean
 *                 exception:
 *                   type: boolean
 *                 is_compatible:
 *                   type: boolean
 *                 cpu:
 *                   type: string
 *                 ram:
 *                   type: string
 *                 volume:
 *                   type: number
 *                 last_logged_in_user:
 *                   type: string
 *                 model:
 *                   type: string
 *                 last_seen:
 *                   type: string
 *                   format: date-time
 *                 last_scan_time:
 *                   type: string
 *                   format: date-time
 *                 device_require_reboot:
 *                   type: boolean
 *                 next_patch_window:
 *                   type: string
 *                 is_uptoDate:
 *                   type: boolean
 *                 number_of_patch_available:
 *                   type: string
 *                 patch_severity:
 *                   type: string
 *                 patching_available_from:
 *                   type: string
 *                 all_patch_installed:
 *                   type: string
 *                 custom_name:
 *                   type: string
 *                 custom_location:
 *                   type: string
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
patchingAssetsRouter.get(
  "/asset/:id",
  [
    userAuth,
    checkPermission(
      permissionSlug.RESILIENCE_PATCHING_DEVICES_VIEW_INFO,
      "view"
    ),
  ],
  getPatchingAssetById
);

// Get All patching Software

/**
 * @swagger
 * /patching/software/patches:
 *   post:
 *     summary: Get all Patching Software
 *     tags: [Patching assets]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: ""
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                patches_ids:
 *                  type: array
 *                  items:
 *                    type: string
 *                    format: uuid
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                status:
 *                  type: string
 *                  description: ""
 *                message:
 *                  type: string
 *                  description: ""
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
patchingAssetsRouter.post(
  "/software/patches",
  [
    userAuth,
    checkPermission(
      permissionSlug.RESILIENCE_PATCHING_DEVICES_VIEW_SOFTWARES,
      "patch_software"
    ),
  ],
  patchSoftwareOfAsset
);

export default patchingAssetsRouter;
