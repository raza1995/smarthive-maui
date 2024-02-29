import { Router } from "express";
import {
  getIdTokenFromAccessToken,
  userAuth,
} from "../middlewares/auth.middleware";
import authController from "../Mysql/Auth/auth.controller";
import { permissionList } from "../Mysql/Permissions/permission.controller";
import { roleList } from "../Mysql/Roles/roles.controller";

const authRouter = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *        type: http
 *        scheme: bearer
 *   schemas:
 *     signup:
 *       type: object
 *       properties:
 *        id:
 *          type: integer
 *          example: The user ID.
 *        email:
 *          type: string
 *          description: The user email.
 *        phone_number:
 *          type: string
 *          description: The user phone_number.
 *        full_name:
 *          type: string
 *          description: The user full_name.
 *        prefer_contact:
 *          type: string
 *          description: The user auth type.
 *        profile_image:
 *          type: string
 *          description: The user profile_image.
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
 *     otp:
 *       type: object
 *       properties:
 *        email:
 *          type: string
 *          description: The user email.
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
 *     verifyOtp:
 *       type: object
 *       properties:
 *        phoneNumber:
 *          type: string
 *          description: The user email.
 *
 */


// Auth Signup
/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Store user and return stored user data
 *     tags: ["Auth"]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: Optional description in *Markdown*
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                email:
 *                  type: string
 *                  example: xyz@abc.com
 *                phoneNumber:
 *                  type: string
 *                  example: 987654321
 *                is_approved:
 *                  type: integer
 *                  example: 1
 *                fullName:
 *                  type: string
 *                  example: 1
 *                authType:
 *                  type: string
 *                  example: email
 *                profileImage:
 *                  type: string
 *                  example: image
 *                industry:
 *                  type: string
 *                  example: Industry Name
 *                industryType:
 *                  type: string
 *                  example: Financial
 *     responses:
 *       200:
 *         description: A User object
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/signup'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
authRouter.post("/signup", authController.signup);

// Partner Signup
/**
 * @swagger
 * /auth/partner/signup:
 *   post:
 *     summary: Store partner and return stored partner data
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: Optional description in *Markdown*
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                email:
 *                  type: string
 *                  example: xyz@abc.com
 *                phoneNumber:
 *                  type: string
 *                  example: 987654321
 *                is_approved:
 *                  type: integer
 *                  example: 1
 *                full_name:
 *                  type: string
 *                  example: 1
 *                authType:
 *                  type: string
 *                  example: email
 *                profileImage:
 *                  type: string
 *                  example: image
 *                industryType:
 *                  type: string
 *                  example: Financial
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/signup'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
authRouter.post("/partner/signup", authController.partnerSignup);

authRouter.post("/update-signup", authController.updateUserAtRegistration);

// Send otp
/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send otp on email
 *     tags: ["Auth"]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: Optional description in *Markdown*
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                email:
 *                  type: string
 *                  example: xyz@abc.com
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/otp'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
authRouter.post("/send-otp", authController.loginEmailOTP);
authRouter.post("/send-phone-otp", authController.loginPhoneOTP);

// Verify otp
/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify otp on email
 *     tags: ["Auth"]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: Optional description in *Markdown*
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                phoneNumber:
 *                  type: string
 *                  example: 9876543210
 *                otp:
 *                  type: string
 *                  example: 123456
 *                email:
 *                  type: string
 *                  example: abc@xyz.com
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/verifyOtp'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
authRouter.post("/verify-otp", authController.verifyOTP);
authRouter.post("/verify-phone-otp", authController.verifyPhoneOTP);
authRouter.post(
  "/login-by-link",
  getIdTokenFromAccessToken,
  authController.loginUserByLink
);
authRouter.post("/invite-code", authController.processInvite);

// Use for development purpose
authRouter.post("/client-credentials", authController.clientCredentials);
authRouter.post("/auth0-roles", authController.getManagementRoles);
authRouter.get("/roles", userAuth, roleList);
authRouter.get("/permissions", userAuth, permissionList);
export default authRouter;
