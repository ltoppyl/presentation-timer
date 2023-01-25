// --------------------
// Define Global Variables
const observerOptions = { attributes: true, childList: true };
let passedPages = {};
let isFullScreen = false;
// --------------------

const characterAnalysis = () => {
  return true;
};

const textElementAnalysis = (element) => {
  if (!isFullScreen) {
    observer.disconnect();
    return;
  }

  if (!element) return;

  // ここで <<>> と一致するかの判定をする

  if (!element.dataset.originalTime) {
    element.dataset.originalTime = element.innerHTML;
  }

  const originalTime = element.dataset.originalTime;
  console.log(originalTime, element.dataset);

  element.innerHTML = new Date();

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

  // delay to avoid pageInfo becoming undefined the first time
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
      isFullScreen = false;
      passedPages = {};
    }
  }, 100);
});
