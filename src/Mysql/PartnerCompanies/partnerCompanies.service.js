import moment from "moment";
import sequelize, { Op } from "sequelize";
import { humansRiskTypes, integrationCategoryType } from "../../utils/constants";
import { errorHandler } from "../../utils/errorHandler"
import ApplicationSQLModel from "../Applications/application.model";
import assetSQLModel from "../Assets/assets.model";
import { getSourceValidation } from "../Assets/assets.service";
import AssetScoreSQLModel from "../AssetScores/assetScore.model";
import assetSourcesModel from "../AssetSources/assetSources.model";
import companyModel from "../Companies/company.model";
import companyScoreHistoryModel from "../CompanyScoreHistory/companyScoreHistory.model";
import { countHumansOnRisk } from "../Human/human.service";
import { getCompanyIntegrationIds } from "../Integration/integration.service";
import secretsModel from "../secrets/secret.model";
import userModel from "../Users/users.model";
import partnerCompanySQLModel from "./partnerCompanies.model";

export const createPartnerCompanyRelation  = async (company_id, user_id, user_company_id) => {
    try {
        const fyndLastRelation = await partnerCompanySQLModel.count({
            where: { company_id, user_id, user_company_id}
        })
        if(fyndLastRelation === 0) {
            await partnerCompanySQLModel.create({
                company_id, user_id, user_company_id
            })
        }
        return true; 
    } catch (err) {
        errorHandler(err);
    }
}

export const getPartnerCompanies = async (user, page = 1, size = 4) => {
    try {   
        const filterObj = {};
        filterObj[Op.or] = [
            { user_company_id: user.company_id, company_id: { [Op.ne]: user.company_id } },
            { company_id: user.company_id, user_id: user.id, user_company_id: user.company_id  },
        ]; 
        const fyndPartnerCompanies = await partnerCompanySQLModel.findAll({
            // where: {
            //     user_company_id: user.company_id,
                // company_id: {
                //     [Op.ne]: user.company_id
                // }
            // },
            where: filterObj, 
            include:[
                {
                    model: companyModel,
                    include: [
                        {
                            model: userModel,
                            attributes: []
                        },
                        {
                            model: companyScoreHistoryModel,
                            where:{
                                createdAt: {
                                    [Op.gte]: moment().subtract(7, 'days').toDate()
                                }
                            },
                            required: false,
                            attributes: ["risk_score","createdAt"]
                        },
                    ],
                    attributes:
                    [                        
                        "id",
                        "company_name",
                        "company_domain",
                        "industry_type",
                        "address",
                        "company_score",
                        [
                            sequelize.literal(
                                `(SELECT COUNT(id) FROM users WHERE users.company_id = company.id)`
                            ),
                            "user_count",
                        ],                        
                    ]
                }
            ],
            offset: (page - 1) * size,
            limit: +size,
        }).then(result => result.map((data) => data?.company));
        
        const finalData = await Promise.all(fyndPartnerCompanies.map(async (company) =>{
            const data = JSON.parse(JSON.stringify(company));
            const SourceValidation = await getSourceValidation(company.id, []);
            const query = {company_id: company.id}
            data.total_assets = await assetSQLModel.findAll({
                where: query,
                include: [
                    SourceValidation,
                ],
            }).then(result => result?.length || 0);
            data.total_risk_assets = await assetSQLModel.findAll({
                where: query,
                include: [
                    SourceValidation,
                    {
                        model: AssetScoreSQLModel,
                        where:{
                            risk_score: { [Op.lte]: 540 }
                        }
                    }
                ],
            }).then(result => result?.length || 0);
            return data
        }))
        return finalData
    } catch (err) {
        errorHandler(err);
        return err.message;
    }
}

// export const getTotalPartnerCompanies = async (user) => {
//     const fyndPartnerCompanies = await partnerCompanySQLModel.count({
//         where: {
//             user_company_id: user.company_id
//         },
//         include:[
//             {
//                 model: companyModel,
//                 required: true
//             }
//         ],
//     })
//     return fyndPartnerCompanies
// }

export const getTotalPartnerCompanies = async (filterObject) => {
    const fyndPartnerCompanies = await partnerCompanySQLModel.count({
        where: filterObject,
        include:[
            {
                model: companyModel,
                required: true
            }
        ],
    })
    return fyndPartnerCompanies
}

