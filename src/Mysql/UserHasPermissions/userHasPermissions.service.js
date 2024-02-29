import { errorHandler } from "../../utils/errorHandler";
import userHasPermissionsSQLModel from "./userHasPermissions.model";

export const createUserPermissions = async(user_id, company_id, permissions) => {
    try {
        console.log("user Permissions")
        if(permissions.length > 0) {
            userHasPermissionsSQLModel.destroy({
                where: {
                    user_id,
                }
            })
            permissions.forEach(async permission => {
                const object = {
                    permission_id: permission.permission_id,
                    user_id,
                    actions: permission.actions
                }
                await userHasPermissionsSQLModel.create(object)
            })
        }
        return true;
    } catch (err) {
        errorHandler(err);
        return err.message;
    }
}