import { Router } from "express"
import { checkPermission } from "../../middlewares/auth.checkPermission";
import { userAuth } from "../../middlewares/auth.middleware"
import validateRequestPayload from "../../middlewares/validateRequestPayload";
import { addNewApplication, applicationList, deleteApplication, editApplication, getSharedApplications, viewApplication } from "../../Mysql/Applications/application.controller"
import { createApplicationApiPayload, updateApplicationApiPayload } from "../../Mysql/Applications/application.dto";
import { APPLICATION_URL } from "./urlConstant";

const applicationRouter = Router()

/**
 * @swagger
 * /application/create:
 *   post:
 *     summary: Create application
 *     tags: [Application]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: ""
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                name:
 *                  type: string
 *                  example: xyz          
 *                description:
 *                  type: string           
 *                is_shared_service:
 *                  type: boolean
 *                is_using_other_services:
 *                  type: boolean
 *                asset_ids:
 *                  type: array
 *                  items:
 *                   type: string
 *                   format: uuid     
 *                service_ids:
 *                  type: array
 *                  items:
 *                   type: string
 *                   format: uuid     
 *                human_ids:
 *                  type: array
 *                  items:
 *                   type: string
 *                   format: uuid      
 *               required:
 *                - name
 *                - description
 *                - is_shared_service
 *                - is_using_other_services
 *                - asset_ids
 *                - human_ids
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


applicationRouter.post(
    APPLICATION_URL.CREATE.URL,
    [
        userAuth, 
        checkPermission(APPLICATION_URL.CREATE.SLUG, APPLICATION_URL.CREATE.ACTION),
        validateRequestPayload(createApplicationApiPayload),
    ], 
    addNewApplication
);

/**
 * @swagger
 * /application/edit/{id}:
 *   post:
 *     summary: Edit and update application
 *     tags: [Application]
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
 *                name:
 *                  type: string
 *                  example: xyz          
 *                description:
 *                  type: string           
 *                is_shared_service:
 *                  type: boolean
 *                is_using_other_services:
 *                  type: boolean
 *                asset_ids:
 *                  type: array
 *                  items:
 *                   type: string
 *                   format: uuid     
 *                service_ids:
 *                  type: array
 *                  items:
 *                   type: string
 *                   format: uuid     
 *                human_ids:
 *                  type: array
 *                  items:
 *                   type: string
 *                   format: uuid      
 *               required:
 *                - name
 *                - description
 *                - is_shared_service
 *                - is_using_other_services
 *                - asset_ids
 *                - human_ids
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


applicationRouter.post(
    APPLICATION_URL.UPDATE.URL, 
    [
        userAuth, 
        checkPermission(APPLICATION_URL.UPDATE.SLUG, APPLICATION_URL.UPDATE.ACTION),
        validateRequestPayload(updateApplicationApiPayload),
    ], 
    editApplication
);

/**
 * @swagger
 * /application/delete/{id}:
 *   post:
 *     summary: Delete application by id
 *     tags: [Application]
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


applicationRouter.post(
    APPLICATION_URL.DELETE.URL, 
    [userAuth, checkPermission(APPLICATION_URL.DELETE.SLUG, APPLICATION_URL.DELETE.ACTION)], 
    deleteApplication
);

/**
 * @swagger
 * /application/list:
 *   get:
 *     summary: Get list of applications
 *     tags: [Application]
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
 *                    created_by_id:
 *                      type: string
 *                      description: ""          
 *                    company_id:
 *                      type: string
 *                      description: "" 
 *                    name:
 *                      type: string
 *                      example: xyz          
 *                    description:
 *                      type: string           
 *                    is_shared_service:
 *                      type: boolean
 *                    is_using_other_services:
 *                      type: boolean
 *                    asset_ids:
 *                      type: array
 *                      items:
 *                       type: string
 *                       format: uuid     
 *                    service_ids:
 *                      type: array
 *                      items:
 *                       type: string
 *                       format: uuid     
 *                    human_ids:
 *                      type: array
 *                      items:
 *                       type: string
 *                       format: uuid   
 *                    risk_score:
 *                      type: number
 *                    linked_human_score:
 *                      type: number
 *                    linked_asset_score:
 *                      type: number
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

applicationRouter.get(
    APPLICATION_URL.LIST.URL, 
    [userAuth, checkPermission(APPLICATION_URL.LIST.SLUG, APPLICATION_URL.LIST.ACTION)], 
    applicationList
);

/**
 * @swagger
 * /application/view/{id}:
 *   get:
 *     summary: Get detail view of application
 *     tags: [Application]
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
 *                tableData:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      description: ""          
 *                    created_by_id:
 *                      type: string
 *                      description: ""          
 *                    company_id:
 *                      type: string
 *                      description: "" 
 *                    name:
 *                      type: string
 *                      example: xyz          
 *                    description:
 *                      type: string           
 *                    is_shared_service:
 *                      type: boolean
 *                    is_using_other_services:
 *                      type: boolean
 *                    risk_score:
 *                      type: number
 *                    linked_human_score:
 *                      type: number
 *                    linked_asset_score:
 *                      type: number
 *                    createdAt:
 *                      type: string
 *                      description: ""          
 *                    updatedAt:
 *                      type: string
 *                      description: ""          
 *                    application_assets:
 *                      type: array
 *                      items:
 *                       type: object
 *                       properties:
 *                            id:
 *                             type: string
 *                             format: uuid     
 *                            application_id:
 *                             type: string
 *                             format: uuid     
 *                            asset_id:
 *                             type: string
 *                             format: uuid     
 *                            company_id:
 *                             type: string
 *                             format: uuid     
 *                            createdAt:
 *                              type: string
 *                              description: ""          
 *                            updatedAt:
 *                              type: string
 *                              description: ""  
 *                            asset:
 *                             type: object
 *                             properties:
 *                                  id:
 *                                   type: string
 *                                   format: uuid     
 *                                  company_id:
 *                                   type: string
 *                                   format: uuid     
 *                                  asset_name:
 *                                   type: string
 *                                  ipaddress:
 *                                   type: string
 *                                  asset_type:
 *                                   type: string
 *                                  asset_sub_type:
 *                                   type: string
 *                                  createdAt:
 *                                    type: string
 *                                    description: ""          
 *                                  updatedAt:
 *                                    type: string
 *                                    description: ""     
 *                    application_humans:
 *                      type: array
 *                      items:
 *                       type: object
 *                       properties:
 *                            id:
 *                             type: string
 *                             format: uuid     
 *                            application_id:
 *                             type: string
 *                             format: uuid     
 *                            human_id:
 *                             type: string
 *                             format: uuid     
 *                            company_id:
 *                             type: string
 *                             format: uuid     
 *                            createdAt:
 *                              type: string
 *                              description: ""          
 *                            updatedAt:
 *                              type: string
 *                              description: ""  
 *                            human:
 *                             type: object
 *                             properties:
 *                                  id:
 *                                   type: string
 *                                   format: uuid     
 *                                  company_id:
 *                                   type: string
 *                                   format: uuid     
 *                                  asset_name:
 *                                   type: string
 *                                  ipaddress:
 *                                   type: string
 *                                  asset_type:
 *                                   type: string
 *                                  asset_sub_type:
 *                                   type: string
 *                                  createdAt:
 *                                    type: string
 *                                    description: ""          
 *                                  updatedAt:
 *                                    type: string
 *                                    description: ""   
 *                sharedServices:
 *                   type: array
 *                   items:
 *                       type: object
 *                       properties:
 *                            id:
 *                             type: string
 *                             format: uuid     
 *                            application_id:
 *                             type: string
 *                             format: uuid     
 *                            service_id:
 *                             type: string
 *                             format: uuid     
 *                            company_id:
 *                             type: string
 *                             format: uuid     
 *                            createdAt:
 *                              type: string
 *                              description: ""          
 *                            updatedAt:
 *                              type: string
 *                              description: ""  
 *                            application:
 *                             type: object
 *                             properties:
 *                              id:
 *                                type: string
 *                                description: ""          
 *                              created_by_id:
 *                                type: string
 *                                description: ""          
 *                              company_id:
 *                                type: string
 *                                description: "" 
 *                              name:
 *                                type: string
 *                                example: xyz          
 *                              description:
 *                                type: string           
 *                              is_shared_service:
 *                                type: boolean
 *                              is_using_other_services:
 *                                type: boolean 
 *                              risk_score:
 *                                type: number
 *                              linked_human_score:
 *                                type: number
 *                              linked_asset_score:
 *                                type: number
 *                              createdAt:
 *                                type: string
 *                                description: ""          
 *                              updatedAt:
 *                                type: string 
 *                average:
 *                  type: number
 *                  example: 1
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */

