import companyModel from "../Companies/company.model";
import companyScoreHistoryModel from "./companyScoreHistory.model";

export const updateCompanyScoreHistory = async(company_id, risk_score) => {
    try {
        const fyndRiskScore = await companyModel.findOne({
            where: {id: company_id}
        }).then(async(company) => {
            if(company) {
                const history = await companyScoreHistoryModel.findOne({
                    where: {
                        company_id,
                        risk_score
                    },
                    raw: true,
                    nest: true
                })
                if(!history) {
                    await companyScoreHistoryModel.create({
                        company_id, risk_score
                    })
                }
                return true;
            }
        })
    } catch(err) {
        return err?.message;
    }
}