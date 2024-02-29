import moment from "moment";
import { logger } from "../../logs/config";
// eslint-disable-next-line import/no-cycle
import {
  automoxCronFunction,
  auvikCronFUnction,
  malwareByteCronFunction,
} from "./cron.controller";
import { patchingCron } from "./patchingCron/patchingCron";
import { CrowdStrikeCronFunction } from "./IntgrationsCron/CrowdStrikeCrons.service";
import { knowb4CronFunction } from "./IntgrationsCron/Knowb4Crons.service";
import { microsoftCronFunctionMain } from "./IntgrationsCron/MicrosoftCrons.service";
import { druvaCronFunction } from "./IntgrationsCron/IntegrationCrons.service.js/druva.service";

const croneStartTime = {
  auvik: moment(new Date()),
  malwareBytes: moment(new Date()),
  automox: moment(new Date()),
  CrowdStrike: moment(new Date()),
  PatchingCron: moment(new Date()),
  human: moment(new Date()),
  microsoft: moment(new Date()),
  druva: moment(new Date()),
};

let cronjobIsNotRunning = true;
const cron = async () => {
  // eslint-disable-next-line no-useless-catch
  try {
    const currentTime = new Date();

    // Auvik crons
    if (cronjobIsNotRunning) {
      cronjobIsNotRunning = false;
      if (croneStartTime.auvik.toDate() < currentTime) {
        croneStartTime.auvik = moment(new Date()).add(1, "h");
        logger.info(`auvik cron is running `);
        await auvikCronFUnction();
        logger.info(`auvik cron completed successfully `);
        croneStartTime.auvik = moment(new Date()).add(15, "m");
      }
      // // Malware Byte crons
      if (croneStartTime.malwareBytes.toDate() < currentTime) {
        console.log("malwareBytes cron is running");
        logger.info("malwareBytes cron is running");
        croneStartTime.malwareBytes = moment(new Date()).add(1, "h");
        await malwareByteCronFunction();
        logger.info(`malwareBytes cron completed successfully `);
        croneStartTime.malwareBytes = moment(new Date()).add(1, "h");
      }
      // // Automox crons
      if (croneStartTime.automox.toDate() < currentTime) {
        console.log("automox cron is running");
        logger.info(`automox cron is running`);
        croneStartTime.automox = moment(new Date()).add(1, "h");
        await automoxCronFunction();
        logger.info(`automox cron completed successfully `);
        croneStartTime.automox = moment(new Date()).add(1, "h");
      }
      // // CrowdStrike crons
      if (croneStartTime.CrowdStrike.toDate() < currentTime) {
        console.log("CrowdStrike cron is running");
        logger.info(`CrowdStrike cron is running`);
        croneStartTime.CrowdStrike = moment(new Date()).add(1, "h");
        CrowdStrikeCronFunction();
        logger.info(`CrowdStrike cron completed successfully `);
        croneStartTime.CrowdStrike = moment(new Date()).add(1, "h");
      }

      // // Patching Cron Trigger
      if (croneStartTime.PatchingCron.toDate() < currentTime) {
        console.log("Patching cron is running");
        logger.info(`Patching Cron is running`);
        croneStartTime.PatchingCron = moment(new Date()).add(1, "h");
        await patchingCron();
        logger.info(`Patching Cron completed successfully `);
        croneStartTime.PatchingCron = moment(new Date()).add(1, "h");
      }

      // Human Cron Trigger
      if (croneStartTime.human.toDate() < currentTime) {
        console.log("human cron is running");
        logger.info(`human Cron is running`);
        croneStartTime.human = moment(new Date()).add(1, "m");
        await knowb4CronFunction();
        logger.info(`human Cron completed successfully `);
        croneStartTime.human = moment(new Date()).add(1, "m");
      }

      // Microsoft Cron Trigger
      if (croneStartTime.microsoft.toDate() < currentTime) {
        console.log("microsoft cron is running");
        logger.info(`microsoft Cron is running`);
        croneStartTime.microsoft = moment(new Date()).add(1, "m");
        await microsoftCronFunctionMain();
        logger.info(`microsoft Cron completed successfully `);
        croneStartTime.human = moment(new Date()).add(1, "m");
      }

      // druva Cron Trigger
      if (croneStartTime.druva.toDate() < currentTime) {
        console.log("druva cron is running");
        logger.info(`druva Cron is running`);
        croneStartTime.druva = moment(new Date()).add(1, "m");
        await druvaCronFunction();
        logger.info(`druva Cron completed successfully `);
        croneStartTime.human = moment(new Date()).add(1, "m");
      }

      cronjobIsNotRunning = true;
    }
  } catch (error) {
    throw error;
  }
};
export default cron;
