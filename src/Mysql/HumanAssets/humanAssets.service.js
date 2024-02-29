import { Op } from "sequelize";
import { integrationsNames } from "../../utils/constants";
import assetSQLModel from "../Assets/assets.model";
import humanSQLModel from "../Human/human.model"
import humanSourcesModel from "../HumanSource/humanSources.model"
import { humanAssetLinkCreateActivity, humanAssetLinkRemoveActivity } from "../Logs/ActivitiesType/humanActivities";
import { addEventLog } from "../Logs/eventLogs/eventLogs.controller";
import humanAssetsSQLModel from "./humanAssets.model";

export const createUpdateHumanAsset = async (human_id, asset_id, company_id, clientDetails = null) => {
    try {
        const fyndLastRecord = await humanAssetsSQLModel.findOne({
            where: {
                human_id,
                asset_id,
                company_id
            },
            raw: true,
            nest: true
        })
        if(!fyndLastRecord) {
            if(clientDetails) {
                const asset = await assetSQLModel.findOne({where:{id: asset_id}, attributes:["asset_name"]}) 
                clientDetails.process = `Human linked to ${asset?.asset_name}`
                await addEventLog(
                clientDetails,
                humanAssetLinkCreateActivity.status.humanAssetAssignSuccessfully.code
                );
            }            
            return await humanAssetsSQLModel.create({
                human_id,
                asset_id,
                company_id
            })
        }
    } catch (err) {
        return err.message
    }
}

export const deleteHumanAssetRelation = async(human_id, assetIds, clientDetails) => {
    try {
        for await (const asset_id of assetIds) {
            const asset = await assetSQLModel.findOne({where:{id: asset_id}, attributes:["asset_name"]});
            clientDetails.process = `Human linked to ${asset?.asset_name}`
            await addEventLog(
            clientDetails,
            humanAssetLinkRemoveActivity.status.humanAssetUnAssignSuccessfully.code
            );
        }
        await humanAssetsSQLModel.destroy({
            where: {
                human_id,
                asset_id: { [Op.in]: [assetIds] },
            },
        });
    } catch (err) {
        return err.message
    }
}

export const createHumanAssetRelation = async(asset, assetData) => {
    try {
        const fyndHumanSource = await humanSourcesModel.findOne({
            where: {
                human_source_id: assetData.user_id,
                sources_type: {[Op.in]: [integrationsNames.MICROSOFT]}
            },
            raw: true,
            nest: true
        })
        if(fyndHumanSource) {
            await createUpdateHumanAsset(fyndHumanSource.human_id, asset.id, asset.company_id)
        }
    } catch (err) {
        return err.message
    }
}

export const getHumanAssetRelations = async (human_id) => {
    try {
        const relationAssetIds = await humanAssetsSQLModel.findAll({
            where: {
                human_id
            },
            attributes: ["asset_id"]
        })
        return relationAssetIds
    } catch (err) {
        return err.message
    }
}