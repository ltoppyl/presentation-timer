// --------------------
// Define Global Variables
// g_passedPages = {
//   startTime: int,
//   totalTime: int,
// };
let g_passedPages = {};

let g_isFullScreen = false;
let g_startTimeCountDown = undefined;
let g_startTimeCountUp = undefined;
let g_lastIndex = undefined;
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
  if (!/^&lt;&lt;[+:-\w]+&gt;&gt;$/.test(originalTimeString)) {
    return;
  }

  const timeString = originalTimeString.split("&lt;").join("").split("&gt;").join("");
  if (!timeString) {
    return;
  }

  let displayString;

  if (timeString === "+") {
    displayString = calCountUp(); // src/calCountUp.js
  } else if (timeString === "time") {
    // Display of current time
    const d = new Date();
    displayString = `${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)}:${(
      "0" + d.getSeconds()
    ).slice(-2)}`;
  } else if (timeString === "today") {
    // Display Date
    const d = new Date();
    displayString = `${d.getFullYear()}/${("0" + (d.getMonth() + 1)).slice(-2)}/${(
      "0" + d.getDate()
    ).slice(-2)}`;
  } else {
    // In the following, only those consisting of ##:$$- (# and $ are numbers only) are supported
    if (timeString[timeString.length - 1] == "-" && (timeString.match(/-/g) || []).length === 1) {
      const timeStringRemoveMinus = timeString.slice(0, -1);
      if (/^\d{1,3}:\d{2}$/.test(timeStringRemoveMinus)) {
        displayString = calCountDown(timeStringRemoveMinus); // src/calCountDown.js
      } else {
        return;
      }
    } else {
      return;
    }
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
    observer.observe(pageInfo, observerOptions);
    const d = new Date();
    const now = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
    g_passedPages[pageInfo.innerText] = {
      startTime: now,
      totalTime: 0,
    };
  }

  // Detects when slides are switched
  if (g_lastIndex !== undefined) {
    if (g_lastIndex !== pageInfo.innerText) {
      calTotalTime(pageInfo.innerText); // src/calTotalTime.js
    }
  }

  g_lastIndex = pageInfo.innerText;

  const htmlCollection = iframe.contentWindow.document.getElementsByTagName("text");
  if (htmlCollection.length == 0) {
    setTimeout(pageInfoAnalysis, 500);
    return;
  }

  [...htmlCollection].forEach((element) => {
    if (0 < element.innerHTML.length) {
      textElementAnalysis(element);
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
const observerOptions = { attributes: true, childList: true };
// --------------------

document.addEventListener("fullscreenchange", function () {
  setTimeout(function () {
    if (document.fullscreenElement) {
      console.log("Entered full screen mode.");
      observer.observe(document.documentElement, observerOptions);
      g_isFullScreen = true;
      pageInfoAnalysis();
    } else {
      console.log("Exited full screen mode.");

      // Add time for the last open slide
      // After this g_passedPages is initialized, so the arguments are passed as appropriate
      calTotalTime(g_lastIndex); // src/calTotalTime.js

      // Creating String for Alert Output
      let displayAlertText = "";
      let totalTime = 0;
      let i = 0;
      for (const [key, value] of Object.entries(g_passedPages)) {
        totalTime += value.totalTime;
        if (i !== 0 && i % 5 == 0) {
          displayAlertText += `\n${("0" + key).slice(-2)} : ${conversionSecToString(
            value.totalTime
          )}     `;
        } else {
          displayAlertText += `${("0" + key).slice(-2)} : ${conversionSecToString(
            value.totalTime
          )}     `;
        }

        i += 1;
      }
      displayAlertText += `\n--------------------\nTotal Time: ${conversionSecToString(totalTime)}`;

      window.alert(displayAlertText);

      g_passedPages = {};
      g_isFullScreen = false;
      g_startTimeCountDown = undefined;
      g_startTimeCountUp = undefined;
      g_lastIndex = undefined;
    }
  }, 100);
});
