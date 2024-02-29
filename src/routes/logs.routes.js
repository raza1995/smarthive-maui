import { Router } from "express";
import { userAuth } from "../middlewares/auth.middleware";
import {
  getAssetAllLogs,
  getEndpointAssetLogs,
  getLogsStatics,
  getPatchingAssetLogs,
  getUserLogs,
  getUserLogsByUserId,
} from "../Mysql/Logs/eventLogs/eventLogs.controller";

const logsRouter = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *        type: http
 *        scheme: bearer
 *   schemas:
 *     log:
 *       type: object
 *     logResponse:
 *         type: object
 *         properties:
 *           logs:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                  type: string
 *                  format: uuid
 *                 client_id:
 *                  type: string
 *                  format: uuid
 *                 process:
 *                  type: string
 *                 effected_table:
 *                  type: string
 *                 target_id:
 *                  type: string
 *                  format: uuid
 *                 error_reason:
 *                  type: string
 *                 client_ip_address:
 *                  type: string
 *                 is_system_log:
 *                  type: string
 *                 createdAt:
 *                  type: string
 *                  format: data-time
 *                 updatedAt:
 *                  type: string
 *                  format: data-time
 *                 activity:
 *                  type: object
 *                  properties:
 *                     label:
 *                      type: string
 *                     code:
 *                      type: string
 *                 activity_status:
 *                  type: object
 *                  properties:
 *                     status:
 *                      type: string
 *                     label:
 *                      type: string
 *                     code:
 *                      type: string
 *                     severity:
 *                      type: string
 *                 Client:
 *                  type: object
 *                  properties:
 *                     full_name:
 *                      type: string
 *                     email:
 *                      type: string  
 *                 user:
 *                  type: object
 *                  properties:
 *                     full_name:
 *                      type: string
 *                     email:
 *                      type: string              
 *                 asset:
 *                  type: string
 *                 logs_event_payload:
 *                  type: string
 *             totalLogs:
 *              type: number
 *              example: 1
 */

/**
 * @swagger
 * /asset/logs/{asset_id}:
 *   get:
 *     summary: Get list of logs for a given asset
 *     tags: ["event logs"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset_id
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
 *                $ref: '#/components/schemas/logResponse'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

logsRouter.get("/asset/logs/:asset_id", userAuth, getAssetAllLogs);

/**
 * @swagger
 * /patching/logs/{asset_id}:
 *   get:
 *     summary: Get list of patching logs of a given asset
 *     tags: ["event logs"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset_id
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
 *                $ref: '#/components/schemas/logResponse'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

logsRouter.get("/patching/logs/:asset_id", userAuth, getPatchingAssetLogs);

/**
 * @swagger
 * /endpoint/logs/{asset_id}:
 *   get:
 *     summary: get list of endpoint logs for a given asset
 *     tags: ["event logs"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset_id
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
 *                $ref: '#/components/schemas/logResponse'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

logsRouter.get("/endpoint/logs/:asset_id", userAuth, getEndpointAssetLogs);

/**
 * @swagger
 * /user/logs/{user_id}:
 *   get:
 *     summary: Get list of logs for given user
 *     tags: ["event logs"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
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
 *                 severity: 
 *                  type: array
 *                  items: 
 *                    type: string
 *                 status: 
 *                  type: array
 *                  items: 
 *                    type: string
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

logsRouter.get("/user/logs/:user_id", userAuth, getUserLogsByUserId);


/**
 * @swagger
 * /user/logs:
 *   get:
 *     summary: Get a list of user logs
 *     tags: ["event logs"]
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
 *                 severity: 
 *                  type: array
 *                  items: 
 *                    type: string
 *                 status: 
 *                  type: array
 *                  items: 
 *                    type: string
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

logsRouter.get("/user/logs", userAuth, getUserLogs);

/**
 * @swagger
 * /logs/statics:
 *   get:
 *     summary: Get Detail information of login user
 *     tags: ["event logs"]
 *     security:
 *      - BearerAuth: []
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

logsRouter.get("/logs/statics", userAuth, getLogsStatics);

export default logsRouter;
