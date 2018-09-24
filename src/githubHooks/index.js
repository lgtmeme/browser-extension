// @flow
// @format

import type {Macro} from '../fileFormat';

import registerHook from './registerHook';
import replaceMacrosOnSubmitHook from './replaceMacrosOnSubmitHook';
import replaceMacrosInPreviewHook from './replaceMacrosInPreviewHook';

export function setupGithubHooks(getMacros: () => ?Array<Macro>): void {
  registerHook(replaceMacrosOnSubmitHook(getMacros));
  registerHook(replaceMacrosInPreviewHook);
}
