import { errorHandler } from "../../utils/errorHandler";
import roleHasPermissionsSQLModel from "./roleHasPermissions.model";

export const createNewRolePermissions = async (role_id, company_id, permissions) => {
    try {
        if(permissions.length > 0) {
            permissions.forEach(async permission => {
                const object = {
                    permission_id: permission.permission_id,
                    role_id,
                    actions: permission.actions
                }
                await roleHasPermissionsSQLModel.create(object)
            })
        }
        return true;
    } catch (err) {
        errorHandler(err);
        return err.message;
    }
}