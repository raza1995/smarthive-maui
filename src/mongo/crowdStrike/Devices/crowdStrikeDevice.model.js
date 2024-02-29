import { model, Schema } from "mongoose";

const crowdStrikeDeviceSchema = Schema(
  {
    company_id: String,
    device_id: String,
    cid: String,
    agent_load_flags: String,
    agent_local_time: String,
    agent_version: String,
    bios_manufacturer: String,
    bios_version: String,
    build_number: String,
    config_id_base: String,
    config_id_build: String,
    config_id_platform: String,
    cpu_signature: String,
    external_ip: String,
    mac_address: String,
    hostname: String,
    first_seen: String,
    last_seen: String,
    local_ip: String,
    machine_domain: String,
    major_version: String,
    minor_version: String,
    os_version: String,
    os_build: String,
    ou: [],
    platform_id: String,
    platform_name: String,
    policies: [
      {
        policy_type: String,
        policy_id: String,
        applied: Boolean,
        settings_hash: String,
        assigned_date: String,
        applied_date: String,
        rule_groups: [],
      },
    ],
    reduced_functionality_mode: String,
    device_policies: {
      prevention: Object,
      sensor_update: Object,
      device_control: Object,
      global_config: Object,
      remote_response: Object,
      firewall: Object,
    },
    groups: [],
    group_hash: String,
    product_type: String,
    product_type_desc: String,
    provision_status: String,
    serial_number: String,
    service_pack_major: String,
    service_pack_minor: String,
    pointer_size: String,
    site_name: String,
    status: String,
    system_manufacturer: String,
    system_product_name: String,
    tags: [],
    modified_timestamp: String,
    meta: Object,
    kernel_version: String,
  },
  {
    timestamps: true,
  }
);

const crowdStrikeDeviceModel = model(
  "crowd_strike_devices",
  crowdStrikeDeviceSchema
);
export default crowdStrikeDeviceModel;
