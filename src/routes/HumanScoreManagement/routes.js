import { Router } from "express";
import { checkPermission } from "../../middlewares/auth.checkPermission";
import { userAuth } from "../../middlewares/auth.middleware";
import validateRequestPayload from "../../middlewares/validateRequestPayload";
import {
  createHumanScoreWeightage,
  deleteHumanScoreWeightageController,
  getHumanScoreWeightageList,
  updateHumanScoreWeightagePriorityController,
} from "../../Mysql/HumanScoreManagements/HumanScoreWeightage/HumanScoreWeightage.controller";
import { createHumanWeightageApiPayload, updateHumanScoreWeightagePriorityApiPayload } from "../../Mysql/HumanScoreManagements/HumanScoreWeightage/HumanScoreWeightage.dto";

import HUMAN_MANAGEMENT__URL from "./urlConstant";

const HumanScoreManagementsRouter = Router();

/**
 * @swagger
 * /hsm/weightage:
 *   post:
 *     summary: Create and update human score weightage methodology
 *     tags: [Human score management]
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
 *                  example: id required if you want to update a methodology          
 *                name:
 *                  type: string
 *                  example: xyz          
 *                human_risks:
 *                  type: array
 *                  items:
 *                   type: string
 *                  example: []            
 *                apply_on_all_human:
 *                  type: boolean
 *                  example: true             
 *                linked_assets_weightage:
 *                  type: number
 *                  example: 25              
 *                security_awareness_weightage:
 *                  type: number
 *                  example: 25
 *                pishing_weightage:
 *                  type: number
 *                  example: 25
 *                mfa_weightage:
 *                  type: number
 *                  example: 25
 *               required:
 *                - name
 *                - apply_on_all_application
 *                - linked_assets_weightage
 *                - security_awareness_weightage
 *                - pishing_weightage
 *                - mfa_weightage
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

HumanScoreManagementsRouter.post(
  HUMAN_MANAGEMENT__URL.createHumanScoreWeightage.URL,
  [
    userAuth,
    checkPermission(
      HUMAN_MANAGEMENT__URL.createHumanScoreWeightage.SLUG,
      HUMAN_MANAGEMENT__URL.createHumanScoreWeightage.ACTION
    ),
    validateRequestPayload(createHumanWeightageApiPayload),
  ],
  createHumanScoreWeightage
);

/**
 * @swagger
 * /hsm/weightage:
 *   get:
 *     summary: Get list of human score methodologies
 *     tags: [Human score management]
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
 *                    security_awareness_weightage:
 *                      type: string
 *                      description: ""  
 *                    pishing_weightage:
 *                      type: string
 *                      description: ""  
 *                    mfa_weightage:
 *                      type: string
 *                      description: ""  
 *                    apply_on_all_human:
 *                      type: string
 *                    human_risks:
 *                      type: array
 *                    priority:
 *                      type: string
 *                    createdAt:
 *                      type: string
 *                      description: ""          
 *                    updatedAt:
 *                      type: string
 *                      description: ""          
 *                    human_impacted:
 *                      type: string
 *                totalCount:
 *                  type: number
 *                  example: 1
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

HumanScoreManagementsRouter.get(
  HUMAN_MANAGEMENT__URL.getHumanScoreWeightages.URL,
  [
    userAuth,
    checkPermission(
      HUMAN_MANAGEMENT__URL.getHumanScoreWeightages.SLUG,
      HUMAN_MANAGEMENT__URL.getHumanScoreWeightages.ACTION
    ),

  ],
  getHumanScoreWeightageList
);

/**
 * @swagger
 * /hsm/weightage/{id}:
 *   delete:
 *     summary: Delete score methodology with givin id
 *     tags: [Human score management]
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
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
HumanScoreManagementsRouter.delete(
  `${HUMAN_MANAGEMENT__URL.deleteHumanScoreWeightages.URL}/:id`,
  [
    userAuth,
    checkPermission(
      HUMAN_MANAGEMENT__URL.deleteHumanScoreWeightages.SLUG,
      HUMAN_MANAGEMENT__URL.deleteHumanScoreWeightages.ACTION
    ),
  ],
  deleteHumanScoreWeightageController
);

/**
 * @swagger
 * /hsm/weightage/priority:
 *   put:
 *     summary: Update priority of methodologies
 *     tags: [Human score management]
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
 *         description: Success response
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

HumanScoreManagementsRouter.put(
  HUMAN_MANAGEMENT__URL.updateHumanScoreWeightagePriority
    .URL,
  [
    userAuth,
    checkPermission(
      HUMAN_MANAGEMENT__URL.updateHumanScoreWeightagePriority.SLUG,
      HUMAN_MANAGEMENT__URL.updateHumanScoreWeightagePriority.ACTION
    ),
    validateRequestPayload(updateHumanScoreWeightagePriorityApiPayload),
  ],
  updateHumanScoreWeightagePriorityController
);

export default HumanScoreManagementsRouter;
