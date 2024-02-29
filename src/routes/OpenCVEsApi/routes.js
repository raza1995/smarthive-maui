import { Router } from "express";
import { userAuth } from "../../middlewares/auth.middleware";
import {
  getOpenCVEs,
  getOpenCVEsDetailById,
} from "../../Postgresql/Cves/Cves.controller";

import OPENCVES__URL from "./urlConstant";
import { getOpenCVEsVendors } from "../../Postgresql/Vendors/Vendors.controller";
import {
  getOpenCVEsProductCVEs,
  getOpenCVEsProducts,
} from "../../Postgresql/Products/Products.controller";

const OpenCVEsRouter = Router();

/**
 * @swagger
 * /opencve/cves:
 *   get:
 *     summary: Get List of cves of opencve
 *     tags: [Opencves]
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
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                totalCves:
 *                  type: string
 *                cves:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      format: uuid
 *                    name:
 *                      type: string
 *                    created_at:
 *                      type: string
 *                      format: date-time
 *                    updated_at:
 *                      type: string
 *                      format: date-time
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

OpenCVEsRouter.get(
  OPENCVES__URL.getCVESList.URL,
  [
   userAuth
  ],
  getOpenCVEs
);
/**
 * @swagger
 * /opencve/cves/{cve_id}:
 *   get:
 *     summary: Get detail of cve by cve_id
 *     tags: [Opencves]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cve_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                cves:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      format: uuid
 *                    name:
 *                      type: string
 *                    created_at:
 *                      type: string
 *                      format: date-time
 *                    updated_at:
 *                      type: string
 *                      format: date-time
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

OpenCVEsRouter.get(
  OPENCVES__URL.getCVEsDetail.URL,
  [
    userAuth
   ],
  getOpenCVEsDetailById
);

/**
 * @swagger
 * /opencve/vendors:
 *   get:
 *     summary: Get list of vendors from opencve
 *     tags: [Opencves]
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
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                totalVendors:
 *                  type: string
 *                vendors:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      format: uuid
 *                    name:
 *                      type: string
 *                    created_at:
 *                      type: string
 *                      format: date-time
 *                    updated_at:
 *                      type: string
 *                      format: date-time
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

OpenCVEsRouter.get(
  OPENCVES__URL.getVendorsList.URL,
  [
    userAuth
   ],
  getOpenCVEsVendors
);

/**
 * @swagger
 * /opencve/products:
 *   get:
 *     summary: Get list of vendors products from opencve
 *     tags: [Opencves]
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
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                totalProducts:
 *                  type: string
 *                products:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      format: uuid
 *                    vendor_id:
 *                      type: string
 *                      format: uuid
 *                    name:
 *                      type: string
 *                    created_at:
 *                      type: string
 *                      format: date-time
 *                    updated_at:
 *                      type: string
 *                      format: date-time
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

OpenCVEsRouter.get(
  OPENCVES__URL.getProductsList.URL,
  [
    userAuth
   ],
  getOpenCVEsProducts
);

/**
 * @swagger
 * /opencve/cves:
 *   get:
 *     summary: Get List of cves of opencve
 *     tags: [Opencves]
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
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                totalCves:
 *                  type: string
 *                cves:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      format: uuid
 *                    name:
 *                      type: string
 *                    created_at:
 *                      type: string
 *                      format: date-time
 *                    updated_at:
 *                      type: string
 *                      format: date-time
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

OpenCVEsRouter.get(
  OPENCVES__URL.getProductCVEs.URL,
  [
    userAuth
   ],
  getOpenCVEsProductCVEs
);

export default OpenCVEsRouter;
