let forwardTimes: number[] = [];

const NEEDLE = 250;
let statsNeedle = 0;
function PrecisionRound(num: number, prec = 2) {
  const f = Math.pow(10, prec);
  return Math.floor(num * f) / f;
}
export const updateTimeStats = (timeInMs: number) => {
  statsNeedle++;
  forwardTimes = [timeInMs]
    .concat(forwardTimes)
    .slice(0, 30);
  const avgTimeInMs =
    forwardTimes.reduce((total, t) => total + t) /
    forwardTimes.length;

  if (statsNeedle < NEEDLE) {
    statsNeedle++;
  } else {
    statsNeedle = 0;
    console.log({
      time: `${Math.round(avgTimeInMs)} ms`,
      fps: `${PrecisionRound(1000 / avgTimeInMs)}`,
    });
  }
};
