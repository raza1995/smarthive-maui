import * as yup from "yup";

export const createHumanWeightageApiPayload = yup.object().shape({
  name: yup.string().required(),
  human_risks: yup.array(yup.string()),
  apply_on_all_human: yup.boolean().required(),
  linked_assets_weightage: yup.string().required(),
  security_awareness_weightage: yup.string().required(),
  pishing_weightage: yup.string().required(),
  mfa_weightage: yup.string().required(),
});

export const updateHumanScoreWeightagePriorityApiPayload = yup.object().shape({
  weightages: yup.array(
    yup
      .object()
      .shape({ id: yup.string().required(), priority: yup.string().required() })
  ).required(),
});
