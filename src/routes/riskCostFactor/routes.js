import { Router } from "express";
import { checkPermission } from "../../middlewares/auth.checkPermission";
import { userAuth } from "../../middlewares/auth.middleware";
import validateRequestPayload from "../../middlewares/validateRequestPayload";
import {
  compareTagsPayloadSchema,
  createRiskCostFactor,
  createRiskCostFactorAttribute,
  EditRiskCostFactorSchema,
  updateRiskCostFactorPriorityPayloadSchema,
} from "../../Mysql/RiskCostFactor/CostFactor.dto";
import {
  addNewRiskCostFactor,
  addNewRiskCostFactorAttribute,
  deleteRiskCostFactor,
  editRiskCostFactor,
  getComparedTagAssets,
  riskCostFactorAttributes,
  riskCostFactorList,
  riskCostFactorSelectedAssetsList,
  updateRiskCostFactorPriority,
} from "../../Mysql/RiskCostFactor/riskCostFactor.controller";
import { RISK_COST_FACTOR_URL } from "./urlConstant";

const riskCostFactorRouter = Router();
// Risk Cost Factor APIs

/**
 * @swagger
 * /risk-cost-factor/compared-tag-assets:
 *   post:
 *     summary: Compare tags
 *     tags: [Risk Cost Factor]
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
riskCostFactorRouter.post(
  RISK_COST_FACTOR_URL.COMPARED_TAG_ASSETS.URL,
  [
    userAuth,
    checkPermission(
      RISK_COST_FACTOR_URL.COMPARED_TAG_ASSETS.SLUG,
      RISK_COST_FACTOR_URL.COMPARED_TAG_ASSETS.ACTION
    ),
    validateRequestPayload(compareTagsPayloadSchema),
  ],
  getComparedTagAssets
);


/**
 * @swagger
 * /risk-cost-factor/create:
 *   post:
 *     summary: Create risk cost factor
 *     tags: [Risk Cost Factor]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: ""
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                base_range_lower_bound:
 *                  type: string
 *                base_range_upper_bound:
 *                  type: string
 *                has_peak_time:
 *                  type: string
 *                peak_range_lower_bound:
 *                  type: string
 *                peak_range_upper_bound:
 *                  type: string
 *                has_peak_all_days:
 *                  type: string
 *                peak_range_from_date:
 *                  type: string
 *                peak_range_to_date:
 *                  type: string
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
 *                has_other_costs:
 *                  type: string
 *                other_costs:
 *                  type: array
 *                  items:
 *                   type: object
 *               required:
 *                - base_range_lower_bound
 *                - base_range_upper_bound
 *                - has_peak_time
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
riskCostFactorRouter.post(
  RISK_COST_FACTOR_URL.CREATE.URL,
  [
    userAuth,
    checkPermission(
      RISK_COST_FACTOR_URL.CREATE.SLUG,
      RISK_COST_FACTOR_URL.CREATE.ACTION
    ),
    validateRequestPayload(createRiskCostFactor),
  ],
  addNewRiskCostFactor
);

/**
 * @swagger
 * /risk-cost-factor/list:
 *   get:
 *     summary: Get list of risk cost factor
 *     tags: [Risk Cost Factor]
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
riskCostFactorRouter.get(
  RISK_COST_FACTOR_URL.LIST.URL,
  [
    userAuth,
    checkPermission(
      RISK_COST_FACTOR_URL.LIST.SLUG,
      RISK_COST_FACTOR_URL.LIST.ACTION
    ),
  ],
  riskCostFactorList
);

/**
 * @swagger
 * /risk-cost-factor/delete/{id}:
 *   delete:
 *     summary: Delete risk cost factor by id
 *     tags: [Risk Cost Factor]
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
riskCostFactorRouter.delete(
  RISK_COST_FACTOR_URL.DELETE.URL,
  [
    userAuth,
    checkPermission(
      RISK_COST_FACTOR_URL.DELETE.SLUG,
      RISK_COST_FACTOR_URL.DELETE.ACTION
    ),
  ],
  deleteRiskCostFactor
);

/**
 * @swagger
 * /risk-cost-factor/edit/{id}:
 *   post:
 *     summary: Edit and update risk cost factor
 *     tags: [Risk Cost Factor]
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
 *                base_range_lower_bound:
 *                  type: string
 *                base_range_upper_bound:
 *                  type: string
 *                has_peak_time:
 *                  type: boolean
 *                peak_range_lower_bound:
 *                  type: string
 *                peak_range_upper_bound:
 *                  type: string
 *                has_peak_all_days:
 *                  type: boolean
 *                peak_range_from_date:
 *                  type: string
 *                peak_range_to_date:
 *                  type: string
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
 *                - base_range_lower_bound
 *                - base_range_upper_bound
 *                - has_peak_time
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
riskCostFactorRouter.post(
  RISK_COST_FACTOR_URL.UPDATE.URL,
  [
    userAuth,
    checkPermission(
      RISK_COST_FACTOR_URL.UPDATE.SLUG,
      RISK_COST_FACTOR_URL.UPDATE.ACTION
    ),
    validateRequestPayload(EditRiskCostFactorSchema),
  ],
  editRiskCostFactor
);

/**
 * @swagger
 * /risk-cost-factor/attributes:
 *   get:
 *     summary: Get list of risk cost factor attributes
 *     tags: [Risk Cost Factor]
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
 *                    attribute_name:
 *                      type: string
 *                      example: xyz
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
riskCostFactorRouter.get(
  RISK_COST_FACTOR_URL.ATTRIBUTES.URL,
  [
    userAuth,
    checkPermission(
      RISK_COST_FACTOR_URL.ATTRIBUTES.SLUG,
      RISK_COST_FACTOR_URL.ATTRIBUTES.ACTION
    ),
  ],
  riskCostFactorAttributes
);

/**
 * @swagger
 * /risk-cost-factor/attribute-create:
 *   post:
 *     summary: Create risk cost factor attribute
 *     tags: [Risk Cost Factor]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: ""
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                attribute_name:
 *                  type: string
 *               required:
 *                - attribute_name
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
riskCostFactorRouter.post(
  RISK_COST_FACTOR_URL.ATTRIBUTE_CREATE.URL,
  [
    userAuth,
    checkPermission(
      RISK_COST_FACTOR_URL.ATTRIBUTE_CREATE.SLUG,
      RISK_COST_FACTOR_URL.ATTRIBUTE_CREATE.ACTION
    ),
    validateRequestPayload(createRiskCostFactorAttribute),
  ],
  addNewRiskCostFactorAttribute
);

/**
 * @swagger
 * /risk-cost-factor/{risk_cost_factor_id}/selected-assets/list:
 *   get:
 *     summary: Get list of risk cost factor assets
 *     tags: [Risk Cost Factor]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: risk_cost_factor_id
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
riskCostFactorRouter.get(
  RISK_COST_FACTOR_URL.ASSET_LIST.URL,
  [
    userAuth,
    checkPermission(
      RISK_COST_FACTOR_URL.ASSET_LIST.SLUG,
      RISK_COST_FACTOR_URL.ASSET_LIST.ACTION
    ),
  ],
  riskCostFactorSelectedAssetsList
);

/**
 * @swagger
 * /risk-cost-factor/priority/update:
 *   post:
 *     summary: Update risk cost factor priority
 *     tags: [Risk Cost Factor]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: ""
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                risk_cost_factors:
 *                  type: array
 *               required:
 *                - risk_cost_factors
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
riskCostFactorRouter.post(
  RISK_COST_FACTOR_URL.PRIORITY_UPDATE.URL,
  [
    userAuth,
    checkPermission(
      RISK_COST_FACTOR_URL.PRIORITY_UPDATE.SLUG,
      RISK_COST_FACTOR_URL.PRIORITY_UPDATE.ACTION
    ),
    validateRequestPayload(updateRiskCostFactorPriorityPayloadSchema),
  ],
  updateRiskCostFactorPriority
);



export default riskCostFactorRouter;
