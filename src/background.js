// @flow
// @format

import {type Chrome} from './chrome';

// eslint-disable-next-line no-console
console.log("I'm a background script");

declare var chrome: Chrome;
chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {hostSuffix: 'github.com'},
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ]);
  });
});
