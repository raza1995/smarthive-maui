import { Router } from "express";
import { checkPermission } from "../middlewares/auth.checkPermission";
import { userAuth } from "../middlewares/auth.middleware";
import { userRoleCustomerAdmin } from "../middlewares/auth.role.admin";
import { permissionSlug } from "../Mysql/Permissions/permissionSlugs";
import userController from "../Mysql/Users/users.controller";

const customerAdminRouter = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *        type: http
 *        scheme: bearer
 *   schemas:
 *     userList:
 *       type: object
 *       properties:
 *         size:
 *          type: integer
 *          description: The number of users shown in the list.
 *         page:
 *          type: integer
 *          description: The page of users shown in the list.
 *
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Returns list of current users
 *     tags: ["Admin"]
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
 *            type: string
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/userList'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
customerAdminRouter.get(
  "/users",
  [userAuth, checkPermission(permissionSlug.ADMINISTRATION_USER_MANAGEMENT_CURRENT_USER, "view")],
  userController.getCustomerAdminUsers
);

/**
 * @swagger
 * /admin/pending_users:
 *   get:
 *     summary: Returns list of pending users
 *     tags: ["Admin"]
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
 *            type: string
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/userList'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
customerAdminRouter.get(
  "/pending_users",
  [userAuth, checkPermission(permissionSlug.ADMINISTRATION_USER_MANAGEMENT_PENDING_USER, "view")],
  // userRoleCustomerAdmin,
  userController.getCustomerAdminPendingUsers
);

customerAdminRouter.post(
  "/update_user",
  userAuth,
  // userRoleCustomerAdmin,
  userController.updateUserDetails
);

export default customerAdminRouter;
