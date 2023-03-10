const calCountDown = (timeString) => {
  const timeArray = timeString.split(":");

  // Only <<##:$$->> forms are supported
  if (timeArray.length !== 2) {
    return;
  }

  const countdownSec = 60 * Number(timeArray[0]) + Number(timeArray[1]);

  const d = new Date();

  if (!(timeString in g_startTimeCountDown)) {
    g_startTimeCountDown[timeString] = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  }

  const now = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  let distance = countdownSec - (now - g_startTimeCountDown[timeString]);

  if (distance < 0) {
    distance = 0;
  }

  // src/conversionSecToString.js
  return conversionSecToString(distance);
};
