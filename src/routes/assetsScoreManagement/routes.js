import { Router } from "express";
import { checkPermission } from "../../middlewares/auth.checkPermission";
import { userAuth } from "../../middlewares/auth.middleware";
import validateRequestPayload from "../../middlewares/validateRequestPayload";
import {
  createAssetsScoreWeightage,
  deleteAssetsScoreWeightageController,
  getAssetFilterList,
  getAssetScoreWeightageList,
  updateAssetsScoreWeightagePriorityController,
} from "../../Mysql/AssetsScoreManagements/assetsScoreWeightage/assetsScoreWeightage.controller";
import {
  createAssetsScoreWeightageApiPayload,
  updateAssetsScoreWeightagePriorityApiPayload,
} from "../../Mysql/AssetsScoreManagements/assetsScoreWeightage/assetsScoreWeightage.dto";
import ASSET_MANAGEMENT__URL from "./urlConstant";

const assetsScoreManagementsRouter = Router();
assetsScoreManagementsRouter.get(
  ASSET_MANAGEMENT__URL.getFilterAssetsList.URL,
  [
    userAuth,
    checkPermission(
      ASSET_MANAGEMENT__URL.getFilterAssetsList.SLUG,
      ASSET_MANAGEMENT__URL.getFilterAssetsList.ACTION
    ),
  ],
  getAssetFilterList
);

/**
 * @swagger
 * /asm/weightage:
 *   post:
 *     summary: Create and update assets score weightage methodology
 *     tags: [Assets score management]
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
 *                filter:
 *                  type: object
 *                  example: {}
 *                lifecycle_weightage:
 *                  type: number
 *                  example: 25
 *                patching_weightage:
 *                  type: number
 *                  example: 25
 *                endpoint_weightage:
 *                  type: number
 *                  example: 25
 *                backup_weightage:
 *                  type: number
 *                  example: 25
 *                realtime_weightage:
 *                  type: number
 *                  example: 25
 *               required:
 *                - name
 *                - apply_on_all_application
 *                - lifecycle_weightage
 *                - patching_weightage
 *                - endpoint_weightage
 *                - backup_weightage
 *                - realtime_weightage
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

assetsScoreManagementsRouter.post(
  ASSET_MANAGEMENT__URL.createAssetsScoreWeightage.URL,
  [
    userAuth,
    checkPermission(
      ASSET_MANAGEMENT__URL.createAssetsScoreWeightage.SLUG,
      ASSET_MANAGEMENT__URL.createAssetsScoreWeightage.ACTION
    ),
    validateRequestPayload(createAssetsScoreWeightageApiPayload),
  ],
  createAssetsScoreWeightage
);

/**
 * @swagger
 * /asm/weightage:
 *   get:
 *     description: Get list of assets score methodologies
 *     tags: [Assets score management]
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
 *                    filter:
 *                      type: object
 *                      properties:
 *                         tags:
 *                          type: array
 *                          items:
 *                            type: object
 *                            properties:
 *                             id:
 *                              type: string
 *                             label:
 *                              type: string
 *                         locations:
 *                          type: array
 *                          items:
 *                            type: string
 *                         assets_sub_types:
 *                          type: array
 *                          items: 
 *                            type: string
 *                    lifecycle_weightage:
 *                      type: string
 *                      description: ""
 *                    patching_weightage:
 *                      type: string
 *                      description: ""
 *                    endpoint_weightage:
 *                      type: string
 *                      description: ""
 *                    backup_weightage:
 *                      type: string
 *                      description: ""
 *                    realtime_weightage:
 *                      type: string
 *                      description: ""
 *                    priority:
 *                      type: string
 *                    createdAt:
 *                      type: string
 *                      description: ""
 *                    updatedAt:
 *                      type: string
 *                      description: ""
 *                    assets_impacted:
 *                      type: string
 *                totalCount:
 *                  type: number
 *                  example: 1
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

assetsScoreManagementsRouter.get(
  ASSET_MANAGEMENT__URL.getAssetsScoreWeightages.URL,
  [
    userAuth,
    checkPermission(
      ASSET_MANAGEMENT__URL.getAssetsScoreWeightages.SLUG,
      ASSET_MANAGEMENT__URL.getAssetsScoreWeightages.ACTION
    ),
  ],
  getAssetScoreWeightageList
);

/**
 * @swagger
 * /asm/weightage/{id}:
 *   delete:
 *     summary: Delete score methodology with givin id
 *     tags: [Assets score management]
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
assetsScoreManagementsRouter.delete(
  `${ASSET_MANAGEMENT__URL.deleteAssetsScoreWeightages.URL}/:id`,
  [
    userAuth,
    checkPermission(
      ASSET_MANAGEMENT__URL.deleteAssetsScoreWeightages.SLUG,
      ASSET_MANAGEMENT__URL.deleteAssetsScoreWeightages.ACTION
    ),
  ],
  deleteAssetsScoreWeightageController
);

/**
 * @swagger
 * /asm/weightage/priority:
 *   put:
 *     summary: Update priority of methodologies
 *     tags: [Assets score management]
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

assetsScoreManagementsRouter.put(
  ASSET_MANAGEMENT__URL.updateAssetsScoreWeightagePriority.URL,
  [
    userAuth,
    checkPermission(
      ASSET_MANAGEMENT__URL.updateAssetsScoreWeightagePriority.SLUG,
      ASSET_MANAGEMENT__URL.updateAssetsScoreWeightagePriority.ACTION
    ),
    validateRequestPayload(updateAssetsScoreWeightagePriorityApiPayload),
  ],
  updateAssetsScoreWeightagePriorityController
);

export default assetsScoreManagementsRouter;
