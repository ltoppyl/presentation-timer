// --------------------
// Define Global Variables
const observerOptions = { attributes: true, childList: true };
const stringPattern = /&lt;&lt;[+:-\d]+&gt;&gt;/;
let passedPages = {};
let isFullScreen = false;
let startTimeCountDown;
let startTimeCountUp;
// --------------------

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

  return conversionSecToString(distance);
};

const calCountDown = (timeString) => {
  const d = new Date();

  return "countDown!! " + timeString;
};

const textElementAnalysis = (element) => {
  if (!isFullScreen) {
    observer.disconnect();
    return;
  }

  if (!element || !element.innerHTML) return;

  if (!element.dataset.originalTime) {
    element.dataset.originalTime = element.innerHTML;
  }

  const originalTimeString = element.dataset.originalTime;

  if (!stringPattern.test(originalTimeString)) {
    return;
  }

  let direction = originalTimeString.match(/[+-]/);
  if (!direction) {
    return;
  }
  direction = direction[0];

  const timeString = originalTimeString
    .split(direction)
    .join("")
    .split("&lt;")
    .join("")
    .split("&gt;")
    .join("");

  // If timeString is not null at this point, all +- must be removed
  if (timeString) {
    if (/\+/.test(timeString) || /-/.test(timeString)) {
      return;
    }
  }

  let displayString;

  // If direction is +, expect timeString to be null since only <<+>> is supported
  if (direction === "+" && !timeString) {
    displayString = calCountUp();
  } else if (direction === "-" && timeString) {
    displayString = calCountDown(timeString);
  } else {
    return;
  }

  element.innerHTML = displayString;

  setTimeout(function () {
    textElementAnalysis(element);
  }, 100);
};

const pageInfoAnalysis = () => {
  let pageInfo;
  const iframe = document.querySelector("iframe.punch-present-iframe");

  if (!iframe) {
    return;
  }

  pageInfo = iframe.contentWindow.document.querySelector('[role="option"][aria-selected="true"]');

  // Delay to avoid pageInfo becoming undefined the first time
  if (!pageInfo) {
    setTimeout(pageInfoAnalysis, 500);
    return;
  }

  if (!(pageInfo.innerText in passedPages)) {
    observer.observe(pageInfo, observerOptions);
    passedPages[pageInfo.innerText] = true;
  }

  const htmlCollection = iframe.contentWindow.document.getElementsByTagName("text");

  if (htmlCollection.length == 0) {
    return;
  }

  [...htmlCollection].forEach((element, i) => {
    if (0 < element.innerHTML.length) {
      textElementAnalysis(element, i);
    }
  });
};

// --------------------
// MutationObserver()
// callback function to execute when mutations are observed
const callback = (mutations) => {
  for (const mutation in mutations) {
    pageInfoAnalysis();
  }
};

const observer = new MutationObserver(callback);
// --------------------

document.addEventListener("fullscreenchange", function () {
  setTimeout(function () {
    if (document.fullscreenElement) {
      console.log("Entered full screen mode.");
      observer.observe(document.documentElement, observerOptions);
      isFullScreen = true;
      pageInfoAnalysis();
    } else {
      console.log("Exited full screen mode.");
      startTimeCountDown = undefined;
      isFullScreen = false;
      passedPages = {};
    }
  }, 100);
});
