import { Op } from "sequelize";
import { roles, userRole } from "../../utils/constants";
import userModel from "./users.model";
import companyModel from "../Companies/company.model";
// eslint-disable-next-line import/no-cycle
import {
  addEventLog,
  createEventPayload,
} from "../Logs/eventLogs/eventLogs.controller";
import {
  getUserActivity,
  userCreateActivity,
  userDeleteActivity,
  userUpdateActivity,
} from "../Logs/ActivitiesType/userActivities";
import { rolesSeed } from "../Roles/roles.seed";
import rolesSQLModel from "../Roles/roles.model";
import userRolesSQLModel from "../UserRoles/userRoles.model";
import roleHasPermissionsSQLModel from "../RoleHasPermissions/roleHasPermissions.model";
import userHasPermissionsSQLModel from "../UserHasPermissions/userHasPermissions.model";
import { errorHandler } from "../../utils/errorHandler";
import {createUserRole} from "../UserRoles/userRoles.service"
import userDetailsModel from "./userDetail.model";
import { globalRolesSeed } from "../Roles/globalRole.seed";

export const createUser = async (signUpDetails, client, userAssignedRole) => {
  try {
    console.log("in auth");
    const response = await userModel.create(signUpDetails);
    // create Roles for this company account
    
    if (userAssignedRole === roles.Partner) {
      if(signUpDetails?.role === 'admin') {
        // await globalRolesSeed(signUpDetails.company_id);
        // const fyndRole = await rolesSQLModel.findOne({
        //   where: {type: roles.Partner,slug: roles.Admin, company_id: signUpDetails.company_id},
        //   raw: true,
        //   nest: true
        // })
        // if(fyndRole) {
        //   await createUserRole(fyndRole?.id, signUpDetails.company_id, response.id)
        //   await userDetailsModel.create({
        //     user_id: response.id,
        //     ...signUpDetails
        //   })
        // }      
      }    
    }else {
      const fyndOldRoles = await rolesSQLModel.count({
        where: {
          company_id: signUpDetails.company_id,
        },
      });
      if (fyndOldRoles === 0) {
        await rolesSeed(signUpDetails.company_id);
      }
    }
    
    if (client) {
      await addEventLog(
        { ...client, user_id: response.id },
        userCreateActivity.status.userCreatedSuccessfully.code,
        createEventPayload(
          JSON.parse(JSON.stringify(response)),
          {},
          userModel.tableName
        )
      );
    }
    return Promise.resolve(response);
  } catch (err) {
    if (client) {
      await addEventLog(
        { ...client, user_id: null },
        userCreateActivity.status.userCreationFailed.code,
        null,
        err.message
      );
    }
    errorHandler(err);
    return Promise.reject(err);
  }
};

export const findUserByEmail = async (email, client) => {
  try {
    const user = await userModel.findOne({ 
      where: { email },
      include: {
        model: companyModel,
        attributes: ["company_name", "company_domain", "type"],
      }, 
    });

    if (client) {
      await addEventLog(
        { ...client, user_id: user?.id, company_id: user?.company_id },
        getUserActivity.status.userGetSuccessfully.code
      );
    }
    return Promise.resolve(user);
  } catch (err) {
    if (client) {
      await addEventLog(
        { ...client, user_id: null, company_id: null },
        getUserActivity.status.gettingUserFailed.code,
        null,
        err.message
      );
    }
    return Promise.reject(err);
  }
};
export const findUserByPhoneNumber = async (phone_number, client) => {
  try {
    const user = await userModel.findOne({
      where: { phone_number },
    });
    if (client) {
      await addEventLog(
        { ...client, user_id: user?.id, company_id: user?.company_id },
        getUserActivity.status.userGetSuccessfully.code
      );
    }
    return user;
  } catch (err) {
    if (client) {
      await addEventLog(
        { ...client, user_id: null, company_id: null },
        getUserActivity.status.gettingUserFailed.code,
        null,
        err.message
      );
    }
    return Promise.reject(err);
  }
};

