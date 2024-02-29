import mongoose, { model, Schema } from "mongoose"

const microsoftUsersSchema = Schema(
  {
    id: String,
    company_id:String,
    businessPhones: [],
    displayName: String,
    givenName: String,
    jobTitle: String,
    mail: String,
    mobilePhone: String,
    officeLocation: String,
    preferredLanguage: String,
    surname: String,
    userPrincipalName: String,    
  },
  {
    timestamps: true,
  }
)

const microsoftUsersModel = model("microsoft_users", microsoftUsersSchema)
export default microsoftUsersModel
