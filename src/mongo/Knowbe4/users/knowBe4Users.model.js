import mongoose, { model, Schema } from "mongoose"

const knowBe4UsersSchema = Schema(
  {
    id: Number,
    company_id:String,
    employee_number: Number,
    first_name: String,
    last_name: String,
    job_title: String,
    email: String,
    phish_prone_percentage: Number,
    phone_number: Number,
    extension: String,
    mobile_phone_number: Number,
    location: String,
    division: String,
    manager_name: String,
    manager_email: String,
    provisioning_managed: Boolean,
    provisioning_guid: String,
    groups: [],
    current_risk_score: Number,
    aliases: [],
    joined_on: Date,
    last_sign_in: Date,
    status: String,
    organization: String,
    department: String,
    language: String,
    comment: String,
    employee_start_date: Date,
    archived_at: Date,
    custom_field_1: String,
    custom_field_2: String,
    custom_field_3: String,
    custom_field_4: String,
    custom_date_1: Date,
    custom_date_2: Date,
  },
  {
    timestamps: true,
  }
)

const knowBe4UsersModel = model("know_be4_users", knowBe4UsersSchema)
export default knowBe4UsersModel