export const findUserOAuthId = async (oAuth, client) => {
  try {
    const user = await userModel.findOne({
      where: { auth0_id: oAuth },
      include: {
        model: companyModel,
        attributes: ["company_name", "company_domain", "type"],
      },
      raw: true,
      nest: true
    });
    if (client) {
      await addEventLog(
        { ...client, user_id: user?.id },
        getUserActivity.status.userGetSuccessfully.code
      );
    }
    // console.log(user, "-------------- here is user auth0")
    return Promise.resolve(user);
  } catch (err) {
    if (client) {
      await addEventLog(
        { ...client, user_id: null },
        getUserActivity.status.gettingUserFailed.code,
        null,
        err.message
      );
    }
    return Promise.reject(err);
  }
};
export const findUserById = async (userId, client) => {
  try {
    const user = await userModel.findOne({ where: { id: userId } });
    if (client) {
      await addEventLog(
        { ...client, user_id: user?.id },
        getUserActivity.status.userGetSuccessfully.code
      );
    }
    return Promise.resolve(user);
  } catch (err) {
    if (client) {
      await addEventLog(
        { ...client, user_id: null },
        getUserActivity.status.gettingUserFailed.code,
        null,
        err.message
      );
    }
    return Promise.reject(err);
  }
};
export const saveUser = async (user, client) => {
  try {
    const response = await userModel.create(user);
    if (client) {
      await addEventLog(
        { ...client, user_id: response.id },
        userUpdateActivity.status.userUpdatedSuccessfully.code,
        createEventPayload(
          JSON.parse(JSON.stringify(response)),
          {},
          userModel.tableName
        )
      );
    }
    return Promise.resolve(response);
  } catch (err) {
    if (client) {
      await addEventLog(
        { ...client, user_id: null },
        getUserActivity.status.gettingUserFailed.code,
        null,
        err.message
      );
    }
    return Promise.reject(err);
  }
};
//
export const getUsers = async (
  filterObject,
  client,
  sort = null,
  sortColumn = "createdAt",
  role_id = null,
  page = 1,
  size = 10
) => {
  if (!filterObject) {
    filterObject = {};
  }
  if (!sort) {
    sort = "ASC";
  }
  let roleRequired = false;
  let whereRole = {};
  if (role_id) {
    roleRequired = true;
    whereRole = { role_id };
  }

  try {
    const response = await userModel.findAll({
      where: filterObject,
      include: [
        {
          model: companyModel,
          attributes: ["company_name", "company_domain"],
        },
        {
          model: userHasPermissionsSQLModel,
        },
        {
          model: userRolesSQLModel,
          where: whereRole,
          required: roleRequired,
          include: [
            {
              model: rolesSQLModel,
              include: [
                {
                  model: roleHasPermissionsSQLModel,
                },
              ],
            },
          ],
        },
      ],
      order: [[sortColumn, sort]],
      offset: (page - 1) * size,
      limit: +size,
    });
    if (client) {
      await addEventLog(
        { ...client, user_id: null },
        getUserActivity.status.userGetSuccessfully.code
      );
    }
    return Promise.resolve(response);
  } catch (err) {
    if (client) {
      await addEventLog(
        { ...client, user_id: null },
        getUserActivity.status.gettingUserFailed.code,
        null,
        err.message
      );
    }
    return Promise.reject(err);
  }
};

export const getUsersAndTotalCount = async (
  approved_by_customer_admin_status,
  company_id,
  queryFilter,
  client,
  page = 1,
  size = 10,
) => {

  let filter = {};
  if (queryFilter) {
    filter = JSON.parse(queryFilter);
  }
  const filterObj = {
    approved_by_customer_admin: approved_by_customer_admin_status,
  };
  let sort = "DESC";
  let sortColumn = "createdAt";
  let role_id = "";
  if (filter?.role) {
      role_id = filter?.role;
  }
  if (company_id) {
      filterObj.company_id = company_id;
  }
  if (filter?.sort) {
      sort = filter?.sort;
      sortColumn = "full_name";
  }
  if (filter?.status) {
      if (filter?.status === "active") {
      filterObj.is_active = true;
      } else {
      filterObj.is_active = false;
      }
  }
  if (filter?.search) {
      filterObj.full_name = { [Op.like]: `%${filter?.search}%` };
  }
  let roleRequired = false;
  let whereRole = {};
  if (role_id) {
    roleRequired = true;
    whereRole = { role_id };
  }
  try {
    const response = await userModel.findAll({
      where: filterObj,
      include: [
        {
          model: companyModel,
          attributes: ["company_name", "company_domain"],
        },
        {
          model: userHasPermissionsSQLModel,
        },
        {
          model: userRolesSQLModel,
          where: whereRole,
          required: roleRequired,
          include: [
            {
              model: rolesSQLModel,
              include: [
                {
                  model: roleHasPermissionsSQLModel,
                },
              ],
            },
          ],
        },
      ],
      order: [[sortColumn, sort]],
      offset: (page - 1) * size,
      limit: +size,
    });
    if (client) {
      await addEventLog(
        { ...client, user_id: null },
        getUserActivity.status.userGetSuccessfully.code
      );
    }
    const totalCount = await userModel
      .findAll({
        where: filterObj,
        include: [
          {
            model: companyModel,
            attributes: ["company_name", "company_domain"],
          },
          {
            model: userHasPermissionsSQLModel,
          },
          {
            model: userRolesSQLModel,
            where: whereRole,
            required: roleRequired,
            include: [
              {
                model: rolesSQLModel,
                include: [
                  {
                    model: roleHasPermissionsSQLModel,
                  },
                ],
              },
            ],
          },
        ],
      })
      .then((resul) => resul.length ?? 0);
    return Promise.resolve({users:response, totalCount});
  } catch (err) {
    if (client) {
      await addEventLog(
        { ...client, user_id: null },
        getUserActivity.status.gettingUserFailed.code,
        null,
        err.message
      );
    }
    return Promise.reject(err);
  }
};

