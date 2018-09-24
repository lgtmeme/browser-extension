// @flow
// @format

// The purpose of this JS entry point is to have access to JS globals and be
// able to mutate them.

import {setupGithubHooks} from './githubHooks';
import {registerListener} from './rpc';

setupGithubHooks();

// eslint-disable-next-line no-console
registerListener(message => console.log(message));

// eslint-disable-next-line no-console
console.log("I'm an pageContext script");
