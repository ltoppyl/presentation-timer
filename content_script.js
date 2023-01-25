// --------------------
// Define Global Variables
const observerOptions = { attributes: true, childList: true };
let elementIds = {};
let passedPages = {};
let isFullScreen = false;
// --------------------

const textElementAnalysis = (element, j) => {
  if (!isFullScreen) {
    observer.disconnect();
    return;
  }

  const id = element.parentElement.parentElement.parentElement.parentElement.getAttribute("id");
  element.id = `${id}_${j}`;

  if (!element) return;

  element.innerHTML = new Date();

  elementIds[element.id] = setTimeout(function () {
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

  [...htmlCollection].forEach((element, j) => {
    if (0 < element.innerHTML.length) {
      textElementAnalysis(element, j);
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
      elementIds = {};
      passedPages = {};
    }
  }, 100);
});
