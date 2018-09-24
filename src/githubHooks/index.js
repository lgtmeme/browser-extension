// @flow
// @format

import registerHook from './registerHook';
import replaceMacrosOnSubmitHook from './replaceMacrosOnSubmitHook';
import replaceMacrosInPreviewHook from './replaceMacrosInPreviewHook';

export function setupGithubHooks(): void {
  registerHook(replaceMacrosOnSubmitHook);
  registerHook(replaceMacrosInPreviewHook);
}
