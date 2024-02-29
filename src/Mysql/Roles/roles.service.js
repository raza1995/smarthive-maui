import { Op } from "sequelize"
import permissionsSQLModel from "../Permissions/permissions.model"
import roleHasPermissionsSQLModel from "../RoleHasPermissions/roleHasPermissions.model"
import rolesSQLModel from "./roles.model"

export const getRoles = async (company_id, type = 'company', sortColumn = 'name',sort = 'asc', slug = []) => {
    const filter = {
        company_id,
        slug: {[Op.notIn]: ['custom']},
    }
    if(slug.length){
        filter.slug = {[Op.in]: slug}
    }
    if(type) {
        filter.type = type
    }
    const roles = await rolesSQLModel.findAll({
        where:filter,
        include: [
            {
                model: roleHasPermissionsSQLModel,
                include: [
                    {
                        model: permissionsSQLModel
                    }
                ]
            }
        ],
        order: [
            [sortColumn, sort],
        ]
    })
    return roles
}

export const findRoleBySlug = async (slug, company_id, type) => {
    try {
      const response = await rolesSQLModel.findOne({ where: { slug, company_id, type } });
      return Promise.resolve(response);
    } catch (err) {
      return Promise.reject(err);
    }
}