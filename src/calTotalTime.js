const calTotalTime = (index) => {
  const d = new Date();
  const now = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  let distance = now - g_passedPages[g_lastIndex].startTime;

  // Support only when the date is shifted by one day, such as when crossing a date.
  if (distance < 0) {
    distance = 86400 + distance;
  }

  g_passedPages[g_lastIndex].totalTime += distance;
  g_passedPages[g_lastIndex].startTime = undefined;
  g_passedPages[index].startTime = now;
};
