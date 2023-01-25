const calCountUp = () => {
  const d = new Date();

  if (!startTimeCountUp) {
    startTimeCountUp = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  }

  const now = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  let distance = now - startTimeCountUp;

  // Support only when the date is shifted by one day, such as when crossing a date.
  if (distance < 0) {
    distance = 86400 + distance;
  }

  // src/conversionSecToString.js
  return conversionSecToString(distance);
};
