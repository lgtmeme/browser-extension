// @flow
// @format

// The purpose of this JS entry point is to have access to JS globals and be
// able to mutate them.

import {setupGithubHooks} from './githubHooks';
import type {Macro} from './fileFormat';
import {registerListener, sendMessage} from './rpc';
import addUrlChangeListener from './util/addUrlChangeListener';

let macros: ?Array<Macro> = null;
function setup() {
  // This has to be registered from the page context, since we mutate globals
  addUrlChangeListener(() => sendMessage({type: 'urlChanged'}));

  registerListener(message => {
    if (message.type === 'macrosUpdated') {
      macros = message.content;
    }
  });

  setupGithubHooks(() => macros);
}

setup();
