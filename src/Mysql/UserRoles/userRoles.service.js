import { errorHandler } from "../../utils/errorHandler";
import rolesSQLModel from "../Roles/roles.model";
import userRolesSQLModel from "./userRoles.model";

export const createUserRole = async (role_id, company_id, user_id, old_data) => {
  try {
    console.log("Creating user Role");
    if(!old_data){
      await userRolesSQLModel.destroy({
        where: {
          user_id,
          company_id,
        },
      });
    }
    await userRolesSQLModel.create({
      role_id,
      company_id,
      user_id,
    });
    return true;
  } catch (err) {
    errorHandler(err);
    return err.message;
  }
};

export const getUserRole  = async (user_id) => {
  try {
    const fyndRole = await userRolesSQLModel.findOne({
          where: {
            user_id
          },
          include:[
            {
                model: rolesSQLModel,
            }
          ],
      })
      if(fyndRole && fyndRole?.role) {
        return fyndRole?.role?.slug
      }
      return null;
  } catch (err) {
    errorHandler(err);
    return err.message;
  }
}

export const getUserRoleType  = async (user_id, type = "company") => {
  try {
    const fyndRole = await userRolesSQLModel.findOne({
          where: {
            user_id
          },
          include:[
            {
                model: rolesSQLModel,
                where:{
                  type
                }
            }
          ],
      })
      if(fyndRole && fyndRole?.role) {
        return fyndRole?.role?.type
      }
      return null;
  } catch (err) {
    errorHandler(err);
    return err.message;
  }
}
