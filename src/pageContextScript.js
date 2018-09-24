// @flow
// @format

// The purpose of this JS entry point is to have access to JS globals and be
// able to mutate them.

import {setupGithubHooks} from './githubHooks';
import {registerListener, sendMessage} from './rpc';
import addUrlChangeListener from './util/addUrlChangeListener';

function setup() {
  setupGithubHooks();

  // eslint-disable-next-line no-console
  registerListener(message => console.log(message));

  // This has to be registered from the page context, since we mutate globals
  addUrlChangeListener(() => sendMessage({type: 'urlChanged'}));
}

setup();

// eslint-disable-next-line no-console
console.log("I'm an pageContext script");
