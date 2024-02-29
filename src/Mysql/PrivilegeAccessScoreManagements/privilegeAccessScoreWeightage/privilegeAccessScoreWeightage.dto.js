import * as yup from "yup";

export const createPrivilegeAccessWeightageApiPayload = yup.object().shape({
  name: yup.string().required(),
  secrets_tags: yup.array(yup.object()),
  secrets_type: yup.array(yup.string()),
  apply_on_all_secrets: yup.boolean().required(),
  secrets_strength_weightage: yup.string().required(),
  secrets_upto_date_weightage: yup.string().required(),
  linked_assets_weightage: yup.string().required(),
  linked_humans_weightage: yup.string().required(),
});

export const updatePrivilegeAccessScoreWeightagePriorityApiPayload = yup.object().shape({
  weightages: yup.array(
    yup
      .object()
      .shape({ id: yup.string().required(), priority: yup.string().required() })
  ).required(),
});
