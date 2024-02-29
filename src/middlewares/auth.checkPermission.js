import HttpStatus from "http-status-codes";
import permissionsSQLModel from "../Mysql/Permissions/permissions.model";
import roleHasPermissionsSQLModel from "../Mysql/RoleHasPermissions/roleHasPermissions.model";
import rolesSQLModel from "../Mysql/Roles/roles.model";
import userHasPermissionsSQLModel from "../Mysql/UserHasPermissions/userHasPermissions.model";
import userRolesSQLModel from "../Mysql/UserRoles/userRoles.model";
import { findUserOAuthId } from "../Mysql/Users/users.service";
import { roles } from "../utils/constants";
import { errorHandler } from "../utils/errorHandler";

const userHasPermission = async (user, slug, action, loggedUser = null) => {
    let response = true;
    const fyndUserRole = await userRolesSQLModel.findOne({
        where: {
            user_id: user.id,
        },
        include: [
            { model: rolesSQLModel, attributes: ["slug", "id"] }
        ],
        attributes: []
    });
    let permission = ""
    if (loggedUser && loggedUser?.role === roles.Partner || loggedUser?.role === roles.SuperAdmin) {
        permission = await roleHasPermissionsSQLModel.findOne({
            include: [
                {
                    model: rolesSQLModel,
                    where: {
                        company_id: loggedUser?.company_id, slug: 'admin'
                    },
                },
                { model: permissionsSQLModel, where: { slug }, attributes: [] }
            ]
        });

    } else if (fyndUserRole?.role?.slug === "custom") {
        permission = await userHasPermissionsSQLModel.findOne({
            where: { user_id: user.id },
            attributes: ["actions"],
            include: [
                { model: permissionsSQLModel, where: { slug }, attributes: [] }
            ]
        })
    } else {
        permission = await roleHasPermissionsSQLModel.findOne({
            where: { role_id: fyndUserRole?.role?.id },
            attributes: ["actions"],
            include: [
                { model: permissionsSQLModel, where: { slug }, attributes: [] }
            ]
        })
    }
    const resultOfFilter = permission?.actions?.filter(
        (action2) => Object.keys(action2)[0] === action
    );
    response = Object.values(resultOfFilter?.[0])?.[0] || false
    return response
};

export const checkPermission = (slug, action) => async (req, res, next) => {
    try {
        const user = await findUserOAuthId(req.user.sub);
        const hasAccess = await userHasPermission(user, slug, action, req.user);
        if (hasAccess) {
            next();
        } else {
            return res.status(HttpStatus.FORBIDDEN).send({
                code: HttpStatus.FORBIDDEN,
                message: "Action not allowed",
            });
        }
    } catch (error) {
        errorHandler(error);
        return res.status(HttpStatus.FORBIDDEN).send({
            code: HttpStatus.FORBIDDEN,
            message: error,
        });
    }
};

