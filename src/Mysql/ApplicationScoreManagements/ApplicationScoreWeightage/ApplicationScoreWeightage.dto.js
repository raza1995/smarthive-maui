import * as yup from "yup";

export const createApplicationWeightageApiPayload = yup.object().shape({
  name: yup.string().required(),
  application_ids: yup.array(yup.object()),
  apply_on_all_application: yup.boolean().required(),
  linked_assets_weightage: yup.string().required(),
  linked_humans_weightage: yup.string().required(),
});

export const updateApplicationScoreWeightagePriorityApiPayload = yup.object().shape({
  weightages: yup.array(
    yup
      .object()
      .shape({ id: yup.string().required(), priority: yup.string().required() })
  ).required(),
});
