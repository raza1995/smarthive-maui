import HttpStatus from "http-status-codes";
import { findUserOAuthId } from "../Mysql/Users/users.service";
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
export const userRoleCustomerAdmin = async (req, res, next) => {
  try {
    const user = await findUserOAuthId(req.user.sub);

    if (!user && process.env.ENVIRONMENT !== "DEV") {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        code: HttpStatus.UNAUTHORIZED,
        message: "Authorization token is required",
      });
    }
    if (user.role !== roles.CustomerAdmin) {
      return res.status(HttpStatus.FORBIDDEN).send({
        code: HttpStatus.FORBIDDEN,
        message: "You are not Authorized to perform action",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    errorHandler(error);
    return res.status(HttpStatus.UNAUTHORIZED).send({
      code: HttpStatus.UNAUTHORIZED,
      message: error,
    });
  }
};
