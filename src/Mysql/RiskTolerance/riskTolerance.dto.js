import * as yup from "yup";

export const createRiskTolerancePayloadSchema = yup.object().shape({
  name: yup.string().required(),
  asset_type: yup.string().required(),
  tag_ids: yup.array(yup.string()).required(),
  settings: yup.array(yup.object()).required(),
});

export const compareTagsPayloadSchema = yup.object().shape({
  tag_ids: yup.array(yup.string()).required(),
});

export const editRiskTolerancePayloadSchema = yup.object().shape({
  name: yup.string().required(),
  asset_type: yup.string().required(),
  tag_ids: yup.array(yup.string()).required(),
  settings: yup.array(yup.object()).required(),
});

export const updateRiskTolerancePriorityPayloadSchema = yup.object().shape({
  tolerances: yup.array(yup.object()).required(),
});
