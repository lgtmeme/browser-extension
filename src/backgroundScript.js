// @flow
// @format

import type {Chrome} from './chrome';

import {originFromUrl, isOriginEnabled} from './background';

declare var chrome: Chrome;

chrome.runtime.onMessage.addListener((request: any, sender) => {
  if (request.action === 'injectContentScript') {
    (chrome: any).tabs.executeScript(sender.tab.id, {
      file: 'contentScript.bundle.js',
    });
  }
});

(chrome: any).tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const {url} = tab;
  if (url == null && changeInfo.status === 'complete') {
    return;
  }

  const origin = originFromUrl(url);
  if (!isOriginEnabled(origin)) {
    return;
  }

  (async () => {
    (chrome: any).tabs.executeScript(tabId, {
      file: 'contentScriptInject.bundle.js',
    });
  })();
});
