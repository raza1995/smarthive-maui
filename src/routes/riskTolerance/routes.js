import { Router } from "express";
import { checkPermission } from "../../middlewares/auth.checkPermission";
import { userAuth } from "../../middlewares/auth.middleware";
import validateRequestPayload from "../../middlewares/validateRequestPayload";
import { addNewRiskTolerance, deleteRiskTolerance, editRiskTolerance, getAssetSubTypes, getAssetTags, getAssetTypes, getComparedTagAssets, riskToleranceList, updateRiskTolerancePriority } from "../../Mysql/RiskTolerance/riskTolerance.controller";
import { compareTagsPayloadSchema, createRiskTolerancePayloadSchema, editRiskTolerancePayloadSchema, updateRiskTolerancePriorityPayloadSchema } from "../../Mysql/RiskTolerance/riskTolerance.dto";
import { RISK_TOLERANCE_URL } from "./urlConstant";

const riskTolerance = Router();
// Risk Tolerance APIs

/**
 * @swagger
 * /risk-tolerance/asset-types:
 *   get:
 *     summary: Asset types with count
 *     tags: [Risk Tolerance]
 *     security:
 *      - BearerAuth: []
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/sendInvite'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
riskTolerance.get(
  RISK_TOLERANCE_URL.ASSET_TYPES.URL,
  [
    userAuth,
    checkPermission(
      RISK_TOLERANCE_URL.ASSET_TYPES.SLUG,
      RISK_TOLERANCE_URL.ASSET_TYPES.ACTION
    ),
  ],
  getAssetTypes
);

/**
 * @swagger
 * /risk-tolerance/asset-sub-types/{asset_type}:
 *   get:
 *     summary: Asset sub types with count
 *     tags: [Risk Tolerance]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset_type
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/sendInvite'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
riskTolerance.get(
  RISK_TOLERANCE_URL.ASSET_SUB_TYPES.URL,
  [
    userAuth,
    checkPermission(
      RISK_TOLERANCE_URL.ASSET_SUB_TYPES.SLUG,
      RISK_TOLERANCE_URL.ASSET_SUB_TYPES.ACTION
    ),
  ],
  getAssetSubTypes
);

/**
 * @swagger
 * /risk-tolerance/asset-tags/{asset_type}:
 *   get:
 *     summary: Asset tags with count
 *     tags: [Risk Tolerance]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset_type
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/sendInvite'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
riskTolerance.get(
  RISK_TOLERANCE_URL.ASSET_TAGS.URL,
  [
    userAuth,
    checkPermission(
      RISK_TOLERANCE_URL.ASSET_TAGS.SLUG,
      RISK_TOLERANCE_URL.ASSET_TAGS.ACTION
    ),
  ],
  getAssetTags
);

/**
 * @swagger
 * /risk-tolerance/compared-tag-assets:
 *   post:
 *     summary: Compare tags
 *     tags: [Risk Tolerance]
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
 *     requestBody:
 *         description: Optional description in *Markdown*
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                data:
 *                  type: Object
 *                  example: { tag_ids: ["b956cd9e-1aca-4195-99c2-9ecaf32dc774","851eda33-edc3-4d5e-8fce-16307a2484e6"] }
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/sendInvite'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
riskTolerance.post(
  RISK_TOLERANCE_URL.COMPARED_TAG_ASSETS.URL,
  [
    userAuth,
    checkPermission(
      RISK_TOLERANCE_URL.COMPARED_TAG_ASSETS.SLUG,
      RISK_TOLERANCE_URL.COMPARED_TAG_ASSETS.ACTION
    ),
    validateRequestPayload(compareTagsPayloadSchema),
  ],
  getComparedTagAssets
);


/**
 * @swagger
 * /risk-tolerance/create:
 *   post:
 *     summary: Create risk tolerance
 *     tags: [Risk Tolerance]
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
 *                asset_type:
 *                  type: string
 *                  example: non-network
 *                asset_ids:
 *                  type: array
 *                  items:
 *                   type: string
 *                   format: uuid
 *                tag_ids:
 *                  type: array
 *                  items:
 *                   type: string
 *                   format: uuid
 *               required:
 *                - name
 *                - asset_type
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
riskTolerance.post(
  RISK_TOLERANCE_URL.CREATE.URL,
  [
    userAuth,
    checkPermission(
      RISK_TOLERANCE_URL.CREATE.SLUG,
      RISK_TOLERANCE_URL.CREATE.ACTION
    ),
    validateRequestPayload(createRiskTolerancePayloadSchema),
  ],
  addNewRiskTolerance
);

/**
 * @swagger
 * /risk-tolerance/list:
 *   get:
 *     summary: Get list of risk tolerance
 *     tags: [Risk Tolerance]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: size
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *            type: integer
 *            example: 1
 *       - in: query
 *         name: filter
 *         required: false
 *         schema:
 *            type: true
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
 *                    company_id:
 *                      type: string
 *                      description: ""
 *                    base_range_lower_bound:
 *                      type: string
 *                    base_range_upper_bound:
 *                      type: string
 *                    has_peak_time:
 *                      type: string
 *                    peak_range_lower_bound:
 *                      type: string
 *                    peak_range_upper_bound:
 *                      type: string
 *                    has_peak_all_days:
 *                      type: string
 *                    peak_range_from_date:
 *                      type: string
 *                    peak_range_to_date:
 *                      type: string
 *                    createdAt:
 *                      type: string
 *                      description: ""
 *                    updatedAt:
 *                      type: string
 *                      description: ""
 *                totalCount:
 *                  type: number
 *                  example: 1
 *                applicationCountWithCustomScore:
 *                  type: number
 *                  example: 1
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
riskTolerance.get(
  RISK_TOLERANCE_URL.LIST.URL,
  [
    userAuth,
    checkPermission(
      RISK_TOLERANCE_URL.LIST.SLUG,
      RISK_TOLERANCE_URL.LIST.ACTION
    ),
  ],
  riskToleranceList
);

/**
 * @swagger
 * /risk-tolerance/delete/{id}:
 *   delete:
 *     summary: Delete risk tolerance by id
 *     tags: [Risk Tolerance]
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
riskTolerance.delete(
  RISK_TOLERANCE_URL.DELETE.URL,
  [
    userAuth,
    checkPermission(
      RISK_TOLERANCE_URL.DELETE.SLUG,
      RISK_TOLERANCE_URL.DELETE.ACTION
    ),
  ],
  deleteRiskTolerance
);

/**
 * @swagger
 * /risk-tolerance/edit/{id}:
 *   post:
 *     summary: Edit and update risk tolerance
 *     tags: [Risk Tolerance]
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
 *                name:
 *                  type: string
 *                asset_type:
 *                  type: string
 *                  example: non-network
 *                asset_ids:
 *                  type: array
 *                  items:
 *                   type: string
 *                   format: uuid
 *                tag_ids:
 *                  type: array
 *                  items:
 *                   type: string
 *                   format: uuid
 *               required:
 *                - name
 *                - asset_type
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
riskTolerance.post(
  RISK_TOLERANCE_URL.UPDATE.URL,
  [
    userAuth,
    checkPermission(
      RISK_TOLERANCE_URL.UPDATE.SLUG,
      RISK_TOLERANCE_URL.UPDATE.ACTION
    ),
    validateRequestPayload(editRiskTolerancePayloadSchema),
  ],
  editRiskTolerance
);

/**
 * @swagger
 * /risk-tolerance/priority/update:
 *   post:
 *     summary: Update risk tolerance priority
 *     tags: [Risk Tolerance]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: ""
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                tolerances:
 *                  type: array
 *               required:
 *                - tolerances
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
riskTolerance.post(
  RISK_TOLERANCE_URL.PRIORITY_UPDATE.URL,
  [
    userAuth,
    checkPermission(
      RISK_TOLERANCE_URL.PRIORITY_UPDATE.SLUG,
      RISK_TOLERANCE_URL.PRIORITY_UPDATE.ACTION
    ),
    validateRequestPayload(updateRiskTolerancePriorityPayloadSchema),
  ],
  updateRiskTolerancePriority
);



export default riskTolerance;
