import companyModel from "../Companies/company.model";
import downtimeProbabilitySQLModel from "./downtimeProbability.model";

export const DowntimeProbabilitySeed = async(company_id) => {
    // const companies = await companyModel.findAll({ where: { type: "company" } });
    // if(companies.length){
    //     for (const company of companies) {
            await downtimeProbabilitySQLModel.bulkCreate([
                {   
                    company_id,
                    asset_type: "Servers",
                    category: "Compliant",
                    default_downtime_probability_time: 1,
                    default_downtime_probability_year: 2,
                    modified_downtime_probability_time: 5,
                    modified_downtime_probability_year: 1,
                },{   
                    company_id,
                    asset_type: "Servers",
                    category: "End of Life",
                    default_downtime_probability_time: 5,
                    default_downtime_probability_year: 1,
                },{   
                    company_id,
                    asset_type: "Workstations",
                    category: "Compliant",
                    default_downtime_probability_time: 5,
                    default_downtime_probability_year: 1,
                    modified_downtime_probability_time: 1,
                    modified_downtime_probability_year: 10,
                },{   
                    company_id,
                    asset_type: "Workstations",
                    category: "End of Life",
                    default_downtime_probability_time: 5,
                    default_downtime_probability_year: 1,
                },{   
                    company_id,
                    asset_type: "Routers",
                    category: "Compliant",
                    default_downtime_probability_time: 5,
                    default_downtime_probability_year: 1,
                    modified_downtime_probability_time: 1,
                    modified_downtime_probability_year: 10,
                },{   
                    company_id,
                    asset_type: "Routers",
                    category: "End of Life",
                    default_downtime_probability_time: 3,
                    default_downtime_probability_year: 1,
                    modified_downtime_probability_time: 1,
                    modified_downtime_probability_year: 10,
                },{   
                    company_id,
                    asset_type: "Firewall",
                    category: "Compliant",
                    default_downtime_probability_time: 5,
                    default_downtime_probability_year: 1,
                },{   
                    company_id,
                    asset_type: "Firewall",
                    category: "End of Life",
                    default_downtime_probability_time: 3,
                    default_downtime_probability_year: 1,
                    modified_downtime_probability_time: 1,
                    modified_downtime_probability_year: 10,
                },
            ],{ updateOnDuplicate: ["company_id", "asset_type", "category", "default_downtime_probability_time", "default_downtime_probability_year", "modified_downtime_probability_time", "modified_downtime_probability_year"] });
    //     }
    // }
}

// export const DowntimeProbabilitySeed = async() => {
//     const companies = await companyModel.findAll({ where: { type: "company" } });
//     if(companies.length){
//         for (const company of companies) {
//             console.log("downtime probability seed created");
//             const company_id = company.id;
//             await downtimeProbabilitySQLModel.bulkCreate([
//                 {   
//                     company_id,
//                     asset_type: "Servers",
//                     category: "Compliant",
//                     default_downtime_probability_time: 1,
//                     default_downtime_probability_year: 2,
//                     modified_downtime_probability_time: 5,
//                     modified_downtime_probability_year: 1,
//                 },{   
//                     company_id,
//                     asset_type: "Servers",
//                     category: "End of Life",
//                     default_downtime_probability_time: 5,
//                     default_downtime_probability_year: 1,
//                 },{   
//                     company_id,
//                     asset_type: "Workstations",
//                     category: "Compliant",
//                     default_downtime_probability_time: 5,
//                     default_downtime_probability_year: 1,
//                     modified_downtime_probability_time: 1,
//                     modified_downtime_probability_year: 10,
//                 },{   
//                     company_id,
//                     asset_type: "Workstations",
//                     category: "End of Life",
//                     default_downtime_probability_time: 5,
//                     default_downtime_probability_year: 1,
//                 },{   
//                     company_id,
//                     asset_type: "Routers",
//                     category: "Compliant",
//                     default_downtime_probability_time: 5,
//                     default_downtime_probability_year: 1,
//                     modified_downtime_probability_time: 1,
//                     modified_downtime_probability_year: 10,
//                 },{   
//                     company_id,
//                     asset_type: "Routers",
//                     category: "End of Life",
//                     default_downtime_probability_time: 3,
//                     default_downtime_probability_year: 1,
//                     modified_downtime_probability_time: 1,
//                     modified_downtime_probability_year: 10,
//                 },{   
//                     company_id,
//                     asset_type: "Firewall",
//                     category: "Compliant",
//                     default_downtime_probability_time: 5,
//                     default_downtime_probability_year: 1,
//                 },{   
//                     company_id,
//                     asset_type: "Firewall",
//                     category: "End of Life",
//                     default_downtime_probability_time: 3,
//                     default_downtime_probability_year: 1,
//                     modified_downtime_probability_time: 1,
//                     modified_downtime_probability_year: 10,
//                 },
//             ],{ updateOnDuplicate: ["company_id", "asset_type", "category", "default_downtime_probability_time", "default_downtime_probability_year", "modified_downtime_probability_time", "modified_downtime_probability_year"] });
//         }
//     }
// }