// export const getPendingUsersAndTotalCount = async (
//   company_id,
//   queryFilter,
//   client,
//   page = 1,
//   size = 10,
// ) => {

//   let filter = {};
//   if (queryFilter) {
//     filter = JSON.parse(queryFilter);
//   }
//   const filterObj = {
//     approved_by_customer_admin: false,
//   };
//   let sort = "DESC";
//   let sortColumn = "createdAt";
//   let role_id = "";
//   if (filter?.role) {
//       role_id = filter?.role;
//   }
//   if (company_id) {
//       filterObj.company_id = company_id;
//   }
//   if (filter?.sort) {
//       sort = filter?.sort;
//       sortColumn = "full_name";
//   }
//   if (filter?.status) {
//       if (filter?.status === "active") {
//       filterObj.is_active = true;
//       } else {
//       filterObj.is_active = false;
//       }
//   }
//   if (filter?.search) {
//       filterObj.full_name = { [Op.like]: `%${filter?.search}%` };
//   }
//   let roleRequired = false;
//   let whereRole = {};
//   if (role_id) {
//     roleRequired = true;
//     whereRole = { role_id };
//   }
//   try {
//     const response = await userModel.findAll({
//       where: filterObj,
//       include: [
//         {
//           model: companyModel,
//           attributes: ["company_name", "company_domain"],
//         },
//         {
//           model: userHasPermissionsSQLModel,
//         },
//         {
//           model: userRolesSQLModel,
//           where: whereRole,
//           required: roleRequired,
//           include: [
//             {
//               model: rolesSQLModel,
//               include: [
//                 {
//                   model: roleHasPermissionsSQLModel,
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//       order: [[sortColumn, sort]],
//       offset: (page - 1) * size,
//       limit: +size,
//     });
//     if (client) {
//       await addEventLog(
//         { ...client, user_id: null },
//         getUserActivity.status.userGetSuccessfully.code
//       );
//     }
//     const totalCount = await userModel
//       .findAll({
//         where: filterObj,
//         include: [
//           {
//             model: companyModel,
//             attributes: ["company_name", "company_domain"],
//           },
//           {
//             model: userHasPermissionsSQLModel,
//           },
//           {
//             model: userRolesSQLModel,
//             where: whereRole,
//             required: roleRequired,
//             include: [
//               {
//                 model: rolesSQLModel,
//                 include: [
//                   {
//                     model: roleHasPermissionsSQLModel,
//                   },
//                 ],
//               },
//             ],
//           },
//         ],
//       })
//       .then((resul) => resul.length ?? 0);
//     return Promise.resolve({users:response, totalCount});
//   } catch (err) {
//     if (client) {
//       await addEventLog(
//         { ...client, user_id: null },
//         getUserActivity.status.gettingUserFailed.code,
//         null,
//         err.message
//       );
//     }
//     return Promise.reject(err);
//   }
// };

