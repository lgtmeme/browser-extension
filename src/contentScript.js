// @flow
// @format

import nullthrows from 'nullthrows';

import {startSyncingMacros, insertUIOnEveryPageLoad} from './content';

import type {Chrome} from './chrome';

declare var chrome: Chrome;

function setupPageContextScript() {
  // We need to execute JS within the context of the page. The only way to do so
  // is to embed a <script> tag explicitly.
  // https://stackoverflow.com/questions/9602022/chrome-extension-retrieving-global-variable-from-webpage/9636008#9636008
  const pageContextScriptEl = document.createElement('script');
  pageContextScriptEl.src = chrome.extension.getURL(
    'pageContextScript.bundle.js',
  );
  pageContextScriptEl.onload = function onLoad() {
    this.remove();
  };
  nullthrows(document.head).appendChild(pageContextScriptEl);
}

setupPageContextScript();

startSyncingMacros();

insertUIOnEveryPageLoad();
