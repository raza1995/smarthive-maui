import { UUIDV4 } from "sequelize";
import companyModel from "../Companies/company.model";
import riskCostFactorAttributesModel from "./riskCostFactorAttributes.model";

export const RiskCostFactorAttributesSeed = async(company_id) => {
    await riskCostFactorAttributesModel.bulkCreate([
        {   
            company_id,
            attribute_name: "Regulatory fines",
            description: "Select if these assets goes down then you might get penalized with some regulatory fines"
        },{   
            company_id,
            attribute_name: "Reputation Damage",
            description: "Select if these assets goes down then you might face some reputation damage"
        },{   
            company_id,
            attribute_name: "Legal",
            description: "Select if these assets goes down then you might get legal penalities"
        },
    ],{ updateOnDuplicate: ["company_id", "attribute_name"] });
}

// export const RiskCostFactorAttributesSeed = async() => {
//     const companies = await companyModel.findAll({ where: { type: "company" } });
//     if(companies.length){
//         for (const company of companies) {
//             const company_id = company.id;
//             await riskCostFactorAttributesModel.bulkCreate([
//                 {   
//                     company_id,
//                     attribute_name: "Regulatory fines",
//                     description: "Select if these assets goes down then you might get penalized with some regulatory fines"
//                 },{   
//                     company_id,
//                     attribute_name: "Reputation Damage",
//                     description: "Select if these assets goes down then you might face some reputation damage"
//                 },{   
//                     company_id,
//                     attribute_name: "Legal",
//                     description: "Select if these assets goes down then you might get legal penalities"
//                 },
//             ],{ updateOnDuplicate: ["company_id", "attribute_name"] });
//         }
//     }
// }