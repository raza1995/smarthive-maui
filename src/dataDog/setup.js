
require("dotenv").config();
const DdTracer = require("dd-trace");

const setupDataDog = () => {
  const tracer = DdTracer.tracer.init({
    logInjection: true,
    env: process.env.SERVER_LINK,
    profiling: true,
  });
  tracer.use("mysql");
  tracer.use("express");
  tracer.use("winston");
  tracer.use("mongoose");
};

export default setupDataDog;
