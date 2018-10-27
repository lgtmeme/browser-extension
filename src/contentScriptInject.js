// @flow
// @format

declare var chrome: any;

// We want to dynamically inject contentScript.js when the page matches certain
// URLs. But the background script doesn't know if a script has been injected on
// a newly loaded page already - when pages use history.pushState, to the
// background script, it looks like a new page reload but all scripts are
// still loaded. This makes sure contentScripts are not loaded more than once.
function inject() {
  if (window.isInjected) {
    return;
  }

  chrome.runtime.sendMessage({action: 'injectContentScript'});

  window.isInjected = true;
}

inject();
