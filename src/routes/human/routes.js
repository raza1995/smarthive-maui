import { Router } from "express";
import { checkPermission } from "../../middlewares/auth.checkPermission";
import { userAuth } from "../../middlewares/auth.middleware";
import { getHumansData, humanActivityLogs, humanApplicationLinked, humanAssetsLinked, humanDetails, updateHuman } from "../../Mysql/Human/human.controller";
import { addHumanAssetRelation, removeHumanAssetRelation } from "../../Mysql/HumanAssets/humanAssets.controller";
import { HUMAN_URL } from "./urlConstant";

const humanRouter = Router()
// Humans APIs to fetch device data


/**
 * @swagger
 * /human/list:
 *   get:
 *     summary: Get list of humans
 *     tags: [Humans]
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
 *                    pishing_score:
 *                      type: number
 *                      description: ""  
 *                    asset_score:
 *                      type: number
 *                    mfa_score:
 *                      type: number
 *                    security_awareness_score:
 *                      type: number
 *                    risk_level:
 *                      type: string
 *                      description: ""          
 *                    department:
 *                      type: string
 *                      description: ""          
 *                totalCount:
 *                  type: number
 *                  example: 1
 *                highRiskUsers:
 *                  type: number
 *                mediumRiskUsers:
 *                  type: number
 *                lowRiskUsers:
 *                  type: number
 *                totalUsers:
 *                  type: number
 *                applicationsCountWithCustomScore:
 *                  type: number
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */


humanRouter.get(
    HUMAN_URL.LIST.URL, 
    [userAuth, checkPermission(HUMAN_URL.LIST.SLUG, HUMAN_URL.LIST.ACTION)], 
    getHumansData
);

/**
 * @swagger
 * /human/update/{id}:
 *   post:
 *     summary: update human risk level and region
 *     tags: [Humans]
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
 *                risk_level:
 *                  type: string      
 *                region:
 *                  type: string
 *               required:
 *                - risk_level
 *                - region
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


humanRouter.post(
    HUMAN_URL.UPDATE.URL, 
    [userAuth, checkPermission(HUMAN_URL.UPDATE.SLUG, HUMAN_URL.UPDATE.ACTION)], 
    updateHuman
);

/**
 * @swagger
 * /human/details/{id}:
 *   get:
 *     summary: Get detail of a human
 *     tags: [Humans]
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


humanRouter.get(
    HUMAN_URL.DETAIL.URL, 
    [userAuth, checkPermission(HUMAN_URL.DETAIL.SLUG, HUMAN_URL.DETAIL.ACTION)], 
    humanDetails
);

/**
 * @swagger
 * /human/assets_linked/{id}:
 *   get:
 *     summary: Get assets linked with human
 *     tags: [Humans]
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
 *                scoreWeightage:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      description: ""          
 *                    created_by_id:
 *                      type: string
 *                      description: ""          
 *                    company_id:
 *                      type: string
 *                      description: "" 
 *                    name:
 *                      type: string
 *                      description: ""         
 *                    linked_assets_weightage:
 *                      type: string
 *                      description: ""          
 *                    linked_humans_weightage:
 *                      type: string
 *                    apply_on_all_application:
 *                      type: string
 *                    application_ids:
 *                      type: array
 *                    priority:
 *                      type: string
 *                    createdAt:
 *                      type: string
 *                      description: ""          
 *                    updatedAt:
 *                      type: string
 *                      description: ""          
 *                    application_impacted:
 *                      type: string
 *                totalCount:
 *                  type: number
 *                  example: 1
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */


humanRouter.get(
    HUMAN_URL.ASSET_LINKED.URL, 
    [userAuth, checkPermission(HUMAN_URL.ASSET_LINKED.SLUG, HUMAN_URL.ASSET_LINKED.ACTION)], 
    humanAssetsLinked
);

/**
 * @swagger
 * /human/add/assets/{id}:
 *   post:
 *     summary: Linked assets with human
 *     tags: [Humans]
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
 *                assetIds:
 *                  type: array
 *                  items:
 *                   type: string
 *                   format: uuid           
 *               required:
 *                - assetIds
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


humanRouter.post(
    HUMAN_URL.ADD_ASSET_LINKED.URL, 
    [userAuth, checkPermission(HUMAN_URL.ADD_ASSET_LINKED.SLUG, HUMAN_URL.ADD_ASSET_LINKED.ACTION)],
    addHumanAssetRelation
);

/**
 * @swagger
 * /human/remove/assets/{id}:
 *   post:
 *     summary: Unlinked asses from humans
 *     tags: [Humans]
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
 *                assetIds:
 *                  type: array
 *                  items:
 *                   type: string
 *                   format: uuid           
 *               required:
 *                - assetIds
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


humanRouter.post(HUMAN_URL.DELETE_ASSET_LINKED.URL, 
    [userAuth, checkPermission(HUMAN_URL.DELETE_ASSET_LINKED.SLUG, HUMAN_URL.DELETE_ASSET_LINKED.ACTION)], 
    removeHumanAssetRelation
);

/**
 * @swagger
 * /human/applications_linked/{id}:
 *   get:
 *     summary: Get list of application linked with humans
 *     tags: [Humans]
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
 *       - in: query
 *         name: filter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
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
 *                    created_by_id:
 *                      type: string
 *                      description: ""          
 *                    company_id:
 *                      type: string
 *                      description: "" 
 *                    name:
 *                      type: string
 *                      example: xyz          
 *                    description:
 *                      type: string           
 *                    is_shared_service:
 *                      type: boolean
 *                    is_using_other_services:
 *                      type: boolean
 *                    risk_score:
 *                      type: number
 *                    linked_human_score:
 *                      type: number
 *                    linked_asset_score:
 *                      type: number
 *                    createdAt:
 *                      type: string
 *                      description: ""          
 *                    updatedAt:
 *                      type: string
 *                      description: ""          
 *                    application_assets:
 *                      type: array
 *                      items:
 *                       type: object
 *                       properties:
 *                            id:
 *                             type: string
 *                             format: uuid         
 *                    application_humans:
 *                      type: array
 *                      items:
 *                       type: object
 *                       properties:
 *                            id:
 *                             type: string
 *                             format: uuid        
 *                    sharedServices:
 *                       type: array
 *                       items:
 *                           type: object
 *                           properties:
 *                                id:
 *                                 type: string
 *                                 format: uuid     
 *                                application:
 *                                 type: object
 *                                 properties:
 *                                  id:
 *                                    type: string
 *                                    description: ""          
      
 *                totalCount:
 *                  type: number
 *                  example: 1
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */


humanRouter.get(
    HUMAN_URL.APPLICATION_LINKED.URL, 
    [userAuth, checkPermission(HUMAN_URL.APPLICATION_LINKED.SLUG, HUMAN_URL.APPLICATION_LINKED.ACTION)],
    humanApplicationLinked
);

/**
 * @swagger
 * /human/activity_logs/{id}:
 *   get:
 *     summary: Get list of humans activity logs
 *     tags: [Humans]
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
 *       - in: query
 *         name: filter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/logResponse'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */


humanRouter.get(
    HUMAN_URL.ACTIVITY_LOGS.URL, 
    [userAuth, checkPermission(HUMAN_URL.UPDATE.SLUG, HUMAN_URL.UPDATE.ACTION)], 
    humanActivityLogs
);
export default humanRouter