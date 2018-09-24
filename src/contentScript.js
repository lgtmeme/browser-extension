// @flow
// @format

import nullthrows from 'nullthrows';

import {
  getCurrentRepo,
  getMemeRepoFor,
  doesRepoExist,
  getFileContents,
  // setFileContents,
} from './githubFs';

import {serializeMacrosToFile, deserializeMacrosFromFile} from './fileFormat';

import {sendMessage, registerListener} from './rpc';

import type {Chrome} from './chrome';

declare var chrome: Chrome;

// eslint-disable-next-line no-console
console.log("I'm a content script");

const currentRepo = getCurrentRepo(window.location.pathname);
// eslint-disable-next-line no-console
console.log('current', currentRepo);

if (currentRepo) {
  const memeRepo = getMemeRepoFor(currentRepo);
  // eslint-disable-next-line no-console
  console.log('memeRepo is', memeRepo);

  const testRepo = {owner: 'lgtmeme', name: 'test'};
  // eslint-disable-next-line no-console
  console.log('testRepo', testRepo);

  doesRepoExist(testRepo).then(exists => {
    // eslint-disable-next-line no-console
    console.log('test repo exists?', exists);

    if (exists) {
      getFileContents(testRepo, 'test.json').then(raw => {
        // eslint-disable-next-line no-console
        console.log('got some contents', raw);

        const deserialized = deserializeMacrosFromFile(raw);
        // eslint-disable-next-line no-console
        console.log('deserialized', deserialized);
        if (deserialized) {
          const {deserializedFile, content} = deserialized;

          const macros = content.slice(0);
          macros.push({
            name: `justright ${macros.length}`,
            url: 'google.com',
          });

          const serialized = serializeMacrosToFile(deserializedFile, macros);
          // eslint-disable-next-line no-console
          console.log('serialized', serialized);

          /*
          setFileContents(testRepo, 'test.json', _ => serialized).then(() => {
            // eslint-disable-next-line no-console
            console.log('saved');
          });
          */
        }
      });
    }
  });
}

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

setTimeout(() => {
  sendMessage({
    type: 'macrosUpdated',
    content: [{name: 'justright', url: 'derpurl'}],
  });
}, 1000);

// eslint-disable-next-line no-console
registerListener(message => console.log(message, document.location));