export const getAllUsersAndTotal = async (
  filterObject,
  page = 1,
  size = 10,
  sort = null,
) => {
  if (!filterObject) {
    filterObject = {};
  }
  const sortColumn = "full_name"
  if (!sort) {
    sort = "ASC";
  }
  
  let roleRequired = false;
  let whereRole = {};
  if(filterObject?.role_type) {
    roleRequired = true;
    whereRole = {type: filterObject.role_type, slug: roles.Admin}
    delete filterObject.role_type
  }
  try {

    const data = await userModel.findAll({
      where: filterObject,
      include: [
        {
          model: companyModel,
          attributes: ["company_name", "company_domain"],
        },
        {
          model: userRolesSQLModel,
          include: [
            {
              model: rolesSQLModel,
              where: whereRole,
              required: roleRequired,
            },
          ],
          attributes:[]
        },
      ],
      offset: (page - 1) * size,
      limit: +size,
      order: [[sortColumn, sort]],
    });

    const response = await userModel.findAll({
      where: filterObject,
      include: [
        {
          model: companyModel,
          attributes: ["company_name", "company_domain"],
        },
        {
          model: userRolesSQLModel,
          required: roleRequired,
          include: [
            {
              model: rolesSQLModel,
              where: whereRole,
              required: roleRequired,
            },
          ],
        },
      ],
    }).then(res => res.length ?? 0);
    return Promise.resolve({data, totalCount: response});
  } catch (err) {
    return Promise.reject(err);
  }
};

export const getUserByFilter = async (filterObject, client) => {
  if (!filterObject) {
    filterObject = {};
  }
  try {
    const response = await userModel.findOne({
      where: filterObject,
      include: {
        model: companyModel,
        attributes: ["company_name", "company_domain"],
      },
    });
    if (client) {
      await addEventLog(
        { ...client, user_id: response.id },
        getUserActivity.status.userGetSuccessfully.code
      );
    }
    return Promise.resolve(response);
  } catch (err) {
    if (client) {
      await addEventLog(
        { ...client, user_id: null },
        getUserActivity.status.gettingUserFailed.code,
        null,
        err.message
      );
    }
    return Promise.reject(err);
  }
};
export const updateUser = async (id, updateObj, client) => {
  try {
    const oldData = await userModel.findOne({
      where: {
        id,
      },
      raw: true,
      nest: false,
    });
    const response = await userModel.update(updateObj, {
      where: {
        id,
      },
    });
    const newData = await userModel.findOne({
      where: {
        id,
      },
      raw: true,
      nest: false,
    });
    if (client) {
      await addEventLog(
        { ...client, user_id: newData.id },
        userUpdateActivity.status.userUpdatedSuccessfully.code,
        createEventPayload(newData, oldData, userModel.tableName)
      );
    }
    return Promise.resolve(response);
  } catch (err) {
    if (client) {
      await addEventLog(
        { ...client, user_id: null },
        userUpdateActivity.status.userUpdatingFailed.code,
        null,
        err.message
      );
    }
    return Promise.reject(err);
  }
};

export const findUserByInviteCode = async (code, client) => {
  try {
    const response = await userModel.findOne({ where: { invite_code: code } });
    if (client) {
      await addEventLog(
        { ...client, user_id: response.id },
        getUserActivity.status.userGetSuccessfully.code
      );
    }
    return Promise.resolve(response);
  } catch (err) {
    if (client) {
      await addEventLog(
        { ...client, user_id: null },
        getUserActivity.status.gettingUserFailed.code,
        null,
        err.message
      );
    }
    return Promise.reject(err);
  }
};

export const deleteUser = async (id, client) => {
  try {
    const oldData = await userModel.findOne({
      where: {
        id,
      },
      raw: true,
      nest: false,
    });
    const response = await userModel.destroy({ where: { id } });
    if (client) {
      await addEventLog(
        { ...client, user_id: id },
        userDeleteActivity.status.userDeletedSuccessfully.code,
        createEventPayload({}, oldData, userModel.tableName)
      );
    }
    return Promise.resolve(response);
  } catch (error) {
    if (client) {
      await addEventLog(
        { ...client, user_id: null },
        userDeleteActivity.status.userDeletingFailed.code,
        null,
        error.message
      );
    }
    return Promise.reject(error);
  }
};

export const getAllCustomerAdmins = async (client) => {
  try {
    const admins = await userModel.findAll({
      where: { role: userRole.CUSTOMER_ADMIN },
    });
    if (client) {
      await addEventLog(
        { ...client, user_id: null },
        getUserActivity.status.userGetSuccessfully.code
      );
    }
    return Promise.resolve(admins);
  } catch (err) {
    errorHandler(err);
    if (client) {
      await addEventLog(
        { ...client, user_id: null },
        getUserActivity.status.gettingUserFailed.code,
        null,
        err.message
      );
    }
    return Promise.reject(err);
  }
};

const userService = {
  findUserByEmail,
  findUserByPhoneNumber,
  findUserOAuthId,
  findUserById,
  getUsers,
  updateUser,
  findUserByInviteCode,
  deleteUser,
  getUserByFilter,
  getAllCustomerAdmins,
  getUsersAndTotalCount,
};
export default userService;
