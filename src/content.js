// --------------------
// Define Global Variables
const g_observerOptions = { attributes: true, childList: true };
const g_stringPattern = /^&lt;&lt;[+:-\d]+&gt;&gt;$/;
let g_passedPages = {};
let g_isFullScreen = false;
let g_startTimeCountDown;
let g_startTimeCountUp;
// --------------------

const textElementAnalysis = (element) => {
  if (!g_isFullScreen) {
    observer.disconnect();
    return;
  }

  if (!element || !element.innerHTML) return;

  if (!element.dataset.originalTime) {
    element.dataset.originalTime = element.innerHTML;
  }

  const originalTimeString = element.dataset.originalTime;

  if (!g_stringPattern.test(originalTimeString)) {
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
    // src/calCountUp.js
    displayString = calCountUp();
  } else if (direction == "-" && timeString && /:/.test(timeString)) {
    // src/calCountDown.js
    displayString = calCountDown(timeString);
  } else {
    return;
  }

  // Probably not necessary, but just in case displayString exists.
  if (displayString) {
    element.innerHTML = displayString;
  }

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

  if (!(pageInfo.innerText in g_passedPages)) {
    observer.observe(pageInfo, g_observerOptions);
    g_passedPages[pageInfo.innerText] = true;
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
      observer.observe(document.documentElement, g_observerOptions);
      g_isFullScreen = true;
      pageInfoAnalysis();
    } else {
      console.log("Exited full screen mode.");
      g_startTimeCountDown = undefined;
      g_startTimeCountUp = undefined;
      g_isFullScreen = false;
      g_passedPages = {};
    }
  }, 100);
});
