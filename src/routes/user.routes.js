import { Router } from "express";
import { checkPermission } from "../middlewares/auth.checkPermission";
import { userAuth } from "../middlewares/auth.middleware";
import validateRequestPayload from "../middlewares/validateRequestPayload";
import invitationController from "../Mysql/Invitations/invitation.controller";
import { userSendInviteApiPayload } from "../Mysql/Invitations/invitations.dto";
import { permissionSlug } from "../Mysql/Permissions/permissionSlugs";
import userController from "../Mysql/Users/users.controller";
import { userUpdateStatusApiPayload } from "../Mysql/Users/users.dto";

const userRouter = Router();

// Not in use
userRouter.get("/", userAuth, userController.getUsers);
userRouter.post("/update", userController.updateUser);
/**
* @swagger
* /users/add:
*   post:
*     summary: Send invitation to user
*     tags: [User]
*     security:
*      - BearerAuth: []
*     requestBody:
*         description: Optional description in *Markdown*
*         required: true
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/sendInvite'
*     responses:  
*       200:
*         description: Login user information
*         content:
*           application/json:
*             schema:
*                 $ref: '#/components/schemas/sendInvite'
*       401:
*         description: Not authenticated
*       default:
*          description: Something went wrong
*/
userRouter.post("/add", userAuth, userController.addUser);


/**
 * @swagger
 * /users/updateStatus/{id}:
 *   post:
 *     summary: This API will update the user status
 *     tags: ["User"]
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
 *         description: Optional description in *Markdown*
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                is_active:
 *                  type: Object
 *                  example: true
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/log'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
userRouter.post(
  "/updateStatus/:id", 
  // userAuth,
  [
    userAuth, 
    validateRequestPayload(userUpdateStatusApiPayload),
  ],
  userController.updateUserStatus
  );

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *        type: http
 *        scheme: bearer
 *   schemas:
 *     user:
 *       type: object
 *
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *        type: http
 *        scheme: bearer
 *   schemas:
 *     sendInvite:
 *       type: object
 *       properties:
 *         data:
 *          type: object
 *          description: data object.
 *
 */

/**
 * @swagger
 * /users/info:
 *   get:
 *     summary: Returns Detail information of login user
 *     tags: [User]
 *     security:
 *      - BearerAuth: []
 *     responses:
 *       200:
 *         description: Login user information
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                data:
 *                  type: object
 *                  properties:
 *                    sub:
 *                      type: string
 *                    id:
 *                      type: string
 *                      format: uuid
 *                    auth0_id:
 *                      type: string
 *                      format: uuid
 *                    full_name:
 *                      type: string
 *                    profile_image:
 *                      type: string
 *                    email: 
 *                      type: string
 *                      description: Email of user
 *                    phone_number:
 *                      type: string
 *                    approved_by_customer_admin:
 *                      type: boolean
 *                    is_active:
 *                      type: boolean
 *                    prefer_contact:
 *                      type: string
 *                    last_active:
 *                      type: string
 *                      format: date-time
 *                    createdAt:
 *                      type: string
 *                      format: date-time
 *                    updatedAt:
 *                      type: string
 *                      format: date-time
 *                    company_id:
 *                      type: string
 *                      format: uuid
 *                    company:
 *                      type: object
 *                      properties:
 *                        company_name:
 *                          type: string
 *                        company_domain:
 *                          type: string
 *                    integrations:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          id:
 *                            type: string
 *                            format: uuid
 *                          integration_name:
 *                            type: string
 *                          integration_category_type:
 *                            type: string
 *                    role_details:
 *                        type: object
 *                        properties:
 *                          id:
 *                            type: string
 *                            format: uuid
 *                          name:
 *                            type: string
 *                          slug:
 *                            type: string
 *                          user_permissions:
 *                            type: array
 *                            items:
 *                              type: object
 *                              properties:
 *                                id:
 *                                  type: string
 *                                  format: uuid
 *                                slug:
 *                                  type: string
 *                                actions:
 *                                  type: array
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
userRouter.get("/info", userAuth, userController.getUserInfo);


/**
 * @swagger
 * /users/get:
 *   get:
 *     summary: Returns Detail information of login user
 *     tags: [User]
 *     security:
 *      - BearerAuth: []
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
userRouter.get("/get", userAuth, userController.getUser);


/**
 * @swagger
 * /users/send-invite:
 *   post:
 *     summary: Send invitation to user
 *     tags: [User]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: Optional description in *Markdown*
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                data:
 *                  type: Object
 *                  example: { inviting_emails: ["xyz@abc.com"], role: analyst, role_permissions: [] }
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
userRouter.post(
  "/send-invite",
  // userAuth,
  [
    userAuth, 
    validateRequestPayload(userSendInviteApiPayload),
  ],
  invitationController.sendInvite
);

/**
 * @swagger
 * /users/invited:
 *   get:
 *     summary: Returns List on invited users
 *     tags: [User]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: size
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *            type: integer
 *       - in: query
 *         name: filter
 *         required: true
 *         schema:
 *            type: object
 *     responses:
 *       200:
 *         description: list of invited user
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
userRouter.get(
  "/invited",
  [userAuth, checkPermission(permissionSlug.ADMINISTRATION_USER_MANAGEMENT_INVITE_USER,"view")],
  invitationController.getInvitedUsers
);


userRouter.get("/tenants", userAuth, userController.getTenants);




export default userRouter;
