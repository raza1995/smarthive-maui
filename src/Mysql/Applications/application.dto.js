import * as yup from "yup";

export const createApplicationApiPayload = yup.object().shape({
  asset_ids: yup.array(yup.string()).required(),
  description: yup.string().required(),
  human_ids: yup.array(yup.string()).required(),
  is_shared_service: yup.boolean().required(),
  is_using_other_services: yup.boolean().required(),
  name: yup.string().required(),
});

export const updateApplicationApiPayload = yup.object().shape({
  description: yup.string().required(),
  name: yup.string().required(),
});
