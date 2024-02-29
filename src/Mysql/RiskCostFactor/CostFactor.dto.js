import * as yup from "yup";

export const createRiskCostFactor = yup.object().shape({
  name: yup.string().required(),
  base_range_lower_bound: yup.string().required(),
  base_range_upper_bound: yup.string().required(),
  has_peak_time: yup.string().required(),
  // has_other_costs: yup.string().required(),
  peak_range_lower_bound: yup.string().when("has_peak_time", {
    is: "yes",
    then: yup.string().required(),
  }),
  peak_range_upper_bound: yup.string().when("has_peak_time", {
    is: "yes",
    then: yup.string().required(),
  }),
  // has_peak_all_days: yup.string().when("has_peak_time", {
  //   is: "yes",
  //   then: yup.string().required(),
  // }),
  peak_range_from_date: yup.string().when("has_peak_time", {
    is: "yes",
    then: yup.string().required(),
  }).nullable(),
  peak_range_to_date: yup.string().when("has_peak_time", {
    is: "yes",
    then: yup.string().required(),
  }).nullable(),
});

export const compareTagsPayloadSchema = yup.object().shape({
  tag_ids: yup.array(yup.string()).required(),
});

export const EditRiskCostFactorSchema = yup.object().shape({
  base_range_lower_bound: yup.string().required(),
  base_range_upper_bound: yup.string().required(),
  has_peak_time: yup.string().required(),
  peak_range_lower_bound: yup.string().when("has_peak_time", {
    is: "yes",
    then: yup.string().required(""),
  }),
  peak_range_upper_bound: yup.string().when("has_peak_time", {
    is: "yes",
    then: yup.string().required(""),
  }),
  // has_peak_all_days: yup.string().when("has_peak_time", {
  //   is: "yes",
  //   then: yup.string().required(),
  // }),
  peak_range_from_date: yup.string().when("has_peak_time", {
    is: "yes",
    then: yup.string().required(),
  }).nullable(),
  peak_range_to_date: yup.string().when("has_peak_time", {
    is: "yes",
    then: yup.string().required(),
  }).nullable(),
});

export const createRiskCostFactorAttribute = yup.object().shape({
  attribute_name: yup.string().required(),
  description: yup.string().required()
});

export const EditRiskCostFactorDowntimeProbabilitySchema = yup.object().shape({
  // modified_downtime_probability_time: yup.string().required(),
  // modified_downtime_probability_year: yup.string().required(),
});

export const updateRiskCostFactorPriorityPayloadSchema = yup.object().shape({
  risk_cost_factors: yup.array(yup.object()).required(),
});
