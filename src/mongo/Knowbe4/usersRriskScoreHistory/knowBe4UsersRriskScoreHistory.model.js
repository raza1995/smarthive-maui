import mongoose, { model, Schema } from "mongoose"

const usersRriskScoreHistorySchema = Schema(
  {
    user_id: Number,
    company_id: String,
    risk_score: Number,
    date: Date,
  },
  {
    timestamps: true,
  }
)

const usersRriskScoreHistoryModel = model(
  "know_be4_user_risk_score_history",
  usersRriskScoreHistorySchema
)
export default usersRriskScoreHistoryModel
