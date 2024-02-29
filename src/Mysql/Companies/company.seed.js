import { roles, superAdminId1, superAdminId2 } from "../../utils/constants";
import { superAdminUserSeed } from "../Users/user.seed";
import companyModel from "./company.model"

export const companySeed = async () => {
    // Creating a default company for super administrator
    // const id = "99999999-9999-9999-9999-999999999999";
    
    await companyModel.bulkCreate([
        {
            id: superAdminId1,
            company_name: "Super Admin",
            company_domain: "admin.com",
            industry_type: "Financial",   
            type: roles.SuperAdmin         
        }
    ],{ updateOnDuplicate: ["id","company_name","company_domain","industry_type","type"] });

    await companyModel.bulkCreate([
        {
            id: superAdminId2,
            company_name: "Sanjay Patel",
            company_domain: "admin1.com",
            industry_type: "Financial",   
            type: roles.SuperAdmin         
        }
    ],{ updateOnDuplicate: ["id","company_name","company_domain","industry_type","type"] });

    //  Create default Super admin user account
    await superAdminUserSeed(superAdminId1, "cc31ec85-3db4-433d-b0e6-2bc66bfb124d", process.env.SUPER_ADMIN_EMAIL, "1076562e-75b7-4fa3-9523-a0a626e47ae0", "Super Admin");
    await superAdminUserSeed(superAdminId2, "09bd01a5-6a09-4782-aab3-9a9f6cd14869", process.env.SUPER_ADMIN_EMAIL1, "d9e5ca94-698f-45f9-8f7d-036f33a4ec10", "Super Admin2");
}