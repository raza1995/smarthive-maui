import { Router } from "express";
import { checkPermission } from "../middlewares/auth.checkPermission";
import { userAuth } from "../middlewares/auth.middleware";
import validateRequestPayload from "../middlewares/validateRequestPayload";
import { permissionSlug } from "../Mysql/Permissions/permissionSlugs";
import secretController from "../Mysql/secrets/secret.controller";
import { createSecretApiPayload, shareSecretApiPayload } from "../Mysql/secrets/secret.dto";
import {
  deleteSecretUsers,
  getSecretAssets,
  getSecretAvailableUsers,
  getSecretUsers,
  shareSecrets,
  updateSecretUser,
} from "../Mysql/UserSecrets/UserSecrets.controller";

const secretsRouter = Router();
// Routes for Vault

/**
 * @swagger
 * /secrets/store:
 *   post:
 *     summary: Store and update secrets
 *     tags: [secrets]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: Optional description in *Markdown*
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                secrets:
 *                  type: Object
 *                  example: { key: xyz@abc.com}
 *                secrets_type:
 *                  type: string
 *                  enum: [server,Database,Router,Firewall]
 *                  example: database
 *                name:
 *                  type: string
 *                  example: credential
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/user'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

secretsRouter.post(
  "/store", 
  // userAuth, 
  [
    userAuth, 
    checkPermission(permissionSlug.PRIVILAGE_ACCESS_SECRET, "add"),
    validateRequestPayload(createSecretApiPayload),
  ],
  secretController.create
);

/**
 * @swagger
 * /secrets/all:
 *   get:
 *     summary: Get list of login user secrets
 *     tags: [secrets]
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
 *                 name:
 *                   type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                secrets:
 *                 type: array
 *                 items:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: string
 *                      format: uuid
 *                    name:
 *                      type: string
 *                    user_with_access_count:
 *                      type: number
 *                    created_by_id:
 *                      type: string
 *                      format: uuid
 *                    asset_id:
 *                      type: string
 *                      format: uuid
 *                    secrets_score:
 *                      type: number
 *                    secrets_strength_score:
 *                      type: number
 *                    secrets_upto_date_score:
 *                      type: number
 *                    linked_human_score:
 *                      type: string
 *                    linked_asset_score:
 *                      type: string
 *                    secrets_type:
 *                      type: string
 *                    updatedAt:
 *                      type: string
 *                      format: date-time
 *                    access_role:
 *                      type: string
 *                    createdAt:
 *                      type: string
 *                      format: date-time
 *                    deleted:
 *                      type: boolean
 *                    tags:
 *                      type: array
 *                      items:
 *                       type: object
 *                       properties:
 *                         id:
 *                          type: string
 *                          format: uuid
 *                         label:
 *                          type: string
 *                totalCount:
 *                  type: number
 *                  example: 1
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

// secretsRouter.get("/all", userAuth, secretController.getAll);
secretsRouter.get(
  "/all", 
  // userAuth, 
  [userAuth, checkPermission(permissionSlug.PRIVILAGE_ACCESS_SECRET, "view")],
  secretController.getAll
);

/**
 * @swagger
 * /secrets/of-asset/{asset_id}:
 *   get:
 *     summary: Get list of login user secrets
 *     tags: [secrets]
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
 *       - in: query
 *         name: filter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                secrets:
 *                 type: array
 *                 items:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: string
 *                      format: uuid
 *                    name:
 *                      type: string
 *                    user_with_access_count:
 *                      type: number
 *                    created_by_id:
 *                      type: string
 *                      format: uuid
 *                    asset_id:
 *                      type: string
 *                      format: uuid
 *                    secrets_score:
 *                      type: number
 *                totalCount:
 *                  type: number
 *                  example: 1
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

secretsRouter.get(
  "/of-asset/:asset_id",
  userAuth,
  secretController.getSecretsOfAsset
);

/**
 * @swagger
 * /secrets/statics:
 *   get:
 *     summary: Get all user Secrets statics
 *     tags: [secrets]
 *     security:
 *      - BearerAuth: []
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                type: object
 *                properties:
 *                  type:
 *                   type: string
 *                  count:
 *                   type: number
 *             totalCount:
 *               type: number
 *               example: 1
 *             secretsCountWithCustomScore:
 *               type: number
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

secretsRouter.get("/statics", userAuth, secretController.getSecretsStatics);

/**
 * @swagger
 * /secrets/details/{id}:
 *   get:
 *     summary: Get details of a secrets
 *     tags: [secrets]
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
 *                id:
 *                 type: string
 *                 format: uuid
 *                secrets_type:
 *                 type: string
 *                secrets_score:
 *                 type: number
 *                secrets_strength_score:
 *                 type: number
 *                secrets_upto_date_score:
 *                 type: number
 *                linked_human_score:
 *                 type: string
 *                linked_asset_score:
 *                 type: string
 *                name:
 *                 type: string
 *                users:
 *                 type: string
 *                location:
 *                 type: string
 *                asset_id:
 *                 type: string
 *                secretsLastUpdatedAt:
 *                 type: string
 *                deleted:
 *                 type: boolean
 *                created_by_id:
 *                 type: string
 *                 format: uuid
 *                createdAt:
 *                 type: string
 *                 format: date-time
 *                updatedAt:
 *                 type: string
 *                 format: date-time
 *                company_id:
 *                 type: string
 *                 format: uuid
 *                user_secrets:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                    id:
 *                     type: string
 *                     format: uuid
 *                    access_role:
 *                     type: string
 *                    user_id:
 *                     type: string
 *                    secret_id:
 *                     type: string
 *                    createdAt:
 *                     type: string
 *                     format: date-time
 *                    updatedAt:
 *                     type: string
 *                     format: date-time
 *                secrets:
 *                 type: string
 *                tags:
 *                 type: array
 *                 items:
 *                  type: object
 *                  properties:
 *                    id:
 *                     type: string
 *                     format: uuid
 *                    label:
 *                     type: string
 *
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

secretsRouter.get(
  "/details/:id", 
  // userAuth, 
  [userAuth, checkPermission(permissionSlug.PRIVILAGE_ACCESS_SECRET, "view")],
  secretController.getSecretDetail
);

/**
 * @swagger
 * /secrets/users-available/{secret_id}:
 *   get:
 *     summary: Get available user to share secrets
 *     tags: [secrets]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: secret_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *              users:
 *                type: array
 *                items:
 *                 type: object
 *                 properties:
 *                   id:
 *                    type: string
 *                    format: uuid
 *                   full_name:
 *                    type: string
 *                   access_role:
 *                    type: string
 *                   email:
 *                    type: string
 *                    example: email
 *              totalCount:
 *               type: number
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
secretsRouter.get(
  "/users-available/:secret_id",
  // userAuth,
  [userAuth, checkPermission(permissionSlug.PRIVILAGE_ACCESS_SECRET, "share")],
  getSecretAvailableUsers
);

/**
 * @swagger
 * /secrets/users/{secret_id}:
 *   get:
 *     summary: Get all Secret's  user have access
 *     tags: [secrets]
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
 *       - in: path
 *         name: secret_id
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
 *                users:
 *                 type: array
 *                 items:
 *                  type: object
 *                  properties:
 *                   id:
 *                    type: string
 *                    format: uuid
 *                   access_role:
 *                    type: string
 *                   createdAt:
 *                    type: string
 *                    format: date-time
 *                   user:
 *                    type: object
 *                    properties:
 *                     id:
 *                      type: string
 *                      format: uuid
 *                     full_name:
 *                      type: string
 *                     email:
 *                      type: string
 *                     human:
 *                      type: string
 *                totalCount:
 *                 type: number
 *                 example: 1
 *
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
secretsRouter.get(
  "/users/:secret_id", 
  // userAuth, 
  [userAuth, checkPermission(permissionSlug.PRIVILAGE_ACCESS_SECRET, "view")],
  getSecretUsers
);

/**
 * @swagger
 * /secrets/assets/{secret_id}:
 *   get:
 *     summary: Get all Secret's  user have access
 *     tags: [secrets]
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
 *       - in: path
 *         name: secret_id
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
secretsRouter.get(
  "/assets/:secret_id", 
  // userAuth, 
  [userAuth, checkPermission(permissionSlug.PRIVILAGE_ACCESS_SECRET, "view")],
  getSecretAssets
);

/**
 * @swagger
 * /secrets/share:
 *   post:
 *     summary: Get all user Secrets
 *     tags: [secrets]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: ""
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 secretId:
 *                   type: string
 *                   format: uuid
 *                 users:
 *                   type: array
 *                   items:
 *                    type: object
 *                    properties:
 *                     id:
 *                      type: string
 *                      format: uuid
 *                     access_role:
 *                      type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/user'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
secretsRouter.post(
  "/share", 
  // userAuth, 
  [
    userAuth, 
    checkPermission(permissionSlug.PRIVILAGE_ACCESS_SECRET, "share"),
    validateRequestPayload(shareSecretApiPayload),
  ],
  shareSecrets
);


secretsRouter.post("/remove", secretController.revoke);


/**
 * @swagger
 * /secrets/logs/{secrets_id}:
 *   get:
 *     summary: Get all Secret's  user have access
 *     tags: [secrets]
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
 *       - in: path
 *         name: secret_id
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
 *                $ref: '#/components/schemas/logResponse'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
secretsRouter.get(
  "/logs/:secret_id",
  // userAuth,
  [userAuth, checkPermission(permissionSlug.PRIVILAGE_ACCESS_SECRET, "view")],
  secretController.getSecretsLogs
);

/**
 * @swagger
 * /secrets/logs:
 *   post:
 *     summary: Get all Secret's  user have access
 *     tags: [secrets]
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
 *                 secretId:
 *                   type: string
 *                   format: uuid
 *                 action:
 *                   type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                  type: string
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
secretsRouter.post("/log", userAuth, secretController.createSecretsLogs);

/**
 * @swagger
 * /secrets/{secret_id}:
 *   delete:
 *     summary: Delete a Secret
 *     tags: [secrets]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: secret_id
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
 *                 type: string
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
secretsRouter.delete("/:secret_id", userAuth, secretController.remove);
/**
 * @swagger
 * /secrets/{secret_id}:
 *   put:
 *     summary: This api will revoke  secrets
 *     tags: [secrets]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: secret_id
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
 *               items:
 *                 $ref: '#/components/schemas/user'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
secretsRouter.put("/:secret_id", userAuth, secretController.revoke);

/**
 * @swagger
 * /secrets/user/{secret_id}:
 *   delete:
 *     summary: This api will delete  secrets user
 *     tags: [secrets]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: secret_id
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
 *               items:
 *                 $ref: '#/components/schemas/user'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
secretsRouter.post("/user/:secret_id", userAuth, deleteSecretUsers);

/**
 * @swagger
 * /secrets/user/{secret_id}:
 *   put:
 *     summary: This api is to change secrets user access by secrets admin
 *     tags: [secrets]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: secret_id
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
 *               items:
 *                 $ref: '#/components/schemas/user'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
secretsRouter.put("/user/:secret_id", userAuth, updateSecretUser);
export default secretsRouter;
