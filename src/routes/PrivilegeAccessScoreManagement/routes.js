import { Router } from "express";
import { checkPermission } from "../../middlewares/auth.checkPermission";
import { userAuth } from "../../middlewares/auth.middleware";
import validateRequestPayload from "../../middlewares/validateRequestPayload";
import {
  createPrivilegeAccessScoreWeightage,
  deletePrivilegeAccessScoreWeightageController,
  getPrivilegeAccessScoreWeightageList,
  updatePrivilegeAccessScoreWeightagePriorityController,
} from "../../Mysql/PrivilegeAccessScoreManagements/privilegeAccessScoreWeightage/privilegeAccessScoreWeightage.controller";
import {
  createPrivilegeAccessWeightageApiPayload,
  updatePrivilegeAccessScoreWeightagePriorityApiPayload,
} from "../../Mysql/PrivilegeAccessScoreManagements/privilegeAccessScoreWeightage/privilegeAccessScoreWeightage.dto";
import PRIVILEGE_ACCESS_MANAGEMENT__URL from "./urlConstant";

const PrivilegeAccessScoreManagementsRouter = Router();

/**
 * @swagger
 * /pasm/weightage:
 *   post:
 *     summary: Create and update privilege access score weightage methodology
 *     tags: [Privilege access score management]
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
 *                secrets_tags:
 *                  type: array
 *                  items:
 *                   type: object
 *                secrets_type:
 *                  type: array
 *                  items:
 *                   type: string
 *                  example: []
 *                apply_on_all_secrets:
 *                  type: boolean
 *                  example: true
 *                secrets_strength_weightage:
 *                  type: string
 *                  example: 25
 *                secrets_upto_date_weightage:
 *                  type: string
 *                  example: 25
 *                linked_assets_weightage:
 *                  type: string
 *                  example: 25
 *                linked_humans_weightage:
 *                  type: string
 *                  example: 25
 *               required:
 *                - name
 *                - apply_on_all_application
 *                - secrets_strength_weightage
 *                - secrets_upto_date_weightage
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

PrivilegeAccessScoreManagementsRouter.post(
  PRIVILEGE_ACCESS_MANAGEMENT__URL.createPrivilegeAccessScoreWeightage.URL,
  [
    userAuth,
    validateRequestPayload(createPrivilegeAccessWeightageApiPayload),
    checkPermission(
      PRIVILEGE_ACCESS_MANAGEMENT__URL.createPrivilegeAccessScoreWeightage.SLUG,
      PRIVILEGE_ACCESS_MANAGEMENT__URL.createPrivilegeAccessScoreWeightage
        .ACTION
    ),
  ],
  createPrivilegeAccessScoreWeightage
);

/**
 * @swagger
 * /pasm/weightage:
 *   get:
 *     summary: Get list of privilege access score methodologies
 *     tags: [Privilege access score management]
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
 *                    secrets_strength_weightage:
 *                      type: string
 *                      description: ""
 *                    secrets_upto_date_weightage:
 *                      type: string
 *                      description: ""
 *                    linked_assets_weightage:
 *                      type: string
 *                      description: ""
 *                    linked_humans_weightage:
 *                      type: string
 *                    apply_on_all_secrets:
 *                      type: boolean
 *                    secrets_types:
 *                      type: array
 *                      items:
 *                        type: string
 *                    secrets_tags:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                         id:
 *                          type: string
 *                         label:
 *                          type: string
 *                    priority:
 *                      type: string
 *                    createdAt:
 *                      type: string
 *                      description: ""
 *                    updatedAt:
 *                      type: string
 *                      description: ""
 *                    secrets_impacted:
 *                      type: string
 *                totalCount:
 *                  type: number
 *                  example: 1
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

PrivilegeAccessScoreManagementsRouter.get(
  PRIVILEGE_ACCESS_MANAGEMENT__URL.getPrivilegeAccessScoreWeightages.URL,
  [
    userAuth,
    checkPermission(
      PRIVILEGE_ACCESS_MANAGEMENT__URL.getPrivilegeAccessScoreWeightages.SLUG,
      PRIVILEGE_ACCESS_MANAGEMENT__URL.getPrivilegeAccessScoreWeightages.ACTION
    ),
  ],
  getPrivilegeAccessScoreWeightageList
);

/**
 * @swagger
 * /pasm/weightage/{id}:
 *   delete:
 *     summary:  Delete score methodology with givin id
 *     tags: [Privilege access score management]
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

PrivilegeAccessScoreManagementsRouter.delete(
  `${PRIVILEGE_ACCESS_MANAGEMENT__URL.deletePrivilegeAccessScoreWeightages.URL}/:id`,
  [
    userAuth,
    checkPermission(
      PRIVILEGE_ACCESS_MANAGEMENT__URL.deletePrivilegeAccessScoreWeightages
        .SLUG,
      PRIVILEGE_ACCESS_MANAGEMENT__URL.deletePrivilegeAccessScoreWeightages
        .ACTION
    ),
  ],
  deletePrivilegeAccessScoreWeightageController
);

/**
 * @swagger
 * /pasm/weightage/priority:
 *   put:
 *     summary: Update priority of methodologies
 *     tags: [Privilege access score management]
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

PrivilegeAccessScoreManagementsRouter.put(
  PRIVILEGE_ACCESS_MANAGEMENT__URL.updatePrivilegeAccessScoreWeightagePriority
    .URL,
  [
    userAuth,
    checkPermission(
      PRIVILEGE_ACCESS_MANAGEMENT__URL
        .updatePrivilegeAccessScoreWeightagePriority.SLUG,
      PRIVILEGE_ACCESS_MANAGEMENT__URL
        .updatePrivilegeAccessScoreWeightagePriority.ACTION
    ),
    validateRequestPayload(
      updatePrivilegeAccessScoreWeightagePriorityApiPayload
    ),
    //  checkPermission(PRIVILEGE_ACCESS_MANAGEMENT__URL.CREATE.SLUG, PRIVILEGE_ACCESS_MANAGEMENT__URL.CREATE.ACTION)
  ],
  updatePrivilegeAccessScoreWeightagePriorityController
);

export default PrivilegeAccessScoreManagementsRouter;
