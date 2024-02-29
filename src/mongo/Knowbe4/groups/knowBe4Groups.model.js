import mongoose, { model, Schema } from "mongoose"

const knowBe4GroupsSchema = Schema(
  {
    id: Number,
    company_id:String,
    name: String,
    group_type: String,
    provisioning_guid: String,
    member_count: Number,
    current_risk_score: Number,
    status: String,
  },
  {
    timestamps: true,
  }
)

const knowBe4GroupsModel = model("know_be4_groups", knowBe4GroupsSchema)
export default knowBe4GroupsModel
