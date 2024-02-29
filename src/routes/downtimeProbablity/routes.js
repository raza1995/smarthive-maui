import { Router } from "express";
import { checkPermission } from "../../middlewares/auth.checkPermission";
import { userAuth } from "../../middlewares/auth.middleware";
import validateRequestPayload from "../../middlewares/validateRequestPayload";
import { downtimeProbabilityList, editDowntimeProbability } from "../../Mysql/DowntimeProbability/downtimeProbability.controller";
import { editDowntimeProbabilitySchema } from "../../Mysql/DowntimeProbability/downtimeProbability.dto";
import { DOWNTIME_PROBABILITY_URL } from "./urlConstant";

const downtimeProbabilityRouter = Router();

/**
 * @swagger
 * /downtime-probability/list:
 *   get:
 *     summary: Get list of downtime probability
 *     tags: [Downtime Probability]
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
downtimeProbabilityRouter.get(
  DOWNTIME_PROBABILITY_URL.LIST.URL,
  [
    userAuth,
    checkPermission(
      DOWNTIME_PROBABILITY_URL.LIST.SLUG,
      DOWNTIME_PROBABILITY_URL.LIST.ACTION
    ),
  ],
  downtimeProbabilityList
);

/**
 * @swagger
 * /downtime-probability/edit/{id}:
 *   post:
 *     summary: Edit and update downtime probability
 *     tags: [Downtime Probability]
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
 *                modified_downtime_probability_time:
 *                  type: string
 *                modified_downtime_probability_year:
 *                  type: string
 *               required:
 *                - modified_downtime_probability_time
 *                - modified_downtime_probability_year
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
downtimeProbabilityRouter.post(
  DOWNTIME_PROBABILITY_URL.UPDATE.URL,
  [
    userAuth,
    checkPermission(
      DOWNTIME_PROBABILITY_URL.UPDATE.SLUG,
      DOWNTIME_PROBABILITY_URL.UPDATE.ACTION
    ),
    validateRequestPayload(editDowntimeProbabilitySchema),
  ],
  editDowntimeProbability
);


export default downtimeProbabilityRouter;
