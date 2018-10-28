// @flow
// @format

import type {Macro} from '../fileFormat';
import {getXPathNodes} from '../util/domUtil';

import {replaceWithMacros} from './markdown';
import type {GithubFormHandler} from './registerHook';

export default function createHandler(
  getMacros: () => ?Array<Macro>,
): GithubFormHandler {
  const replaceMacrosInReviewFormHandler: GithubFormHandler = function replaceMacrosInReviewFormHandler(
    form: HTMLFormElement,
  ): void {
    const PR_REVIEW_FORM_ACTION_REGEX = /^https?:\/\/[^/]+\/[^/]+\/[^/]+\/pull\/\d+\/reviews$/;
    const CREATE_PR_FORM_ACTION_REGEX = /^https?:\/\/[^/]+\/[^/]+\/[^/]+\/pull\/create\?/;
    if (
      !form.action.match(PR_REVIEW_FORM_ACTION_REGEX) &&
      !form.action.match(CREATE_PR_FORM_ACTION_REGEX)
    ) {
      return;
    }

    const textarea = getXPathNodes(
      form,
      '//textarea[@name="pull_request_review[body]" or @name="pull_request[body]"]',
    )[0];
    if (!(textarea instanceof HTMLTextAreaElement)) {
      return;
    }

    const macros = getMacros();
    if (!macros || macros.length === 0) {
      return;
    }

    const newValue = replaceWithMacros(textarea.value, macros);
    if (newValue !== textarea.value) {
      textarea.value = newValue;
    }
  };

  return replaceMacrosInReviewFormHandler;
}
