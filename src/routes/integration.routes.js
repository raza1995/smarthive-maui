import { Router } from "express";
import { checkPermission } from "../middlewares/auth.checkPermission";
import { userAuth } from "../middlewares/auth.middleware";
import {
  getAutomoxIntegrationSites,
  getMalwareByteIntegrationDetails,
  getMalwareByteIntegrationSites,
  verifyAutomoxZone,
} from "../mongo/malwareBytes/Sites/sites.controller";
import integrationController from "../Mysql/Integration/integration.controller";
import { permissionSlug } from "../Mysql/Permissions/permissionSlugs";

const integrationsRouter = Router();

// Delete User Integration
/**
 * @swagger
 * /integrations/delete/:id:
 *   delete:
 *     summary: Delete Integration  With  id
 *     tags: [Integration]
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

integrationsRouter.delete(
  "/delete/:id",
  [
    userAuth,
    checkPermission(permissionSlug.ADMINISTRATION_INTEGRATION, "delete"),
  ],
  integrationController.deleteUserIntegration
);
/**
 * @swagger
 * /integrations/user:
 *   post:
 *     summary: Save User Integration
 *     tags: [Integration]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: ""
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                    integration_name:
 *                      type: string
 *                      description: ""
 *                    integration_category_type:
 *                      type: string
 *                      description: ""
 *                    integration_values:
 *                      type: object
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
integrationsRouter.post(
  "/user",
  [
    userAuth,
    checkPermission(permissionSlug.ADMINISTRATION_INTEGRATION, "edit"),
  ],
  integrationController.saveUserIntegration
);
/**
 * @swagger
 * /integrations/admin:
 *   post:
 *     summary: Save admin Integration
 *     tags: [Integration]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: ""
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                    integration_name:
 *                      type: string
 *                      description: ""
 *                    integration_category_type:
 *                      type: string
 *                      description: ""
 *                    integration_values:
 *                      type: object
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
integrationsRouter.post(
  "/admin",
  userAuth,
  integrationController.saveUserIntegrationByAdmin
);

/**
 * @swagger
 * /integrations/user:
 *   get:
 *     summary: Get User Integration list
 *     tags: [Integration]
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
 *                data:
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
 *                    integration_name:
 *                      type: string
 *                      description: ""
 *                    integration_category_type:
 *                      type: string
 *                      description: ""
 *                    integration_values:
 *                      type: object
 *                    createdAt:
 *                      type: string
 *                      description: ""
 *                    updatedAt:
 *                      type: string
 *                      description: ""
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
integrationsRouter.get(
  "/user",
  [
    userAuth,
    checkPermission(permissionSlug.ADMINISTRATION_INTEGRATION, "view"),
  ],
  integrationController.getUserIntegrations
);

// Validate Integration
integrationsRouter.post(
  "/validate",
  integrationController.validateIntegrations
);
// Automox integration

/**
 * @swagger
 * /integrations/create-automox:
 *   post:
 *     summary: Create Automox organizations of login user
 *     tags: [Integration]
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
integrationsRouter.post(
  "/create-automox",
  userAuth,
  integrationController.createAutomoxOrganization
);
// MalwareByte integration

/**
 * @swagger
 * /integrations/malwarebyte/site:
 *   post:
 *     summary: Get MalwareByte Integration sites
 *     tags: [Integration]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: ""
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                client_id:
 *                  type: string
 *                  format: uuid
 *                  description: MalwareByte integration client ID
 *                client_secret:
 *                  type: string
 *                  description: MalwareByte integration client secret
 *               required:
 *                - client_secret
 *                - client_id
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                sites:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties: 
 *                    company_name:
 *                     type: string
 *                    account_id:
 *                     type: string
 *                     format: uuid
 *                    account_ status:
 *                     type: string
 *                    total_devices:
 *                     type: number
 *                message:
 *                  type: string
 *                  description: ""
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

integrationsRouter.post(
  "/malwarebyte/site",
  userAuth,
  getMalwareByteIntegrationSites
);

// Get Automox integration

/**
 * @swagger
 * /integrations/automox/zones:
 *   post:
 *     summary: Get Automox Integration
 *     tags: [Integration]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: ""
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                account_id:
 *                  type: string
 *                  format: uuid
 *                  description: Automox integration account ID
 *                access_token:
 *                  type: string
 *                  description: Automox integration access token
 *               required:
 *                - account_id
 *                - access_token
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
integrationsRouter.post("/automox/zones", userAuth, getAutomoxIntegrationSites);

// Verify integration

/**
 * @swagger
 * /integrations/automox/verify_zone:
 *   post:
 *     summary:  Verify Automox Integration
 *     tags: [Integration]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: ""
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                organization_id:
 *                  type: string
 *                  format: uuid
 *                  description: Automox organization Id
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

integrationsRouter.post("/automox/verify_zone", userAuth, verifyAutomoxZone);

// GEt MalwareByte integration
/**
 * @swagger
 * /integrations/malwarebyte/details/{type}:
 *   get:
 *     summary: Get MalwareByte Integration details
 *     tags: [Integration]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [patching, endpoint]
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                sites:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties: 
 *                    company_name:
 *                     type: string
 *                    account_id:
 *                     type: string
 *                     format: uuid
 *                    account_ status:
 *                     type: string
 *                    total_devices:
 *                     type: number 
 *                    installer:
 *                     type: object
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

integrationsRouter.get(
  "/malwarebyte/details/:type",
  userAuth,
  getMalwareByteIntegrationDetails
);

export default integrationsRouter;
