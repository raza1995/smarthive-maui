import mongoose, { model, Schema } from "mongoose";

const automoxServerGroup = Schema(
  {
    id: String,
    company_id: String,
    organization_id: String,
    name: String,
    refresh_interval: String,
    parent_server_group_id: String,
    ui_color: String,
    notes: String,
    enable_os_auto_update: Boolean,
    server_count: String,
    wsus_config: {
      id: String,
      server_group_id: String,
      is_managed: Boolean,
      server_url: String,
      created_at: Date,
      updated_at: Date,
    },
    policies: [],
  },
  {
    timestamps: true,
  }
);

const automoxServerGroupModel = model(
  "automox_Server_groups",
  automoxServerGroup
);
export default automoxServerGroupModel;
