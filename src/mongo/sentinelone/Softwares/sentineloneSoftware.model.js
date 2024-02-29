import  { model, Schema } from "mongoose";

const sentineloneSoftwareSchema = Schema(
  {
    company_id: String,
    agentComputerName: String,
    agentDomain: String,
    agentId: String,
    agentInfected: Boolean,
    agentIsActive: Boolean,
    agentIsDecommissioned: Boolean,
    agentMachineType: String,
    agentNetworkStatus: String,
    agentOperationalState: String,
    agentOsType: String,
    agentUuid: String,
    agentVersion: String,
    createdAt: String,
    id: String,
    installedAt: String,
    name: String,
    osType: String,
    publisher: String,
    riskLevel: String,
    signed: Boolean,
    size: Number,
    type: String,
    updatedAtOnSentinelone: String,
    version: String,
  },
  {
    timestamps: true,
  }
);

const sentineloneSoftwareModel = model(
  "sentinelone_software",
  sentineloneSoftwareSchema
);
export default sentineloneSoftwareModel;
