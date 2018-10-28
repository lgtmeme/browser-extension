// @flow
// @format

import type {Macro} from '../fileFormat';

import {registerHookInFetch, registerHandlerInFormSubmit} from './registerHook';
import replaceMacrosOnSubmitHook from './replaceMacrosOnSubmitHook';
import replaceMacrosInPreviewHook from './replaceMacrosInPreviewHook';
import replaceMacrosInReviewFormHandler from './replaceMacrosInReviewFormHandler';

export function setupGithubHooks(getMacros: () => ?Array<Macro>): void {
  registerHookInFetch(replaceMacrosOnSubmitHook(getMacros));
  registerHookInFetch(replaceMacrosInPreviewHook(getMacros));

  registerHandlerInFormSubmit(replaceMacrosInReviewFormHandler(getMacros));
}