export const getTotalPartnerLowRiskCompanies = async (user) => {
    const fyndPartnerCompanies = await partnerCompanySQLModel.count({
        where: {
            user_company_id: user.company_id,
            company_id: { 
                [Op.ne]: user.company_id 
            }
        },
        include:[
            {
                model: companyModel,
                required: true,
                where: {
                    company_score: {[Op.gte]: 720}
                }
            }
        ],
    })
    return fyndPartnerCompanies
}

export const getTotalPartnerHighRiskCompanies = async (user) => {
    const fyndPartnerCompanies = await partnerCompanySQLModel.count({
        where: {
            user_company_id: user.company_id,
            company_id: { 
                [Op.ne]: user.company_id 
            }
        },
        include:[
            {
                model: companyModel,
                required: true,
                where: {
                    company_score: {[Op.lte]: 520},
                }
            }
        ],
    })
    return fyndPartnerCompanies
}

export const getTotalPartnerMediumRiskCompanies = async (user) => {
    const fyndPartnerCompanies = await partnerCompanySQLModel.count({
        where: {
            user_company_id: user.company_id,
            company_id: { 
                [Op.ne]: user.company_id 
            }
        },
        include:[
            {
                model: companyModel,
                required: true,
                where: {
                    company_score: {$between: [520, 720]}
                }
            }
        ],
    })
    return fyndPartnerCompanies
}

export const findPartnerCompanyById = async (company_id, user) => {
    try {
        const fyndCompany = await companyModel.findOne({
        where: {
                id: company_id
            },
            include: [
                {
                    model: partnerCompanySQLModel,
                    where: {
                        user_company_id : user.company_id,
                    },
                    required: true,
                    // attributes:[]
                }
            ],
            // attributes: ["id"]
        });
        return fyndCompany
    } catch(err) {
        errorHandler(err);
        return err.message;
    }
}

export const deleteCompanyById = async (company, user) => {
    try {
        await companyModel.destroy({
            where: {
                id: company.id
            },
            include: [
                {
                    model: partnerCompanySQLModel,
                    where: {
                        user_company_id: user.company_id,
                        company_id: company.id
                    },
                    required: true,
                }
            ],
        });
    } catch(err) {
        errorHandler(err);
        return err.message;
    }
}

export const getCompanyAllAssetsData = async (company_id) => {
    try {
        const SourceValidation = await getSourceValidation(company_id, []);
        const totalCount = await assetSQLModel
        .findAndCountAll({
            where: { company_id },
            include: [SourceValidation],
        }).then((resp) => resp.rows.length);
        
        const assetsAtHighRisk = await assetSQLModel
        .findAndCountAll({
            where: { "$asset_score.risk_score$": { [Op.lte]: 540 } },
            include: [AssetScoreSQLModel, SourceValidation],
        }).then((resp) => resp.rows.length);

        const assetsAtMediumRisk = await assetSQLModel
        .findAndCountAll({
            where: {
            [Op.and]: [
                { "$asset_score.risk_score$": { [Op.gt]: 540 } },
                { "$asset_score.risk_score$": { [Op.lte]: 700 } },
            ],
            },
            include: [AssetScoreSQLModel, SourceValidation],
        }).then((resp) => resp.rows.length);

        const assetsAtLowRisk = await assetSQLModel
        .findAndCountAll({
            where: { "$asset_score.risk_score$": { [Op.gt]: 700 } },
            include: [AssetScoreSQLModel, SourceValidation],
        }).then((resp) => resp.rows.length);

        return {
            total: totalCount,
            high_risk: assetsAtHighRisk,
            medium_risk: assetsAtMediumRisk,
            low_risk: assetsAtLowRisk
        }
    }catch(err) {
        errorHandler(err);
        return err.message;
    }
}

