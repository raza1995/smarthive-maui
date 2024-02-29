import HttpStatus from "http-status-codes";
import { roles } from "../utils/constants";
/**
 * Middleware to authenticate if user has a valid Authorization token
 * Authorization: Bearer <token>
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const userRoleAdmin = async (req, res, next) => {
  try {
    const { user } = req;
    // if (!user && process.env.ENVIRONMENT != 'DEV') {
    //   res.status(HttpStatus.UNAUTHORIZED).json({
    //     code: HttpStatus.UNAUTHORIZED,
    //     message: 'Authorization token is required'
    //   });
    // }
    const userRoles =
      user["http://schemas.microsoft.com/ws/2008/06/identity/claims/roles"];

    if (user && userRoles.indexOf(roles.SuperAdmin) === -1) {
      return res.status(HttpStatus.FORBIDDEN).send({
        code: HttpStatus.FORBIDDEN,
        message: "You are not authorized to perform this action",
      });
    }

    next();
  } catch (error) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      code: HttpStatus.UNAUTHORIZED,
      message: error,
    });
  }
};