applicationRouter.get(
    APPLICATION_URL.VIEW.URL, 
    [userAuth, checkPermission(APPLICATION_URL.LIST.SLUG, APPLICATION_URL.LIST.ACTION)], 
    viewApplication
);

/**
 * @swagger
 * /application/shared/list:
 *   get:
 *     summary: Get list of shared application
 *     tags: [Application]
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
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                scoreWeightage:
 *                  type: array
 *                  items:
 *                   type: object
 *                   properties:
 *                    id:
 *                      type: string
 *                      description: ""          
 *                    created_by_id:
 *                      type: string
 *                      description: ""          
 *                    company_id:
 *                      type: string
 *                      description: "" 
 *                    name:
 *                      type: string
 *                      example: xyz          
 *                    description:
 *                      type: string           
 *                    is_shared_service:
 *                      type: boolean
 *                    is_using_other_services:
 *                      type: boolean 
 *                    risk_score:
 *                      type: number
 *                    linked_human_score:
 *                      type: number
 *                    linked_asset_score:
 *                      type: number
 *                    createdAt:
 *                      type: string
 *                      description: ""          
 *                    updatedAt:
 *                      type: string
 *                totalCount:
 *                  type: number
 *                  example: 1
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */



applicationRouter.get(
    APPLICATION_URL.SHARED_LIST.URL, 
    [userAuth, checkPermission(APPLICATION_URL.SHARED_LIST.SLUG, APPLICATION_URL.SHARED_LIST.ACTION)], 
    getSharedApplications
);

export default applicationRouter
