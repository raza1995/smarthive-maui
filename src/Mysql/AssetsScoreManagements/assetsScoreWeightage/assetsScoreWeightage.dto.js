import * as yup from "yup";

export const createAssetsScoreWeightageApiPayload = yup.object().shape({
  name: yup.string().required(),
  filter: yup.object().shape({
    tags: yup.array(yup.object()),
    locations: yup.array(yup.string()),
    asset_sub_types: yup.array(yup.string()),
  }),
  lifecycle_weightage: yup.string().required(),
  patching_weightage: yup.string().required(),
  endpoint_weightage: yup.string().required(),
  backup_weightage: yup.string().required(),
  realtime_weightage: yup.string().required(),
});

export const updateAssetsScoreWeightagePriorityApiPayload = yup.object().shape({
  weightages: yup.array(
    yup
      .object()
      .shape({ id: yup.string().required(), priority: yup.string().required() })
  ).required(),
});
