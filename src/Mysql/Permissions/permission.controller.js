import { roles } from "../../utils/constants";
import { findUserOAuthId } from "../Users/users.service";
import { getAllPermissions } from "./permission.service";

export const permissionList = async (req, res) => {
    try {
        let {type} = req.query
        if(!type) {
            type = "company"
        }
        const permissions = await getAllPermissions(type);
        res.status(200).json({
            message: "Permissions fetched successfully",
            permissions
        });
    } catch (err) {
        res.status(503).json(err.message);
    }
}