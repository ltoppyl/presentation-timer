const calCountDown = (timeString) => {
  const timeArray = timeString.split(":");

  // Only <<##:$$->> forms are supported
  if (timeArray.length !== 2) {
    return;
  }

  const countdownSec = 60 * timeArray[0] + timeArray[1];

  const d = new Date();

  if (!g_startTimeCountDown) {
    g_startTimeCountDown = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  }

  const now = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  let distance = countdownSec - (now - g_startTimeCountDown);

  if (distance < 0) {
    distance = 0;
  }

  // src/conversionSecToString.js
  return conversionSecToString(distance);
};
