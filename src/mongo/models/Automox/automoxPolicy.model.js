import mongoose, { model, Schema } from "mongoose";

const automoxPoliciesList = Schema(
  {
    id: String,
    company_id: String,
    organization_id: String,
    name: String,
    policy_type_name: String,
    configuration: Object,
    schedule_days: Number,
    schedule_weeks_of_month: Number,
    schedule_months: Number,
    schedule_time: String,
    notes: String,
    create_time: String,
    server_groups: [],
    server_count: Number,
    status: String,
  },
  {
    timestamps: true,
  }
);

const automoxPolicyListModel = model(
  "automox_policies_list",
  automoxPoliciesList
);
export default automoxPolicyListModel;
