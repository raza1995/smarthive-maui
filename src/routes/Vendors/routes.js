import { Router } from "express";
import VENDORS__URL from "./urlConstant";
import { getVendorsController } from "../../Mysql/Vendors/Vendors.controller";

const VendorsRouter = Router();

/**
 * @swagger
 * /vendors/lists:
 *   get:
 *     summary: Get list of vendors with software
 *     tags: [Vendors]
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
 *                cves:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      format: uuid
 *                    cve:
 *                      type: string
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

VendorsRouter.get(
  VENDORS__URL.getVendorsList.URL,
  // [userAuth],
  getVendorsController
);

export default VendorsRouter;
