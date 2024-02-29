import mongoose, { model, Schema } from "mongoose"

const groupsRriskScoreHistorySchema = Schema(
  {
    group_id: Number,
    company_id: String,
    risk_score: Number,
    date: Date,
  },
  {
    timestamps: true,
  }
)

const groupsRriskScoreHistoryModel = model(
  "know_be4_group_risk_score_history",
  groupsRriskScoreHistorySchema
)
export default groupsRriskScoreHistoryModel
