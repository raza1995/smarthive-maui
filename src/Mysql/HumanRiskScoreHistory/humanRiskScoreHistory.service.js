import { errorHandler } from "../../utils/errorHandler";
import humanRiskScoreModel from "../HumanRiskScores/humanRiskScore.model";
import humanRiskScoreHistoryModel from "./humanRiskScoreHistory.model";

const createScoreHistory = async(payload) => {
    try{
        await humanRiskScoreHistoryModel.create(payload).catch(err => errorHandler(err))
    } catch(err){
        return err?.message;
    }
}

export const createHumanRiskScoreHistory = async(company_id, human_id, payload) => {
    try {
        const fyndRiskScore = await humanRiskScoreModel.findOne({
            where: {
                company_id,
                human_id
            }
        }).then(async(riskScore) => {
            if(riskScore) {
                const fyndOldHistory = await humanRiskScoreHistoryModel.findOne({
                    where: {
                        company_id, human_id
                    },
                    order: [["updatedAt", "DESC"]]
                })
                if(fyndOldHistory) {
                    let column_effected = "";
                    if(fyndOldHistory?.security_awareness !== payload.security_awareness) {
                        column_effected = "security_awareness"
                        payload.column_effected = column_effected
                        await createScoreHistory(payload)
                    }
                    if(fyndOldHistory?.pishing !== payload.pishing) {
                        column_effected = "pishing"
                        payload.column_effected = column_effected
                        await createScoreHistory(payload)
                    }
                    if(fyndOldHistory?.asset !== payload.asset) {
                        column_effected = "asset"
                        payload.column_effected = column_effected
                        await createScoreHistory(payload)
                    }
                    if(fyndOldHistory?.mfa !== payload.mfa) {
                        column_effected = "mfa"
                        payload.column_effected = column_effected
                        await createScoreHistory(payload)
                    }
                } else {
                    await humanRiskScoreHistoryModel.create(payload).catch(err => errorHandler(err))
                }
            }
        })
    } catch(err) {
        return err?.message;
    }
}

