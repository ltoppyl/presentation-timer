const conversionSecToString = (sec) => {
  const hour = Math.floor(sec / 3600);
  const minutes = Math.floor((sec - hour * 3600) / 60);
  const seconds = sec - hour * 3600 - minutes * 60;

  if (0 < hour) {
    return `${hour}:${("0" + minutes).slice(-2)}:${("0" + seconds).slice(-2)}`;
  } else {
    return `${("0" + minutes).slice(-2)}:${("0" + seconds).slice(-2)}`;
  }
};
