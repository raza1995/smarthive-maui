import { Router } from "express";
import { checkPermission } from "../../middlewares/auth.checkPermission";
import { userAuth } from "../../middlewares/auth.middleware";
import { updateAssetDetail } from "../../Mysql/AssetDetails/assetDetail.controller";
import { getAssetList } from "../../Mysql/Assets/asset.controller";
import { getAssetSoftwareForDevice } from "../../Mysql/AssetSoftwares/assetSoftware.controller";
import {
  assetById,
  getAssetTableFilter,
} from "../../Mysql/GetAssets/getAssets.controller";
import { permissionSlug } from "../../Mysql/Permissions/permissionSlugs";
import ASSET_URL from "./urlConstant";

const assetRouter = Router();

/**
 * @swagger
 * /asset/lists:
 *   get:
 *     summary: Returns list of assets
 *     tags: ["Assets"]
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
 *                 deviceType:
 *                   type: array
 *                   items:
 *                    type: string
 *                 asset_type:
 *                   type: array
 *                   items:
 *                    type: string
 *                 asset_sub_types:
 *                   type: array
 *                   items:
 *                    type: string
 *                 cves:
 *                   type: array
 *                   items:
 *                    type: object
 *                    properties:
 *                      id:
 *                       type: string
 *                      cve:
 *                       type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                assets:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      description: ""
 *                      format: uuid
 *                    company_id:
 *                      type: string
 *                      description: ""
 *                      format: uuid
 *                    asset_name:
 *                      type: string
 *                      description: ""
 *                    ipaddress:
 *                      type: string
 *                      description: ""
 *                    asset_sub_type:
 *                      type: string
 *                      description: ""
 *                    createdAt:
 *                      type: string
 *                      format: date-time
 *                      description: ""
 *                    updatedAt:
 *                      type: string
 *                      format: date-time
 *                      description: ""
 *                    endpoint_information_location:
 *                      type: boolean
 *                      description: ""
 *                    asset_score:
 *                      type: object
 *                      properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           asset_id:
 *                             type: string
 *                             format: uuid
 *                           company_id:
 *                             type: string
 *                             format: uuid
 *                           lifecycle_score:
 *                             type: number
 *                           endpoint_score:
 *                             type: number
 *                           backup_score:
 *                             type: number
 *                           patching_score:
 *                             type: number
 *                           real_time_score:
 *                             type: number
 *                           risk_score:
 *                             type: number
 *                           pure_risk_score:
 *                             type: number
 *                           is_pure_score:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                    asset_detail:
 *                      type: object
 *                      properties:
 *                           custom_name:
 *                             type: string
 *                           custom_location:
 *                             type: string
 *                    asset_tags:
 *                      type: array
 *                      items:
 *                       type: object
 *                       properties:
 *                          id:
 *                            type: string
 *                            format: uuid
 *                          tag_id:
 *                            type: string
 *                            format: uuid
 *                          asset_id:
 *                            format: uuid
 *                            type: string
 *                          createdAt:
 *                            type: string
 *                            format: date-time
 *                          updatedAt:
 *                            type: string
 *                            format: date-time
 *                    asset_endpoint_informations:
 *                      type: array
 *                      items:
 *                       type: object
 *                       properties:
 *                          id:
 *                            type: string
 *                            format: uuid
 *                          asset_id:
 *                            type: string
 *                            format: uuid
 *                          company_id:
 *                            type: string
 *                            format: uuid
 *                          integration_id:
 *                            type: string
 *                            format: uuid
 *                          display_name:
 *                            type: string
 *                          location:
 *                            type: string
 *                          serial_number:
 *                            type: string
 *                          os_family:
 *                            type: string
 *                          os_name:
 *                            type: string
 *                          os_install_version:
 *                            type: string
 *                          os_current_version:
 *                            type: string
 *                          risk_score:
 *                            type: number
 *                          status:
 *                            type: string
 *                          group:
 *                            type: string
 *                          server_group_id:
 *                            type: string
 *                          remediation_required_status:
 *                            type: boolean
 *                          remediation_required_infection_count:
 *                            type: number
 *                          reboot_required_status:
 *                            type: boolean
 *                          reboot_required_reasons_count:
 *                            type: number
 *                          suspicious_activity_status:
 *                            type: boolean
 *                          suspicious_activity_count:
 *                            type: number
 *                          isolation_status:
 *                            type: boolean
 *                          isolation_process_status:
 *                            type: boolean
 *                          isolation_network_status:
 *                            type: boolean
 *                          isolation_desktop_status:
 *                            type: boolean
 *                          scan_needed_status:
 *                            type: boolean
 *                          scan_needed_last_seen_at:
 *                            type: string
 *                          scan_needed_job_status:
 *                            type: string
 *                          last_user:
 *                            type: string
 *                          last_seen_at:
 *                            type: string
 *                          last_updated_at:
 *                            type: string
 *                            format: date-time
 *                          last_scan_time:
 *                            type: string
 *                          account_id:
 *                            type: string
 *                            format: uuid
 *                          createdAt:
 *                            type: string
 *                            format: date-time
 *                          updatedAt:
 *                            type: string
 *                            format: date-time
 *                totalCount:
 *                  type: number
 *                  example: 1
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetRouter.get(
  ASSET_URL.LIST.URL,
  [userAuth, checkPermission(ASSET_URL.LIST.SLUG, ASSET_URL.LIST.ACTION)],
  getAssetList
);
assetRouter.get("/filter", getAssetTableFilter);

/**
 * @swagger
 * /asset/detail/{id}:
 *   post:
 *     summary: Get detail of a asset
 *     tags: [Asset]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                data:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      description: ""          
 *                    first_name:
 *                      type: string
 *                      description: ""          
 *                    last_name:
 *                      type: string
 *                      description: ""  
 *                    email:
 *                      type: string
 *                      description: ""        
 *                    region:
 *                      type: string
 *                      description: ""          
 *                    region_can_update:
 *                      type: boolean
 *                    risk_score:
 *                      type: number
 *                      description: ""  
 *                    current_risk_score:
 *                      type: number
 *                      description: ""  
 *                    risk_score_history:
 *                      type: array
 *                    applications_count:
 *                      type: number
 *                    asset_count:
 *                      type: number          
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */


assetRouter.post(
  "/detail/:id",
  [
    userAuth,
    checkPermission(permissionSlug.RESILIENCE_ALL_ASSETS_DETAIL_VIEW, "view"),
  ],
  assetById
);
assetRouter.put(
  "/detail/:id",
  [
    userAuth,
    checkPermission(permissionSlug.RESILIENCE_ALL_ASSETS_DETAIL_VIEW, "view"),
  ],
  updateAssetDetail
);

assetRouter.get("/software/:id", userAuth, getAssetSoftwareForDevice);

export default assetRouter;
