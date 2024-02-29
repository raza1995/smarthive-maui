import { Router } from "express";
import { userAuth } from "../middlewares/auth.middleware";
import {
  addDeviceToOtherGroup,
  createGroup,
  deleteGroup,
  editGroup,
  getAllGroups,
  getGroupByID,
  groupsData,
} from "../Mysql/PatchingGroups/patchingGroups.controller";
import {
  createPolicy,
  deletePolicy,
  editPolicy,
  getAllPolicies,
  getDeviceTargettingOptions,
  getPolicyByCompanyId,
  getPolicyByID,
} from "../Mysql/PatchingPolicy/patchingPolicy.controller";
import {
  assetsOverview,
  getAssetSelectionList,
  patchingAssetsOverview,
} from "../Mysql/Assets/asset.controller";
import { getEndpointEventById } from "../Mysql/endpointEvent/endpointEvent.controller";
import { getDetectionById } from "../Mysql/EndpointsDetections/endpointsDetections.controller";
import { getQuarantinesById } from "../Mysql/EndpointsQuaratines/endpointQuarantines.controller";
import { getSuspiciousActivityById } from "../Mysql/EndpointsSuspiciousActivity/endpointSuspiciousActivity.controller";
import {
  endpointAssetList,
  endpointAssetsOverview,
  getEndpointAsset,
} from "../Mysql/AssetEndpointInformation/assetEndpointInformation.controller";
import { updateDeviceTags } from "../Mysql/AssetTags/assetTags.controller";
import { checkPermission } from "../middlewares/auth.checkPermission";
import { permissionSlug } from "../Mysql/Permissions/permissionSlugs";

const assetsRouter = Router();
// router.post("type/:device", userAuth, assertByRisk);

