/**
 * Function that takes in a Time in ms and returns a String which represents the time in human readable format
 * @param {Number} milliseconds time in milliseconds
 * @param {Number} toDecimalPlace significant figure upto decimal places for ms. default: 3
 * @returns {String} time in human readable format in terms of days, hours, minutes, seconds and milliseconds
 */
function toHumanTime(milliseconds, toDecimalPlace = 3) {
  let millisecondsVar = milliseconds;
  if (millisecondsVar === 0) {
    return "0ms";
  }
  if (millisecondsVar === NaN) {
    return "NaN";
  }
  if (millisecondsVar === Infinity) {
    return "Infinity";
  }
  if (!millisecondsVar) {
    return "NaN";
  }

  const days = ~~(millisecondsVar / (24 * 60 * 60 * 1000));
  millisecondsVar %= 24 * 60 * 60 * 1000;

  const hours = ~~(millisecondsVar / (60 * 60 * 1000));
  millisecondsVar %= 60 * 60 * 1000;

  const minutes = ~~(millisecondsVar / (60 * 1000));
  millisecondsVar %= 60 * 1000;

  const seconds = ~~(millisecondsVar / 1000);
  millisecondsVar %= 1000;

  const ms = +millisecondsVar.toFixed(toDecimalPlace);

  let humanReadableString = "";

  humanReadableString += days > 0 ? `${days}day ` : "";
  humanReadableString += hours > 0 ? `${hours}hr ` : "";
  humanReadableString += minutes > 0 ? `${minutes}min ` : "";
  humanReadableString += seconds > 0 ? `${seconds}sec ` : "";
  humanReadableString += ms > 0 ? `${ms}ms ` : "";

  return humanReadableString;
}

module.exports.toHumanTime = toHumanTime;
