const ProgressBar = require("progress");
/**
 * A Basic CLI Progress bar to track progress in a long running job in a loop
 * @param {Number} currentStep the current iteration number in the loop. eg: i, index or count
 * @param {Number} totalSteps total number of steps that the loop will run for
 * @param {Date} startTime pass the start time of the loop. It should be a Date object. eg: 'new Date()'
 * @param {Number} clearScreenEvery console to be cleared off every ith iteration of this value. default: 1
 * @param {Number} barLength the length of the progress bar. default: 50
 * @param {Number} style choose styles from 0 - 4. default: 4
 * @param {Boolean} notify set true for sound alert notification when complete. default: false
 * @returns {Number} currentStep++
 */


let bar = new ProgressBar('  downloading [:bar] :rate/bps :percent :etas', {
  complete: '=',
  incomplete: ' ',
  width: 20,
  total: 10
});

function CliProgressBar(
  taskTitle,
  currentStep,
  totalSteps,
) {
  
  if (currentStep === 0) {
    console.log(taskTitle,totalSteps)
    bar = new ProgressBar('[:bar]:percent Complete, :step out of :total Done ', {
      complete: "\u2588",
      incomplete: "\u2591",
      width: 30,
      total: totalSteps
    });
  }
  currentStep++
  bar.tick({step:currentStep});

  if (currentStep === totalSteps) {
    console.log("Task Completed!!");
  }

  return currentStep;
}

module.exports.CliProgressBar = CliProgressBar;
