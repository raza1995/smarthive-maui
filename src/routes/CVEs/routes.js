import { Router } from "express";
import { checkPermission } from "../../middlewares/auth.checkPermission";
import { userAuth } from "../../middlewares/auth.middleware";
import {
  getAssetsAffectedByCVEs,
  getCompanyCVEs,
  getCompanyProducts,
  getCompanySoftwareCVEs,
  getCompanyVendors,
  getCVEs,
  getCVEsOverviewDetails,
} from "../../Mysql/Cves/Cves.controller";
import { permissionSlug } from "../../Mysql/Permissions/permissionSlugs";
import CVES__URL from "./urlConstant";

const CVEsRouter = Router();

/**
 * @swagger
 * /cves/all:
 *   get:
 *     summary:  Get list of cves company has
 *     tags: [Company CVEs]
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
 *                  type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                cves:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      format: uuid
 *                    cve:
 *                      type: string
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

CVEsRouter.get(
  CVES__URL.getAllCVES.URL,
  [userAuth, checkPermission(permissionSlug.RESILIENCE_CVES, "view")],
  getCompanyCVEs
);

/**
 * @swagger
 * /cves/lists:
 *   get:
 *     summary: Get all cves id to use in filter
 *     tags: [Company CVEs]
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
 *                  type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                cves:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      format: uuid
 *                    cve:
 *                      type: string
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

CVEsRouter.get(
  CVES__URL.getCVESList.URL,
  [userAuth, checkPermission(permissionSlug.RESILIENCE_CVES, "view")],
  getCVEs
);

/**
 * @swagger
 * /cves/overview:
 *   get:
 *     summary: Get list of application score methodologies
 *     tags: [Company CVEs]
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
 *                cves:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      format: uuid
 *                    cve:
 *                      type: string
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

CVEsRouter.get(
  CVES__URL.getCVEsOverviewDetails.URL,
  [userAuth, checkPermission(permissionSlug.RESILIENCE_CVES, "view")],
  getCVEsOverviewDetails
);

/**
 * @swagger
 * /cves/vendors:
 *   get:
 *     summary: Get list of vendors from opencve
 *     tags: [Company CVEs]
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
 *                  type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                totalVendors:
 *                  type: string
 *                vendors:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      format: uuid
 *                    name:
 *                      type: string
 *                    created_at:
 *                      type: string
 *                      format: date-time
 *                    updated_at:
 *                      type: string
 *                      format: date-time
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

CVEsRouter.get(
  CVES__URL.getVendorsList.URL,
  [userAuth, checkPermission(permissionSlug.RESILIENCE_CVES, "view")],
  getCompanyVendors
);

/**
 * @swagger
 * /cves/products:
 *   get:
 *     summary: Get list of vendors products from opencve
 *     tags: [Company CVEs]
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
 *                  type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                totalProducts:
 *                  type: string
 *                products:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      format: uuid
 *                    vendor_id:
 *                      type: string
 *                      format: uuid
 *                    name:
 *                      type: string
 *                    created_at:
 *                      type: string
 *                      format: date-time
 *                    updated_at:
 *                      type: string
 *                      format: date-time
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

CVEsRouter.get(
  CVES__URL.getProductsList.URL,
  [userAuth, checkPermission(permissionSlug.RESILIENCE_CVES, "view")],
  getCompanyProducts
);

/**
 * @swagger
 * /cves/assets:
 *   get:
 *     summary: Get all Secret's  user have access
 *     tags: [Company CVEs]
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
 *                 cves:
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
 *                status:
 *                 type: boolean
 *                message:
 *                 type: string
 *                data:
 *                 type: array
 *                 items:
 *                  type: object
 *                  properties:
 *                   id:
 *                    type: string
 *                    format: uuid
 *                   company_id:
 *                    type: string
 *                    format: uuid
 *                   asset_name:
 *                    type: string
 *                   ipaddress:
 *                    type: string
 *                   asset_type:
 *                    type: string
 *                   asset_sub_type:
 *                    type: string
 *                   createdAt:
 *                    type: string
 *                    format: date-time
 *                   updatedAt:
 *                    type: string
 *                    format: date-time
 *                   asset_score:
 *                     type: object
 *                     properties:
 *                      backup_score:
 *                       type: string
 *                      lifecycle_score:
 *                       type: string
 *                      patching_score:
 *                       type: string
 *                      endpoint_score:
 *                       type: string
 *                      risk_score:
 *                       type: object
 *                       properties:
 *                        percent:
 *                         type: number
 *                        value:
 *                         type: number
 *                        riskScore:
 *                         type: string
 *                   asset_detail:
 *                    type: object
 *                    properties:
 *                     custom_name:
 *                      type: string
 *                     custom_location:
 *                       type: string
 *                    asset_software:
 *                     type: array
 *                     items:
 *                      type: object
 *                      properties:
 *                       id:
 *                        type: string
 *                        format: uuid
 *                       asset_id:
 *                        type: string
 *                        format: uuid
 *                       company_id:
 *                        type: string
 *                        format: uuid
 *                       software_id:
 *                        type: string
 *                        format: uuid
 *                       package_id:
 *                        type: string
 *                        format: uuid
 *                       software_number:
 *                        type: number
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                    asset_tags:
 *                      type: array
 *                    group_assets:
 *                      type: array
 *                    asset_endpoint_informations:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                         risk_score:
 *                          type: number
 *                         os_install_version:
 *                          type: string
 *                         os_current_version:
 *                          type: string
 *                    asset_patching_informations:
 *                      type: array
 *                      items:
 *                       type: object
 *                       properties:
 *                        risk_score:
 *                         type: number
 *                        os_version:
 *                         type: string
 *                    tags:
 *                     type: array
 *                totalCount:
 *                 type: number
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
CVEsRouter.get(
  "/assets",
  [userAuth, checkPermission(permissionSlug.RESILIENCE_CVES, "view")],
  getAssetsAffectedByCVEs
);

/**
 * @swagger
 * /cves/software/{software_id}:
 *   get:
 *     summary:  Get list of cves company has
 *     tags: [Company CVEs]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: software_id
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
 *       - in: query
 *         name: filter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 search:
 *                  type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                cves:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      format: uuid
 *                    cve:
 *                      type: string
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

CVEsRouter.get(
  CVES__URL.getSoftwareCVEs.URL,
  [userAuth, checkPermission(permissionSlug.RESILIENCE_CVES, "view")],
  getCompanySoftwareCVEs
);
export default CVEsRouter;
