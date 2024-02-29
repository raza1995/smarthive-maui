import { Router } from "express";
import { auvikCronFUnction, runCron } from "../cron/cron.controller";
import { knowb4CronFunction } from "../cron/IntgrationsCron/Knowb4Crons.service";
import { microsoftCronFunctionMain } from "../cron/IntgrationsCron/MicrosoftCrons.service";
import { patchingCron } from "../cron/patchingCron/patchingCron";
import { getAutomoxPolicies } from "../mongo/controllers/Automox/automoxPolicy.controller";
import getSentinelOneSoftware from "../mongo/sentinelone/Softwares/sentineloneSoftware.controller";
import { getLogsActiveCSV } from "../Mysql/Logs/eventLogs/eventLogs.controller";
import { saveGroupsToMySql } from "../Mysql/PatchingGroups/patchingGroups.controller";
import { savePoliciesToMySql } from "../Mysql/PatchingPolicy/patchingPolicy.controller";

const devRouter = Router();
if (process.env.ENVIRONMENT === "DEV") {
  /**
   * @swagger
   * /logs/csv:
   *   get:
   *     summary: Get csv file of logs code
   *     tags: ["Development Api"]
   *     responses:
   *       200:
   *         description: Success response
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               items:
   *                 $ref: '#/components/schema`s/log'
   *       401:
   *         description: Not authenticated
   *       default:
   *          description: Something went wrong
   */

  devRouter.get("/logs/csv", getLogsActiveCSV);
  /**
   * @swagger
   * "/cron/{type}":
   *   get:
   *     summary: This Api will run cron for particular integration
   *     tags: ["Development Api"]
   *     parameters:
   *       - in: path
   *         name: type
   *         required: true
   *         schema:
   *           type: string
   *           enum: ["malwareBytes","crowdStrike", "auvik","automox","sentinelOne","opencve","druva"]
   *     responses:
   *       200:
   *         description: Success response
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       401:
   *         description: Not authenticated
   *       default:
   *          description: Something went wrong
   */
  devRouter.get("/cron/:type", runCron);

    /**
   * @swagger
   * "/patching/cron":
   *   get:
   *     summary: Run cron for integration
   *     tags: ["Development Api"]
   *     responses:
   *       200:
   *         description: Success response
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       401:
   *         description: Not authenticated
   *       default:
   *          description: Something went wrong
   */
  devRouter.get("/patching/cron", patchingCron);

  // save groups to mysql
  devRouter.get("/saveGroupsToMysql", saveGroupsToMySql);
  devRouter.get("/getAutomoxPolicies", getAutomoxPolicies);
  devRouter.get("/savePoliciesToMySql", savePoliciesToMySql);
  devRouter.get("/sentinelone-software", getSentinelOneSoftware);
  devRouter.get("/fetch-know-be-user", knowb4CronFunction);
  devRouter.get("/microsoftCronFunction", microsoftCronFunctionMain);

  devRouter.get("/logs/csv", getLogsActiveCSV);

  /**
   * @swagger
   * /auvikCron:
   *   get:
   *     summary: Start auvik cron
   *     tags: ["Development Api"]
   *     responses:
   *       200:
   *         description: Success response
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               items:
   *                 $ref: '#/components/schema`s/log'
   *       401:
   *         description: Not authenticated
   *       default:
   *          description: Something went wrong
   */
  devRouter.get("/auvikCron", auvikCronFUnction);

}

export default devRouter;
