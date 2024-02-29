import { model, Schema } from "mongoose";

const macOsSchema = Schema({
  cycle: String,
  codename: String,
  release: String,
  eol: String || Boolean,
  link: String,
});

export const macOsModel = model("macos_versions", macOsSchema);
const WindowsOsSchema = Schema({
  cycle: String,
  cycleShortHand: String,
  release: String,
  support: String,
  eol: String,
});

export const windowsOsModel = model("windows_versions", WindowsOsSchema);