export const getCompanyAllEndpointsData = async(company_id) => {
    try {
        const integrationIds = await getCompanyIntegrationIds(company_id,integrationCategoryType.endpoint);
        const SourceValidation = await getSourceValidation(company_id, []);
        const totalEndpoints = await assetSQLModel.findAndCountAll({
            where: {company_id},
            include: [
                {
                    model: assetSourcesModel,
                    where: {
                        integration_id: { [Op.in]: integrationIds },
                    },
                    required: true,
                },
            ],
        }).then((resp) => resp.rows.length);
        const endpointsAtLowRisk = await assetSQLModel.findAndCountAll({
            where: { company_id, "$asset_score.risk_score$": { [Op.gt]: 700 } },
            // include: [AssetScoreSQLModel, SourceValidation],
            include: [{
                model: assetSourcesModel,
                where: {
                    integration_id: { [Op.in]: integrationIds },
                },
                required: true,
            },AssetScoreSQLModel],
        }).then((resp) => resp.rows.length);

        const endpointsAtMediumRisk = await assetSQLModel.findAndCountAll({
            where: {
                company_id,
                [Op.and]: [
                    { "$asset_score.risk_score$": { [Op.gt]: 540 } },
                    { "$asset_score.risk_score$": { [Op.lte]: 700 } },
                ],
            },
            // include: [AssetScoreSQLModel, SourceValidation],
            include: [{
                model: assetSourcesModel,
                where: {
                    integration_id: { [Op.in]: integrationIds },
                },
                required: true,
            },AssetScoreSQLModel],
        }).then((resp) => resp.rows.length);

        const endpointsAtHighRisk = await assetSQLModel
        .findAndCountAll({
            where: { company_id, "$asset_score.risk_score$": { [Op.lte]: 540 } },
            // include: [AssetScoreSQLModel, SourceValidation],
            include: [{
                model: assetSourcesModel,
                where: {
                    integration_id: { [Op.in]: integrationIds },
                },
                required: true,
            },AssetScoreSQLModel],
        }).then((resp) => resp.rows.length);

        return {
            total: totalEndpoints,
            high_risk: endpointsAtHighRisk,
            medium_risk: endpointsAtMediumRisk,
            low_risk: endpointsAtLowRisk
        }
    } catch(err) {
        errorHandler(err);
        return err.message;
    }
}

export const getCompanyAllHumansData = async (company_id) => {
    try {
        const totalUsers = await countHumansOnRisk(
            { company_id },
            null
        );
        const highRiskUsers = await countHumansOnRisk(
            { company_id },
            humansRiskTypes.high
        );
        const mediumRiskUsers = await countHumansOnRisk(
            { company_id },
            humansRiskTypes.medium
        );
        const lowRiskUsers = await countHumansOnRisk(
            { company_id },
            humansRiskTypes.low
        );
        return {
            total: totalUsers,
            high_risk: highRiskUsers,
            medium_risk: mediumRiskUsers,
            low_risk: lowRiskUsers
        }
    } catch(err) {
        errorHandler(err);
        return err.message;
    }
}

export const getCompanyAllApplicationsData = async (company_id) => {
    try {
        const totalApplications = await ApplicationSQLModel.findAndCountAll({
            where: {company_id}            
        }).then((resp) => resp.rows.length);
        const applicationsAtLowRisk = await ApplicationSQLModel.findAndCountAll({
            where: { company_id, risk_score: { [Op.gt]: 700 } },
        }).then((resp) => resp.rows.length);

        const applicationsAtMediumRisk = await ApplicationSQLModel.findAndCountAll({
            where: {
                company_id,
                [Op.and]: [
                    { risk_score: { [Op.gt]: 540 } },
                    { risk_score: { [Op.lte]: 700 } },
                ],
            },
        }).then((resp) => resp.rows.length);

        const applicationsAtHighRisk = await ApplicationSQLModel
        .findAndCountAll({
            where: { company_id, risk_score: { [Op.lte]: 540 } },
        }).then((resp) => resp.rows.length);

        return {
            total: totalApplications,
            low_risk: applicationsAtLowRisk,
            medium_risk: applicationsAtMediumRisk,
            high_risk: applicationsAtHighRisk
        }
    }catch(err) {
        errorHandler(err);
        return err.message;
    }
}

export const getCompanyAllSecretsData = async (company_id) => {
    try {
        const totalSecrets = await secretsModel.findAndCountAll({
            where: {company_id}            
        }).then((resp) => resp.rows.length);
        const secretsAtLowRisk = await secretsModel.findAndCountAll({
            where: { company_id, secrets_score: { [Op.gt]: 700 } },
        }).then((resp) => resp.rows.length);

        const secretsAtMediumRisk = await secretsModel.findAndCountAll({
            where: {
                company_id,
                [Op.and]: [
                    { secrets_score: { [Op.gt]: 540 } },
                    { secrets_score: { [Op.lte]: 700 } },
                ],
            },
        }).then((resp) => resp.rows.length);

        const secretsAtHighRisk = await secretsModel
        .findAndCountAll({
            where: { company_id, secrets_score: { [Op.lte]: 540 } },
        }).then((resp) => resp.rows.length);

        return {
            total: totalSecrets,
            low_risk: secretsAtLowRisk,
            medium_risk: secretsAtMediumRisk,
            high_risk: secretsAtHighRisk
        }
    } catch (err) {
        errorHandler(err);
        return err.message;
    }
}