import { Router } from "express";
import { checkPermission } from "../../middlewares/auth.checkPermission";
import { userAuth } from "../../middlewares/auth.middleware";
import validateRequestPayload from "../../middlewares/validateRequestPayload";
import {
  createApplicationScoreWeightage,
  deleteApplicationScoreWeightageController,
  getApplicationScoreWeightageList,
  updateApplicationScoreWeightagePriorityController,
} from "../../Mysql/ApplicationScoreManagements/ApplicationScoreWeightage/ApplicationScoreWeightage.controller";
import {
  createApplicationWeightageApiPayload,
  updateApplicationScoreWeightagePriorityApiPayload,
} from "../../Mysql/ApplicationScoreManagements/ApplicationScoreWeightage/ApplicationScoreWeightage.dto";
import APPLICATION_MANAGEMENT__URL from "./urlConstant";

const ApplicationScoreManagementsRouter = Router();

/**
 * @swagger
 * /app-sm/weightage:
 *   post:
 *     summary: Create and update application score weightage methodology
 *     tags: [Application score management]
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
 *                  description: id required if you want to update a methodology          
 *                name:
 *                  type: string
 *                  example: xyz          
 *                application_ids:
 *                  type: array
 *                  items:
 *                   type: string
 *                  example: []            
 *                apply_on_all_application:
 *                  type: boolean
 *                  example: true             
 *                linked_assets_weightage:
 *                  type: number
 *                  example: 50              
 *                linked_humans_weightage:
 *                  type: number
 *                  example: 50
 *               required:
 *                - name
 *                - apply_on_all_application
 *                - linked_assets_weightage
 *                - linked_humans_weightage
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

ApplicationScoreManagementsRouter.post(
  APPLICATION_MANAGEMENT__URL.createApplicationScoreWeightage.URL,
  [
    userAuth,
    checkPermission(
      APPLICATION_MANAGEMENT__URL.createApplicationScoreWeightage.SLUG,
      APPLICATION_MANAGEMENT__URL.createApplicationScoreWeightage.ACTION
    ),
    validateRequestPayload(createApplicationWeightageApiPayload),
  ],
  createApplicationScoreWeightage
);

/**
 * @swagger
 * /app-sm/weightage:
 *   get:
 *     summary: Get list of application score methodologies
 *     tags: [Application score management]
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

ApplicationScoreManagementsRouter.get(
  APPLICATION_MANAGEMENT__URL.getApplicationScoreWeightages.URL,
  [
    userAuth,
    checkPermission(
      APPLICATION_MANAGEMENT__URL.getApplicationScoreWeightages.SLUG,
      APPLICATION_MANAGEMENT__URL.getApplicationScoreWeightages.ACTION
    ),
  ],
  getApplicationScoreWeightageList
);

/**
 * @swagger
 * /app-sm/weightage/{id}:
 *   delete:
 *     summary: Delete score methodology with givin id
 *     tags: [Application score management]
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

ApplicationScoreManagementsRouter.delete(
  `${APPLICATION_MANAGEMENT__URL.deleteApplicationScoreWeightages.URL}/:id`,
  [
    userAuth,
    checkPermission(
      APPLICATION_MANAGEMENT__URL.deleteApplicationScoreWeightages.SLUG,
      APPLICATION_MANAGEMENT__URL.deleteApplicationScoreWeightages.ACTION
    ),
  ],
  deleteApplicationScoreWeightageController
);

/**
 * @swagger
 * /app-sm/weightage/priority:
 *   put:
 *     summary: Update priority of methodologies
 *     tags: [Application score management]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: ""
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                weightages:        
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties: 
 *                    id:
 *                      type: string
 *                      description: ""          
 *                    priority:
 *                      type: string
 *                      description: ""             
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

ApplicationScoreManagementsRouter.put(
  APPLICATION_MANAGEMENT__URL.updateApplicationScoreWeightagePriority.URL,
  [
    userAuth,
    checkPermission(
      APPLICATION_MANAGEMENT__URL.updateApplicationScoreWeightagePriority.SLUG,
      APPLICATION_MANAGEMENT__URL.updateApplicationScoreWeightagePriority.ACTION
    ),
    validateRequestPayload(updateApplicationScoreWeightagePriorityApiPayload),
  ],
  updateApplicationScoreWeightagePriorityController
);

export default ApplicationScoreManagementsRouter;
