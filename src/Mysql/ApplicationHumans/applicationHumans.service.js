import { Op } from "sequelize";
import { errorHandler } from "../../utils/errorHandler";
import humanSQLModel from "../Human/human.model";
import {
  humanApplicationLinkCreateActivity,
  humanApplicationLinkRemoveActivity,
} from "../Logs/ActivitiesType/humanActivities";
import { addEventLog } from "../Logs/eventLogs/eventLogs.controller";
import ApplicationHumansSQLModel from "./applicationHumans.model";

export const addHumansToApplication = async(humanIds, applicationData, company_id, clientDetails) => {
    try {

        const removedRelations = await ApplicationHumansSQLModel.findAll({
            where:{
                human_id: {
                    [Op.notIn]: humanIds
                },
                application_id: applicationData.id
            }
        })
        if (removedRelations.length > 0) {
            for await (const relation of removedRelations) {
                clientDetails.process = `Human removed from ${applicationData?.name}`
                clientDetails.target_id = relation.human_id
                clientDetails.company_id = company_id
                clientDetails.effected_table = humanSQLModel.tableName;
                await addEventLog(
                clientDetails,
                humanApplicationLinkRemoveActivity.status.humanApplicationUnAssignSuccessfully.code
                );
            }
        }

        await ApplicationHumansSQLModel.destroy({
            where:{
                company_id,
                application_id: applicationData.id
            }
        }).then(async(response) =>{
            if(humanIds.length > 0) {
                for await (const item of humanIds) {
                    const payload = {
                        human_id: item,
                        application_id: applicationData.id,
                        company_id,
                    };
                    await ApplicationHumansSQLModel.create(payload)
                    .then(async (res) => {                        
                        clientDetails.process = `Human linked to ${applicationData?.name}`
                        clientDetails.target_id = item
                        clientDetails.company_id = company_id
                        clientDetails.effected_table = humanSQLModel.tableName
                        await addEventLog(
                        clientDetails,
                        humanApplicationLinkCreateActivity.status.humanApplicationAssignSuccessfully.code
                        );
                    })
                    .catch((err) => {
                        errorHandler(err);
                    });
                }
            }        
            return true;    
        })
    }catch(e){
        errorHandler(e);
        return e.message;
    }
}