/**
 * @swagger
 * /assets/selection/list:
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

assetsRouter.get(
  "/selection/list",
  [userAuth, checkPermission(permissionSlug.RESILIENCE_ALL_ASSETS, "view")],
  getAssetSelectionList
);

/**
 * @swagger
 * /assets/overview:
 *   get:
 *     summary: Get overview detail
 *     tags: ["Assets"]
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
 *                   endpointCount:
 *                     type: number
 *                   peerScore:
 *                     type: string
 *                   unknownAssets:
 *                     type: number
 *                   assetsAtRisk:
 *                     type: number
 *                   avgScore:
 *                     type: number
 *                   companyAvgScore:
 *                     type: number
 *                   totalAssetsCount:
 *                     type: number
 *                   patching:
 *                     type: object
 *                     properties:
 *                         patchingAvailable:
 *                           type: boolean
 *                         updatedAssetsCount:
 *                           type: number
 *                         AssetNeedAttention:
 *                           type: number
 *                         assetswithoutPatch:
 *                           type: number
 *                         totalPatchingAssetsCount:
 *                           type: number
 *                         needingAttention:
 *                           type: number
 *                   endpoint:
 *                     type: object
 *                     properties:
 *                         endpointAvailable:
 *                           type: boolean
 *                         totalDetections:
 *                           type: object
 *                           properties:
 *                               count:
 *                                 type: number
 *                               assetsCount:
 *                                 type: number
 *                         totalSuspiciousActivity:
 *                           type: object
 *                           properties:
 *                               count:
 *                                 type: number
 *                               assetsCount:
 *                                 type: number
 *                         restartRequiredAssetsCount:
 *                           type: number
 *                         remediationRequiredAssetsCount:
 *                           type: number
 *                         scanNeededAssetsCount:
 *                           type: number
 *                         endpointIsolatedAssetsCount:
 *                           type: number
 *
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsRouter.get(
  "/overview",
  [userAuth, checkPermission(permissionSlug.RESILIENCE_OVERVIEW, "view")],
  assetsOverview
);

/**
 * @swagger
 * /assets/patching/overview:
 *   get:
 *     summary: Get overview detail
 *     tags: ["Patching assets"]
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
 *                   assetsAtRisk:
 *                     type: number
 *                   avgScore:
 *                     type: number
 *                   companyAvgScore:
 *                     type: number
 *                   totalAssetsCount:
 *                     type: number
 *                   patching:
 *                     type: object
 *                     properties:
 *                         patchingAvailable:
 *                           type: boolean
 *                         updatedAssetsCount:
 *                           type: number
 *                         AssetNeedAttention:
 *                           type: number
 *                         assetswithoutPatch:
 *                           type: number
 *                         totalPatchingAssetsCount:
 *                           type: number
 *                         needingAttention:
 *                           type: number
 *                   endpoint:
 *                     type: object
 *                     properties:
 *                         endpointAvailable:
 *                           type: boolean
 *                         totalDetections:
 *                           type: object
 *                           properties:
 *                               count:
 *                                 type: number
 *                               assetsCount:
 *                                 type: number
 *                         totalSuspiciousActivity:
 *                           type: object
 *                           properties:
 *                               count:
 *                                 type: number
 *                               assetsCount:
 *                                 type: number
 *                         restartRequiredAssetsCount:
 *                           type: number
 *                         remediationRequiredAssetsCount:
 *                           type: number
 *                         scanNeededAssetsCount:
 *                           type: number
 *                         endpointIsolatedAssetsCount:
 *                           type: number
 *
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsRouter.get(
  "/patching/overview",
  [
    userAuth,
    checkPermission(permissionSlug.RESILIENCE_PATCHING_OVERVIEW, "view"),
  ],
  patchingAssetsOverview
);

/**
 * @swagger
 * /assets/patching/groups/list:
 *   get:
 *     summary: Get list og patching groups
 *     tags: ["Patching groups"]
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
 *                 name:
 *                   type: string
 *                 status:
 *                   type: string
 *                 os:
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     server_group_id  :
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     ui_color:
 *                       type: string
 *                       example: "#8879E4"
 *                     notes:
 *                       type: string
 *                     refresh_interval:
 *                       type: number
 *                     enable_os_auto_update:
 *                       type: string
 *                     enable_wsus:
 *                       type: string
 *                     wsus_server:
 *                       type: string
 *                     policies:
 *                       type: array
 *                       items:
 *                        type: string
 *                        format: uuid
 *                       example: []
 *                     devices:
 *                       type: array
 *                       items:
 *                        type: string
 *                        format: uuid
 *                       example: []
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                totalCount:
 *                  type: number
 *                  example: 1
 *
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsRouter.get(
  "/patching/groups/list",
  [
    userAuth,
    checkPermission(permissionSlug.RESILIENCE_PATCHING_GROUPS, "view"),
  ],
  groupsData
);

/**
 * @swagger
 * /assets/patching/create/group:
 *   post:
 *     summary: Create Patching Group
 *     tags: [ "Patching groups" ]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: ""
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                name:
 *                  type: string
 *                ui_color:
 *                  type: string
 *                  example: "#8879E4"
 *                notes:
 *                  type: string
 *                refresh_interval:
 *                  type: number
 *                enable_os_auto_update:
 *                  type: string
 *                enable_wsus:
 *                  type: string
 *                wsus_server:
 *                  type: string
 *                policies:
 *                  type: array
 *                  items:
 *                   type: string
 *                   format: uuid
 *                  example: []
 *                devices:
 *                  type: array
 *                  items:
 *                   type: string
 *                   format: uuid
 *                  example: []
 *               required:
 *                - name
 *                - ui_color
 *                - notes
 *                - refresh_interval
 *                - enable_os_auto_update
 *                - enable_wsus
 *                - wsus_server
 *                - devices
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                groupName:
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

assetsRouter.post(
  "/patching/create/group",
  [userAuth, checkPermission(permissionSlug.RESILIENCE_PATCHING_GROUPS, "add")],
  createGroup
);

/**
 * @swagger
 * /assets/patching/edit-group:
 *   put:
 *     summary:  Update Patching Group
 *     tags: ["Patching groups"]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: ""
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                id:
 *                  type: string
 *                  format: uuid
 *                name:
 *                  type: string
 *                ui_color:
 *                  type: string
 *                  example: "#8879E4"
 *                notes:
 *                  type: string
 *                refresh_interval:
 *                  type: number
 *                enable_os_auto_update:
 *                  type: string
 *                enable_wsus:
 *                  type: string
 *                wsus_server:
 *                  type: string
 *                policies:
 *                  type: array
 *                  items:
 *                   type: string
 *                   format: uuid
 *                  example: []
 *                devices:
 *                  type: array
 *                  items:
 *                   type: string
 *                   format: uuid
 *                  example: []
 *               required:
 *                - name
 *                - ui_color
 *                - notes
 *                - refresh_interval
 *                - enable_os_auto_update
 *                - enable_wsus
 *                - wsus_server
 *                - devices
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
 *                  description: ""
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsRouter.put(
  "/patching/edit-group",
  [
    userAuth,
    checkPermission(permissionSlug.RESILIENCE_PATCHING_GROUPS, "edit"),
  ],
  editGroup
);

/**
 * @swagger
 * /assets/patching/group/delete/{id}:
 *   delete:
 *     summary: Delete patching with givin id
 *     tags: ["Patching groups"]
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
 *         description: success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                message:
 *                  type: string
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsRouter.delete(
  "/patching/group/delete/:id",
  [
    userAuth,
    checkPermission(permissionSlug.RESILIENCE_PATCHING_GROUPS, "delete"),
  ],
  deleteGroup
);

/**
 * @swagger
 * /assets/patching/group/{id}:
 *   get:
 *     summary: Get full detail of particular group by id
 *     tags: ["Patching groups"]
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
 *                   message:
 *                     type: string
 *                   group:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       server_group_id:
 *                         type: string
 *                         format: uuid
 *                       company_id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       ui_color:
 *                         type: string
 *                         example: "#8879E4"
 *                       notes:
 *                         type: string
 *                       refresh_interval:
 *                         type: number
 *                       enable_os_auto_update:
 *                         type: string
 *                       enable_wsus:
 *                         type: string
 *                       wsus_server:
 *                         type: string
 *                       policies:
 *                         type: array
 *                         items:
 *                          type: string
 *                          format: uuid
 *                         example: []
 *                       devices:
 *                         type: array
 *                         items:
 *                          type: object
 *                          properties:
 *                             id:
 *                              type: string
 *                              format: uuid
 *                             asset_name:
 *                              type: string
 *                             ipaddress:
 *                              type: string
 *                             os_version:
 *                              type: string
 *                             tags:
 *                               type: array
 *                               items:
 *                                type: object
 *                               example: []
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsRouter.get(
  "/patching/group/:id",
  [
    userAuth,
    checkPermission(permissionSlug.RESILIENCE_PATCHING_OVERVIEW, "view"),
  ],
  getGroupByID
);

/**
 * @swagger
 * /assets/policies/list:
 *   get:
 *     summary: Get list of patching policies
 *     tags: ["Patching policies"]
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
 *                policies:
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       company_id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       policy_type_name:
 *                         type: string
 *                       configuration:
 *                         type: object
 *                         properties:
 *                           auto_patch:
 *                             type: string
 *                           auto_reboot:
 *                             type: boolean
 *                           custom_notification_deferment_periods:
 *                             type: array
 *                             items:
 *                              type: number
 *                           custom_notification_max_delays:
 *                             type: number
 *                           custom_notification_patch_message:
 *                             type: string
 *                           custom_notification_patch_message_mac:
 *                             type: string
 *                           custom_notification_reboot_message:
 *                             type: string
 *                           custom_notification_reboot_message_mac:
 *                             type: string
 *                           custom_pending_reboot_notification_deferment_periods:
 *                             type: array
 *                             items:
 *                              type: number
 *                           custom_pending_reboot_notification_max_delays:
 *                             type: number
 *                           custom_pending_reboot_notification_message:
 *                             type: string
 *                           custom_pending_reboot_notification_message_mac:
 *                             type: string
 *                           device_filters:
 *                             type: array
 *                             items:
 *                              type: number
 *                           device_filters_enabled:
 *                             type: boolean
 *                           filter_type:
 *                             type: string
 *                           filters:
 *                             type: array
 *                             items:
 *                              type: string
 *                           include_optional:
 *                             type: boolean
 *                           missed_patch_window:
 *                             type: boolean
 *                           notify_deferred_reboot_user:
 *                             type: boolean
 *                           notify_deferred_reboot_user_message_timeout:
 *                             type: number
 *                           notify_reboot_user:
 *                             type: boolean
 *                           notify_user:
 *                             type: string
 *                           notify_user_message_timeout:
 *                             type: number
 *                           patch_ids:
 *                             type: array
 *                             items:
 *                              type: string
 *                           patch_rule:
 *                             type: string
 *                           severity_filter:
 *                             type: array
 *                             items:
 *                              type: string
 *                           timezone:
 *                             type: string
 *                             format: date-time
 *                           utc_time:
 *                             type: number
 *                             format: date-time
 *                       groupList:
 *                        type: array
 *                        items:
 *                          type: string
 *                       notes:
 *                        type: string
 *                       packageList:
 *                        type: array
 *                        items:
 *                         type: string
 *                       schedule_days:
 *                         type: string
 *                       schedule_months:
 *                         type: string
 *                       schedule_time:
 *                         type: string
 *                       schedule_weeks_of_month:
 *                         type: string
 *                       server_groups:
 *                         type: array
 *                         item:
 *                          type: string
 *                       showFilters:
 *                         type: boolean
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: uuid
 *                       updatedAt:
 *                         type: string
 *                         format: uuid
 *
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsRouter.get("/policies/list", userAuth, getPolicyByCompanyId);

/**
 * @swagger
 * /assets/patching/policy/create:
 *   post:
 *     summary: Create patching policy
 *     tags: ["Patching policies"]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: ""
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 configuration:
 *                   type: object
 *                   properties:
 *                     auto_patch:
 *                       type: string
 *                     auto_reboot:
 *                       type: boolean
 *                     custom_notification_deferment_periods:
 *                       type: array
 *                       items:
 *                        type: number
 *                     custom_notification_max_delays:
 *                       type: number
 *                     custom_notification_patch_message:
 *                       type: string
 *                     custom_notification_patch_message_mac:
 *                       type: string
 *                     custom_notification_reboot_message:
 *                       type: string
 *                     custom_notification_reboot_message_mac:
 *                       type: string
 *                     custom_pending_reboot_notification_deferment_periods:
 *                       type: array
 *                       items:
 *                        type: number
 *                     custom_pending_reboot_notification_max_delays:
 *                       type: number
 *                     custom_pending_reboot_notification_message:
 *                       type: string
 *                     custom_pending_reboot_notification_message_mac:
 *                       type: string
 *                     device_filters:
 *                       type: array
 *                       items:
 *                        type: number
 *                     device_filters_enabled:
 *                       type: boolean
 *                     filter_type:
 *                       type: string
 *                     filters:
 *                       type: array
 *                       items:
 *                        type: string
 *                     include_optional:
 *                       type: boolean
 *                     missed_patch_window:
 *                       type: boolean
 *                     notify_deferred_reboot_user:
 *                       type: boolean
 *                     notify_deferred_reboot_user_message_timeout:
 *                       type: number
 *                     notify_reboot_user:
 *                       type: boolean
 *                     notify_user:
 *                       type: string
 *                     notify_user_message_timeout:
 *                       type: number
 *                     patch_ids:
 *                       type: array
 *                       items:
 *                        type: string
 *                     patch_rule:
 *                       type: string
 *                     severity_filter:
 *                       type: array
 *                       items:
 *                        type: string
 *                     timezone:
 *                       type: string
 *                       format: date-time
 *                     utc_time:
 *                       type: number
 *                       format: date-time
 *                 groupList:
 *                  type: array
 *                  items:
 *                    type: string
 *                 name:
 *                  type: string
 *                 notes:
 *                  type: string
 *                 packageList:
 *                  type: array
 *                  items:
 *                   type: string
 *                 policy_type_name:
 *                   type: string
 *                 schedule_days:
 *                   type: string
 *                 schedule_months:
 *                   type: string
 *                 schedule_time:
 *                   type: string
 *                 schedule_weeks_of_month:
 *                   type: string
 *                 server_groups:
 *                   type: array
 *                   item:
 *                    type: string
 *                 showFilters:
 *                   type: boolean
 *                 status:
 *                   type: string
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

assetsRouter.post(
  "/patching/policy/create",
  [
    userAuth,
    checkPermission(permissionSlug.RESILIENCE_PATCHING_POLICIES, "add"),
  ],
  createPolicy
);

/**
 * @swagger
 * /assets/patching/policy/edit:
 *   put:
 *     summary:  update patching groups
 *     tags: ["Patching policies"]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: ""
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 id:
 *                  type: string
 *                  format: uuid
 *                 company_id:
 *                  type: string
 *                  format: uuid
 *                 configuration:
 *                   type: object
 *                   properties:
 *                     auto_patch:
 *                       type: string
 *                     auto_reboot:
 *                       type: boolean
 *                     custom_notification_deferment_periods:
 *                       type: array
 *                       items:
 *                        type: number
 *                     custom_notification_max_delays:
 *                       type: number
 *                     custom_notification_patch_message:
 *                       type: string
 *                     custom_notification_patch_message_mac:
 *                       type: string
 *                     custom_notification_reboot_message:
 *                       type: string
 *                     custom_notification_reboot_message_mac:
 *                       type: string
 *                     custom_pending_reboot_notification_deferment_periods:
 *                       type: array
 *                       items:
 *                        type: number
 *                     custom_pending_reboot_notification_max_delays:
 *                       type: number
 *                     custom_pending_reboot_notification_message:
 *                       type: string
 *                     custom_pending_reboot_notification_message_mac:
 *                       type: string
 *                     device_filters:
 *                       type: array
 *                       items:
 *                        type: number
 *                     device_filters_enabled:
 *                       type: boolean
 *                     filter_type:
 *                       type: string
 *                     filters:
 *                       type: array
 *                       items:
 *                        type: string
 *                     include_optional:
 *                       type: boolean
 *                     missed_patch_window:
 *                       type: boolean
 *                     notify_deferred_reboot_user:
 *                       type: boolean
 *                     notify_deferred_reboot_user_message_timeout:
 *                       type: number
 *                     notify_reboot_user:
 *                       type: boolean
 *                     notify_user:
 *                       type: string
 *                     notify_user_message_timeout:
 *                       type: number
 *                     patch_ids:
 *                       type: array
 *                       items:
 *                        type: string
 *                     patch_rule:
 *                       type: string
 *                     severity_filter:
 *                       type: array
 *                       items:
 *                        type: string
 *                     timezone:
 *                       type: string
 *                       format: date-time
 *                     utc_time:
 *                       type: number
 *                       format: date-time
 *                 createdAt:
 *                    type: string
 *                    format: date-time
 *                 name:
 *                  type: string
 *                 notes:
 *                  type: string
 *                 policy_groups:
 *                  type: array
 *                  items:
 *                   type: string
 *                 policy_type_name:
 *                   type: string
 *                 schedule_days:
 *                   type: string
 *                 schedule_months:
 *                   type: string
 *                 schedule_time:
 *                   type: string
 *                 schedule_weeks_of_month:
 *                   type: string
 *                 server_groups:
 *                   type: array
 *                   item:
 *                    type: string
 *                 status:
 *                   type: string
 *                 updatedAt :
 *                   type: string
 *                   format: date-time
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

assetsRouter.put(
  "/patching/policy/edit",
  [
    userAuth,
    checkPermission(permissionSlug.RESILIENCE_PATCHING_POLICIES, "edit"),
  ],
  editPolicy
);

/**
 * @swagger
 * /assets/patching/policy/delete/{id}:
 *   delete:
 *     summary: Delete patching with givin id
 *     tags: ["Patching policies"]
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
 *                message:
 *                  type: string
 *                policy:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       company_id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       policy_type_name:
 *                         type: string
 *                       configuration:
 *                         type: object
 *                         properties:
 *                           auto_patch:
 *                             type: string
 *                           auto_reboot:
 *                             type: boolean
 *                           custom_notification_deferment_periods:
 *                             type: array
 *                             items:
 *                              type: number
 *                           custom_notification_max_delays:
 *                             type: number
 *                           custom_notification_patch_message:
 *                             type: string
 *                           custom_notification_patch_message_mac:
 *                             type: string
 *                           custom_notification_reboot_message:
 *                             type: string
 *                           custom_notification_reboot_message_mac:
 *                             type: string
 *                           custom_pending_reboot_notification_deferment_periods:
 *                             type: array
 *                             items:
 *                              type: number
 *                           custom_pending_reboot_notification_max_delays:
 *                             type: number
 *                           custom_pending_reboot_notification_message:
 *                             type: string
 *                           custom_pending_reboot_notification_message_mac:
 *                             type: string
 *                           device_filters:
 *                             type: array
 *                             items:
 *                              type: number
 *                           device_filters_enabled:
 *                             type: boolean
 *                           filter_type:
 *                             type: string
 *                           filters:
 *                             type: array
 *                             items:
 *                              type: string
 *                           include_optional:
 *                             type: boolean
 *                           missed_patch_window:
 *                             type: boolean
 *                           notify_deferred_reboot_user:
 *                             type: boolean
 *                           notify_deferred_reboot_user_message_timeout:
 *                             type: number
 *                           notify_reboot_user:
 *                             type: boolean
 *                           notify_user:
 *                             type: string
 *                           notify_user_message_timeout:
 *                             type: number
 *                           patch_ids:
 *                             type: array
 *                             items:
 *                              type: string
 *                           patch_rule:
 *                             type: string
 *                           severity_filter:
 *                             type: array
 *                             items:
 *                              type: string
 *                           timezone:
 *                             type: string
 *                             format: date-time
 *                           utc_time:
 *                             type: number
 *                             format: date-time
 *                       groupList:
 *                        type: array
 *                        items:
 *                          type: string
 *                       notes:
 *                        type: string
 *                       packageList:
 *                        type: array
 *                        items:
 *                         type: string
 *                       schedule_days:
 *                         type: string
 *                       schedule_months:
 *                         type: string
 *                       schedule_time:
 *                         type: string
 *                       schedule_weeks_of_month:
 *                         type: string
 *                       server_groups:
 *                         type: array
 *                         item:
 *                          type: string
 *                       showFilters:
 *                         type: boolean
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: uuid
 *                       updatedAt:
 *                         type: string
 *                         format: uuid
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsRouter.delete(
  "/patching/policy/delete/:id",
  [
    userAuth,
    checkPermission(permissionSlug.RESILIENCE_PATCHING_POLICIES, "delete"),
  ],
  deletePolicy
);

/**
 * @swagger
 * /assets/patching/policy/{id}:
 *   get:
 *     summary: Get patching policy for a given policy
 *     tags: ["Patching policies"]
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
 *                message:
 *                  type: string
 *                policy:
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       company_id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       policy_type_name:
 *                         type: string
 *                       configuration:
 *                         type: object
 *                         properties:
 *                           auto_patch:
 *                             type: string
 *                           auto_reboot:
 *                             type: boolean
 *                           custom_notification_deferment_periods:
 *                             type: array
 *                             items:
 *                              type: number
 *                           custom_notification_max_delays:
 *                             type: number
 *                           custom_notification_patch_message:
 *                             type: string
 *                           custom_notification_patch_message_mac:
 *                             type: string
 *                           custom_notification_reboot_message:
 *                             type: string
 *                           custom_notification_reboot_message_mac:
 *                             type: string
 *                           custom_pending_reboot_notification_deferment_periods:
 *                             type: array
 *                             items:
 *                              type: number
 *                           custom_pending_reboot_notification_max_delays:
 *                             type: number
 *                           custom_pending_reboot_notification_message:
 *                             type: string
 *                           custom_pending_reboot_notification_message_mac:
 *                             type: string
 *                           device_filters:
 *                             type: array
 *                             items:
 *                              type: number
 *                           device_filters_enabled:
 *                             type: boolean
 *                           filter_type:
 *                             type: string
 *                           filters:
 *                             type: array
 *                             items:
 *                              type: string
 *                           include_optional:
 *                             type: boolean
 *                           missed_patch_window:
 *                             type: boolean
 *                           notify_deferred_reboot_user:
 *                             type: boolean
 *                           notify_deferred_reboot_user_message_timeout:
 *                             type: number
 *                           notify_reboot_user:
 *                             type: boolean
 *                           notify_user:
 *                             type: string
 *                           notify_user_message_timeout:
 *                             type: number
 *                           patch_ids:
 *                             type: array
 *                             items:
 *                              type: string
 *                           patch_rule:
 *                             type: string
 *                           severity_filter:
 *                             type: array
 *                             items:
 *                              type: string
 *                           timezone:
 *                             type: string
 *                             format: date-time
 *                           utc_time:
 *                             type: number
 *                             format: date-time
 *                       groupList:
 *                        type: array
 *                        items:
 *                          type: string
 *                       notes:
 *                        type: string
 *                       packageList:
 *                        type: array
 *                        items:
 *                         type: string
 *                       schedule_days:
 *                         type: string
 *                       schedule_months:
 *                         type: string
 *                       schedule_time:
 *                         type: string
 *                       schedule_weeks_of_month:
 *                         type: string
 *                       server_groups:
 *                         type: array
 *                         item:
 *                          type: string
 *                       showFilters:
 *                         type: boolean
 *                       policy_groups:
 *                        type: array
 *                        items:
 *                         type: object
 *                         properties:
 *                           patching_group_id:
 *                           type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: uuid
 *                       updatedAt:
 *                         type: string
 *                         format: uuid
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsRouter.get(
  "/patching/policy/:id",
  [
    userAuth,
    checkPermission(permissionSlug.RESILIENCE_PATCHING_POLICIES, "view"),
  ],
  getPolicyByID
);

/**
 * @swagger
 * /assets/patching/policies:
 *   get:
 *     summary: Get patching policies
 *     tags: ["Patching policies"]
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
 *                policies:
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       company_id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       policy_type_name:
 *                         type: string
 *                       configuration:
 *                         type: object
 *                         properties:
 *                           auto_patch:
 *                             type: string
 *                           auto_reboot:
 *                             type: boolean
 *                           custom_notification_deferment_periods:
 *                             type: array
 *                             items:
 *                              type: number
 *                           custom_notification_max_delays:
 *                             type: number
 *                           custom_notification_patch_message:
 *                             type: string
 *                           custom_notification_patch_message_mac:
 *                             type: string
 *                           custom_notification_reboot_message:
 *                             type: string
 *                           custom_notification_reboot_message_mac:
 *                             type: string
 *                           custom_pending_reboot_notification_deferment_periods:
 *                             type: array
 *                             items:
 *                              type: number
 *                           custom_pending_reboot_notification_max_delays:
 *                             type: number
 *                           custom_pending_reboot_notification_message:
 *                             type: string
 *                           custom_pending_reboot_notification_message_mac:
 *                             type: string
 *                           device_filters:
 *                             type: array
 *                             items:
 *                              type: number
 *                           device_filters_enabled:
 *                             type: boolean
 *                           filter_type:
 *                             type: string
 *                           filters:
 *                             type: array
 *                             items:
 *                              type: string
 *                           include_optional:
 *                             type: boolean
 *                           missed_patch_window:
 *                             type: boolean
 *                           notify_deferred_reboot_user:
 *                             type: boolean
 *                           notify_deferred_reboot_user_message_timeout:
 *                             type: number
 *                           notify_reboot_user:
 *                             type: boolean
 *                           notify_user:
 *                             type: string
 *                           notify_user_message_timeout:
 *                             type: number
 *                           patch_ids:
 *                             type: array
 *                             items:
 *                              type: string
 *                           patch_rule:
 *                             type: string
 *                           severity_filter:
 *                             type: array
 *                             items:
 *                              type: string
 *                           timezone:
 *                             type: string
 *                             format: date-time
 *                           utc_time:
 *                             type: number
 *                             format: date-time
 *                       groupList:
 *                        type: array
 *                        items:
 *                          type: string
 *                       notes:
 *                        type: string
 *                       packageList:
 *                        type: array
 *                        items:
 *                         type: string
 *                       schedule_days:
 *                         type: string
 *                       schedule_months:
 *                         type: string
 *                       schedule_time:
 *                         type: string
 *                       schedule_weeks_of_month:
 *                         type: string
 *                       server_groups:
 *                         type: array
 *                         item:
 *                          type: string
 *                       showFilters:
 *                         type: boolean
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: uuid
 *                       updatedAt:
 *                         type: string
 *                         format: uuid
 *                page:
 *                 type: number
 *                 example: 1
 *                size:
 *                 type: number
 *                 example: 10
 *                totalCount:
 *                 type: number
 *                 example: 1
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsRouter.get(
  "/patching/policies",
  [
    userAuth,
    checkPermission(permissionSlug.RESILIENCE_PATCHING_POLICIES, "view"),
  ],
  getAllPolicies
);

/**
 * @swagger
 * /assets/patching/all/groups:
 *   get:
 *     summary: Get overview detail
 *     tags: ["Patching groups"]
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
 *
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsRouter.get("/patching/all/groups", userAuth, getAllGroups);

/**
 * @swagger
 * /assets/patching/move/group:
 *   post:
 *     summary: Add devices to group
 *     tags: [ "Patching groups" ]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: ""
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                group:
 *                  type: object
 *                  properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     example: []
 *                   name:
 *                     type: string
 *                     example: []
 *                device:
 *                  type: array
 *                  items:
 *                   type: string
 *                   format: uuid
 *                  example: []
 *               required:
 *                - group
 *                - device
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                groupName:
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

assetsRouter.post("/patching/move/group", userAuth, addDeviceToOtherGroup);

/**
 * @swagger
 * /assets/patching/device/targetting/options:
 *   get:
 *     summary: Get patching device targeting
 *     tags: ["Patching groups"]
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
 *                 data:
 *                  type: array
 *                  items:
 *                   type: string
 *                 valid:
 *                  type: boolean
 *                 message:
 *                  type: string
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsRouter.get(
  "/patching/device/targetting/options",
  userAuth,
  getDeviceTargettingOptions
);

/**
 * @swagger
 * /assets/endpoints/overview:
 *   get:
 *     summary: Get endpoints overview detail
 *     tags: ["Assets endpoints"]
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
 *                   totalEndpoints:
 *                     type: number
 *                   totalDetections:
 *                     type: number
 *                   totalSuspiciousActivity:
 *                     type: number
 *                   osFiltersOptions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                           os_name:
 *                             type: string
 *                           os_family:
 *                             type: string
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsRouter.get(
  "/endpoints/overview",
  [userAuth, checkPermission(permissionSlug.RESILIENCE_ENDPOINTS, "view")],
  endpointAssetsOverview
);

/**
 * @swagger
 * /assets/endpoints:
 *   get:
 *     summary: Get list of endpoints
 *     tags: ["Assets endpoints"]
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
 *                 name:
 *                   type: string
 *                 status:
 *                   type: string
 *                 os:
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
 *                      description: ""
 *                    asset_name:
 *                      type: string
 *                      description: ""
 *                    last_seen:
 *                      type: string
 *                      description: ""
 *                    os_family:
 *                      type: string
 *                      description: ""
 *                    os_name:
 *                      type: string
 *                      description: ""
 *                    os_install_version:
 *                      type: string
 *                      description: ""
 *                    remediation_required_status:
 *                      type: boolean
 *                      description: ""
 *                    remediation_required_infection_count:
 *                      type: number
 *                    reboot_required_status:
 *                      type: boolean
 *                    reboot_required_reasons_count:
 *                      type: string
 *                    suspicious_activity_status:
 *                      type: string
 *                      description: ""
 *                    suspicious_activity_count:
 *                      type: string
 *                      description: ""
 *                    isolation_status:
 *                      type: string
 *                    isolation_process_status:
 *                      type: string
 *                    isolation_network_status:
 *                      type: string
 *                    isolation_desktop_status:
 *                      type: string
 *                    scan_needed_status:
 *                      type: string
 *                    scan_needed_job_status:
 *                      type: string
 *                    scan_needed_last_seen_at:
 *                      type: string
 *                    last_seen_at:
 *                      type: string
 *                    last_user:
 *                      type: string
 *                    risk_score:
 *                      type: string
 *                totalCount:
 *                  type: number
 *                  example: 1
 *                totalDetections:
 *                  type: number
 *                totalSuspiciousActivity:
 *                  type: number
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsRouter.get(
  "/endpoints",
  [
    userAuth,
    checkPermission(permissionSlug.RESILIENCE_ENDPOINTS_ALL_ENDPOINTS, "view"),
  ],
  endpointAssetList
);

/**
 * @swagger
 * /assets/endpoint/{id}:
 *   get:
 *     summary: Get endpoint details by asset id
 *     tags: ["Assets endpoints"]
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
 *                   asset_name:
 *                     type: string
 *                   last_user:
 *                     type: string
 *                   os_family:
 *                     type: string
 *                   status:
 *                     type: string
 *                   last_seen:
 *                     type: string
 *                   integration:
 *                     type: string
 *                   scores:
 *                     type: object
 *                     properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         asset_id:
 *                           type: string
 *                           format: uuid
 *                         company_id:
 *                           type: string
 *                           format: uuid
 *                         lifecycle_score:
 *                           type: number
 *                         endpoint_score:
 *                           type: number
 *                         backup_score:
 *                           type: number
 *                         patching_score:
 *                           type: number
 *                         real_time_score:
 *                           type: number
 *                         risk_score:
 *                           type: number
 *                         pure_risk_score:
 *                           type: number
 *                         is_pure_score:
 *                           type: boolean
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                   tags:
 *                     type: array
 *                     items:
 *                      type: object
 *                      properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         label:
 *                           type: string
 *                   detections:
 *                     type: number
 *                   quarantines:
 *                     type: number
 *                   events:
 *                     type: number
 *                   suspicious_activities:
 *                     type: number
 *                   endpoint_protection_status:
 *                     type: string
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsRouter.get(
  "/endpoint/:id",
  [
    userAuth,
    checkPermission(
      permissionSlug.RESILIENCE_ENDPOINTS_ALL_ENDPOINTS_OVERVIEW,
      "view"
    ),
  ],
  getEndpointAsset
);

/**
 * @swagger
 * /assets/endpoint/detections/{id}:
 *   get:
 *     summary: Get list of detections of particular Endpoint
 *     tags: ["Assets endpoints"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                    threat_name:
 *                      type: string
 *                      description: ""
 *                    process_name:
 *                      type: string
 *                      description: ""
 *                    category:
 *                      type: string
 *                      description: ""
 *                    type:
 *                      type: string
 *                      description: ""
 *                    source_location:
 *                      type: string
 *                      description: ""
 *                    status:
 *                      type: string
 *                      description: ""
 *                    destination_location:
 *                      type: string
 *                    reported_at:
 *                      type: string
 *                      format: date-time
 *                    scanned_at:
 *                      type: string
 *                      format: date-time
 *                    path:
 *                      type: string
 *                      description: ""
 *                totalCount:
 *                  type: number
 *                  example: 1
 *
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsRouter.get(
  "/endpoint/detections/:id",
  [
    userAuth,
    checkPermission(
      permissionSlug.RESILIENCE_ENDPOINTS_ALL_ENDPOINTS_DETECTIONS,
      "view"
    ),
  ],
  getDetectionById
);

/**
 * @swagger
 * /assets/endpoint/events/{id}:
 *   get:
 *     summary: Get list of events of particular Endpoint
 *     tags: ["Assets endpoints"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                    timestamp:
 *                      type: string
 *                      format: date-time
 *                      description: ""
 *                    severity:
 *                      type: number
 *                      description: ""
 *                    severity_name:
 *                      type: string
 *                      description: ""
 *                    source_name:
 *                      type: string
 *                      description: ""
 *                    type:
 *                      type: number
 *                      description: ""
 *                    type_name:
 *                      type: string
 *                      description: ""
 *                totalCount:
 *                  type: number
 *                  example: 1
 *
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsRouter.get(
  "/endpoint/events/:id",
  [
    userAuth,
    checkPermission(
      permissionSlug.RESILIENCE_ENDPOINTS_ALL_ENDPOINTS_EVENTS,
      "view"
    ),
  ],
  getEndpointEventById
);

/**
 * @swagger
 * /assets/endpoint/quarantines/{id}:
 *   get:
 *     summary: Get list of quarantines  of particular Endpoint
 *     tags: ["Assets endpoints"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                    threat_name:
 *                      type: string
 *                      description: ""
 *                    category:
 *                      type: string
 *                      description: ""
 *                    type:
 *                      type: string
 *                      description: ""
 *                    path:
 *                      type: string
 *                      description: ""
 *                    scanned_at:
 *                      type: string
 *                      format: date-time
 *                      description: ""
 *                    scanned_at_local:
 *                      type: string
 *                      description: ""
 *                totalCount:
 *                  type: number
 *                  example: 1
 *
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsRouter.get(
  "/endpoint/quarantines/:id",
  [
    userAuth,
    checkPermission(
      permissionSlug.RESILIENCE_ENDPOINTS_ALL_ENDPOINTS_QUARANTINE,
      "view"
    ),
  ],
  getQuarantinesById
);

/**
 * @swagger
 * /assets/endpoint/suspicious/activities/{id}:
 *   get:
 *     summary:  Get list of suspicious  of particular Endpoint
 *     tags: ["Assets endpoints"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                    status:
 *                      type: string
 *                      description: ""
 *                    path:
 *                      type: string
 *                      description: ""
 *                    timestamp:
 *                      type: string
 *                      format: date-time
 *                      description: ""
 *                    id:
 *                      type: string
 *                      format: uuid
 *                      description: ""
 *                totalCount:
 *                  type: number
 *                  example: 1
 *
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsRouter.get(
  "/endpoint/suspicious/activities/:id",
  [
    userAuth,
    checkPermission(
      permissionSlug.RESILIENCE_ENDPOINTS_ALL_ENDPOINTS_SUSPICIOUS_ACTIVITY,
      "view"
    ),
  ],
  getSuspiciousActivityById
);

/**
 * @swagger
 * /assets/tags/{id}:
 *   put:
 *     summary: Add tag in assets
 *     tags: ["Assets endpoints"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *         description: ""
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                tags:
 *                  type: array
 *                  items:
 *                    type: string
 *                  description: you have to write text of tag in array that you want to add
 *               required:
 *                - tag
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
 *
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
assetsRouter.put("/tags/:id", userAuth, updateDeviceTags);

export default assetsRouter;
