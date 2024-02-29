/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-destructuring */
import { roles } from "../../utils/constants";
import { getAllPermissions } from "../Permissions/permission.service";
import permissionsSQLModel from "../Permissions/permissions.model";
import roleHasPermissionsSQLModel from "../RoleHasPermissions/roleHasPermissions.model";
import rolesSQLModel from "../Roles/roles.model";
import userHasPermissionsSQLModel from "../UserHasPermissions/userHasPermissions.model";
import userRolesSQLModel from "../UserRoles/userRoles.model";

const magicalFunction = async (data, value, rolePermissions1) => {
  if (data?.length > 0) {
    data?.map(async (permission) => {
      const ob1 = permission;
      ob1.actions = ob1.actions?.map((action1) => {
        let finalAction = action1;
        if (typeof action1 === "object") {
          finalAction = Object.keys(action1)?.[0];
        }
        let object = {};
        const fyndPermission = rolePermissions1.filter(
          (itt) => itt.permission_id === ob1.id
        );
        if (fyndPermission) {
          const actions2 = fyndPermission?.[0]?.actions;
          const resultOfFilter = actions2?.filter(
            (action2) => Object.keys(action2)[0] === finalAction
          );
          object = resultOfFilter?.[0];
        } else {
          object[finalAction] = value;
        }
        return object;
      });
      await magicalFunction(permission.children, value, rolePermissions1);
      return ob1;
    });
  } else {
    return {};
  }
};

const updateDefaultPermissions = async (value, rolePermissions1) => {
  const permissions = await getAllPermissions();
  permissions?.map(async (permission) => {
    const ob1 = permission;
    ob1.actions = ob1.actions?.map((action1) => {
      let object = {};
      const fyndPermission = rolePermissions1.filter(
        (itt) => itt.permission_id === ob1.id
      );
      if (fyndPermission?.[0]) {
        const actions2 = fyndPermission?.[0]?.actions;
        actions2?.filter(
          (action2) => Object.keys(action2)?.[0] === object[action1]
        );
        object = actions2?.[0];
      } else {
        typeof action1 === "object"
          ? (object[Object.keys(action1)?.[0]] = value)
          : (object[action1] = value);
      }
      return object;
    });
    await magicalFunction(permission.children, value, rolePermissions1);
    return ob1;
  });

  return permissions;
}



export const getUserRoleAndPermissions = async (user, company_id = null, type = "company") => {
  try {    
    let permissions = null;
    const fyndRole = await userRolesSQLModel.findOne({
      where: {
        user_id: user.id
      },
      include: [
        {
          model: rolesSQLModel,
          where: {
            type
          },
          include: [
            {
              model: roleHasPermissionsSQLModel,
              include: [
                {
                  model: permissionsSQLModel,
                }
              ]
            }
          ]
        }
      ],
    })
    if (fyndRole && fyndRole?.role) {
      if (fyndRole?.role?.slug === 'custom') {
        permissions = await userHasPermissionsSQLModel.findAll({
          where: {
            user_id: user.id
          },
          include: [
            {
              model: permissionsSQLModel,
            }
          ]
        });

      } else if (company_id && (fyndRole?.role?.type === roles.Partner || fyndRole?.role?.type === roles.SuperAdmin)) {
        
        permissions = await roleHasPermissionsSQLModel.findAll({
          include: [
            {
              model: rolesSQLModel,
              where: {
                // company_id, slug: 'admin'
                company_id, slug: fyndRole?.role?.slug
                // type, company_id, slug: fyndRole?.role?.slug
              },
              required: true,
            },
            {
              model: permissionsSQLModel,
            }
          ]
        });
      } else {
        permissions = fyndRole?.role?.role_has_permissions;
      }
    }
    const permArray = []
    for await (const perm of permissions) {
      const object = {}
      object.id = perm?.permission_id
      object.slug = perm?.permission?.slug
      object.actions = perm.actions
      permArray.push(object)
    }
    // user_permissions: await updateDefaultPermissions(false, permissions)
    return {
      id: fyndRole?.role?.id,
      name: fyndRole?.role?.name,
      slug: fyndRole?.role?.slug,
      user_permissions: permArray
    }

  } catch (err) {
    return err.message;
  }
}