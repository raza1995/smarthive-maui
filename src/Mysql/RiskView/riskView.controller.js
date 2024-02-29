import { Op } from "sequelize";
import { errorHandler } from "../../utils/errorHandler";
import ApplicationAssetsSQLModel from "../ApplicationAssets/applicationAssets.model";
import ApplicationHumansSQLModel from "../ApplicationHumans/applicationHumans.model";
import ApplicationSQLModel from "../Applications/application.model";
import humanSQLModel from "../Human/human.model";
import humanRiskScoreModel from "../HumanRiskScores/humanRiskScore.model";
import secretsModel from "../secrets/secret.model";

export const overviewData = async (req, res) => {
    try {
        const {user} = req;
        const totalApplications = await ApplicationSQLModel.findAll({
            where:{
                company_id: user.company_id
            },
            attributes: ["risk_score"]
        });
        const totalApplicationsCount = totalApplications?.length;

        let riskScore = 0;
        for await (const application of totalApplications) {
            riskScore += application.risk_score;
        }

        const averageRiskScore = Math.round ( riskScore / totalApplicationsCount );

        const highRiskLevel = 540
        const totalRiskApplicationCount = await ApplicationSQLModel.count({
            where:{
                company_id: user.company_id,
                risk_score: {[Op.lte] : highRiskLevel}
            }
        });
        const totalSharedApplicationsCount = await ApplicationSQLModel.count({
            where:{
                company_id: user.company_id,
                is_shared_service: true,
            }
        });
        const totalRiskSharedApplicationsCount = await ApplicationSQLModel.count({
            where:{
                company_id: user.company_id,
                is_shared_service: true,
                risk_score: {[Op.lte] : highRiskLevel}
            }
        });
        const totalAssetsUsingApplication = await ApplicationAssetsSQLModel.findAll({
            where:{
                company_id: user.company_id
            }, attributes: ["asset_id"]
        }).then((resp) => resp.map((item) => item.asset_id));

        const totalAssetsUsingApplicationAtRisk = await ApplicationAssetsSQLModel.findAll({
            where:{
                company_id: user.company_id
            },
            include:[{
                model: ApplicationSQLModel,
                where: {
                    risk_score: {[Op.lte] : highRiskLevel}
                },
                required: true
            }],
            attributes: ["asset_id"]
        }).then((resp) => resp.map((item) => item.asset_id));
        
        const totalHumansUsingApplication = await ApplicationHumansSQLModel.findAll({
            where:{
                company_id: user.company_id
            }, attributes: ["human_id"]
        }).then((resp) => resp.map((item) => item.human_id));

        const totalHumansUsingApplicationAtRisk = await ApplicationHumansSQLModel.findAll({
            where:{
                company_id: user.company_id
            },
            include:[{
                model: humanSQLModel,
                required: true,
                include: [{
                    model: humanRiskScoreModel,
                    required: true,
                    where:{
                        risk_score: {[Op.lte] : highRiskLevel}
                    }
                }]
            }], 
            attributes: ["human_id"]
        }).then((resp) => resp.map((item) => item.human_id));

        const privilegeCount = await secretsModel.count({
            where:{
                company_id: user.company_id
            }
        })

        const privilegeAtRiskCount = await secretsModel.count({
            where:{
                company_id: user.company_id,
                secrets_score: {[Op.lte] : highRiskLevel}
            }
        })


        res.status(200).json({
            message: "Risk View Overview Details successfully",
            data: {
                totalApplicationsCount,
                totalRiskApplicationCount,
                totalSharedApplicationsCount,
                totalRiskSharedApplicationsCount,
                totalAssetsUsingApplication: totalAssetsUsingApplication?.length || 0,
                totalAssetsUsingApplicationAtRisk: totalAssetsUsingApplicationAtRisk?.length || 0,
                totalHumansUsingApplication: totalHumansUsingApplication?.length || 0,
                totalHumansUsingApplicationAtRisk: totalHumansUsingApplicationAtRisk?.length || 0,
                privilegeCount,
                privilegeAtRiskCount,
                riskScore,
                averageRiskScore
            },
        });

    } catch (err) {
        errorHandler(err)
        res.status(400).json({ err, message: err.message });  
    }
}