import { Op } from "sequelize";
import roleHasPermissionsSQLModel from "../RoleHasPermissions/roleHasPermissions.model";
import rolesSQLModel from "../Roles/roles.model";
import permissionsSQLModel from "./permissions.model";
import companyModel from "../Companies/company.model";
import { roles as rolesConstants } from "../../utils/constants";

export const createRolePermissions = async (company_id, type) => {
        const roles = await rolesSQLModel.findAll({
            where: {
                company_id,
                type
            }
        })
        const permissions = await permissionsSQLModel.findAll({
            where: {
                type
            }
        });
        roles.map(async(role) => {
            if(role.slug === "admin") {
                await roleHasPermissionsSQLModel.destroy({
                    where:{
                        role_id: role.id
                    }
                })   
                permissions.forEach(async (permission) => {
                    const actions = permission?.actions.map((action) => {
                        const object = {}
                        object[action] = true;
                        return object
                    })                             
                    await roleHasPermissionsSQLModel.create({
                        permission_id: permission.id,
                        role_id: role.id,
                        actions
                    })
                })
            } else if(role.slug === "analyst") {
                await roleHasPermissionsSQLModel.destroy({
                    where:{
                        role_id: role.id
                    }
                })   
                permissions.forEach(async (permission) => {
                    const actions = permission?.actions.map((action) => {
                        const object = {}
                        if(action === 'view') {
                            object[action] = true;
                        }else {
                            object[action] = false;
                        }
                        return object
                    })                
                    await roleHasPermissionsSQLModel.create({
                        permission_id: permission.id,
                        role_id: role.id,
                        actions
                    })
                })
            } else if(role.slug === "compliance") {
                return true;
            }
        })
        
}

export const getAllPermissions = async (type = "company") => {
    const permissions = await permissionsSQLModel.findAll({
        where: {
            parent_id: null,
            type
        },
        include: [
            {
                model: permissionsSQLModel,
                as: "children",
                attributes:["id", "module_name", "actions", "parent_id"],
                include: [
                    {
                        model: permissionsSQLModel,
                        as: "children",
                        attributes:["id", "module_name", "actions", "parent_id"],                    
                        include: [
                            {
                                model: permissionsSQLModel,
                                as: "children",
                                attributes:["id", "module_name", "actions", "parent_id"],
                                include: [
                                    {
                                        model: permissionsSQLModel,
                                        as: "children",
                                        attributes:["id", "module_name", "actions", "parent_id"],
                                    }
                                ]
                            },
                        ]
                    },
                ]
            }
        ],
        attributes:["id", "module_name", "actions", "parent_id"]
    })
    return permissions;
}

export const updateOldPermissions = async () => {
    const companies = await companyModel.findAll({
        attributes:["id"], raw: true, nest: true
    });
    for await (const company of companies) {
        console.log("company", company.id)
        await createRolePermissions(company.id, "company")
        await createRolePermissions(company.id, rolesConstants.Partner)
        await createRolePermissions(company.id, rolesConstants.SuperAdmin)
    }
}