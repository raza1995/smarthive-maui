import HttpStatus from "http-status-codes";
import rolesSQLModel from "../Mysql/Roles/roles.model";
import userRolesSQLModel from "../Mysql/UserRoles/userRoles.model";
import { findUserOAuthId } from "../Mysql/Users/users.service";
import { errorHandler } from "../utils/errorHandler";

const checkRole = async (user, type) => {
    const fyndUserRole = await userRolesSQLModel.findOne({
        where: {
            user_id: user.id,
        },
        include:[
            {
                model: rolesSQLModel, 
                where: {
                    type
                },
                attributes:["slug", "id"],
                required: true
            }
        ],
        attributes:[]
    });
    if(fyndUserRole) {
        return true;
    }
    return false;
};


export const checkUserRole = (type) => async(req, res, next) => {
    try {
        const user = await findUserOAuthId(req.user.sub);
        const hasAccess = await checkRole(user, type);
        if(hasAccess) {
            next();
        } else {
            return res.status(HttpStatus.UNAUTHORIZED).send({
                code: HttpStatus.UNAUTHORIZED,
                message: "User has no permissions",
            });
        }        
    } catch (error) {
      errorHandler(error);
      return res.status(HttpStatus.UNAUTHORIZED).send({
        code: HttpStatus.UNAUTHORIZED,
        message: error,
      });
    }  
};
