/* eslint-disable no-console */
import { logger } from "../../logs/config";

export const errorHandler = (error) => {
  console.log(error);
  logger.error(
    `ERROR MESSAGE:,${error?.message},  FILE_REFERENCE, ${error.stack}, ERROR_TYPE,${error.name}`
  );
};
