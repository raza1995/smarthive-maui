import HttpStatus from "http-status-codes";
import { roles } from "../utils/constants";
import { errorHandler } from "../utils/errorHandler";
/**
 * Middleware to authenticate if user has a valid Authorization token
 * Authorization: Bearer <token>
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const userRoleSolver = async (req, res, next) => {
  try {
    const { user } = req;
    if (!user && process.env.ENVIRONMENT !== "DEV") {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        code: HttpStatus.UNAUTHORIZED,
        message: "Authorization token is required",
      });
    }
    const userRoles =
      user["http://schemas.microsoft.com/ws/2008/06/identity/claims/roles"];

    if (user && userRoles.indexOf(roles.CustomerAuditor) === -1) {
      return res.status(HttpStatus.FORBIDDEN).send({
        code: HttpStatus.FORBIDDEN,
        message: "You are not Authorized to perform action",
      });
    }

    next();
  } catch (error) {
    errorHandler(error);
    return res.status(HttpStatus.UNAUTHORIZED).send({
      code: HttpStatus.UNAUTHORIZED,
      message: error,
    });
  }
};
