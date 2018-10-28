// @flow
// @format

import type {Macro} from '../fileFormat';
import {replaceWithMacros} from '../util/markdown';

import type {GithubHook} from './registerHook';
import {cloneFormDataWithNewValue} from './util';

export default function createHook(getMacros: () => ?Array<Macro>): GithubHook {
  const replaceMacrosOnSubmitHook: GithubHook = async function replaceMacrosOnSubmitHook(
    args: Array<mixed>,
  ): Promise<?Array<mixed>> {
    if (args.length !== 2) {
      return null;
    }
    const url = args[0];
    const params = args[1];
    if (
      typeof url !== 'string' ||
      params == null ||
      typeof params !== 'object'
    ) {
      return null;
    }

    const ISSUE_COMMENT_URL_REGEX = /https?:\/\/[^/]+\/[^/]+\/[^/]+\/issue_comments$/;
    const PULL_COMMENT_URL_REGEX = /https?:\/\/[^/]+\/[^/]+\/[^/]+\/pull\/\d+\/comment$/;
    const PULL_INLINE_COMMENT_URL_REGEX = /https?:\/\/[^/]+\/[^/]+\/[^/]+\/pull\/\d+\/review_comment\/create$/;
    if (
      !url.match(ISSUE_COMMENT_URL_REGEX) &&
      !url.match(PULL_COMMENT_URL_REGEX) &&
      !url.match(PULL_INLINE_COMMENT_URL_REGEX)
    ) {
      return null;
    }

    const oldFormData = params.body;
    if (!(oldFormData instanceof window.FormData)) {
      return null;
    }

    const newParams = {...params};
    const newFormData = cloneFormDataWithNewValue(oldFormData, (key, value) => {
      if (key !== 'comment[body]') {
        return null;
      }

      const macros = getMacros();
      if (!macros || macros.length === 0) {
        return null;
      }

      return replaceWithMacros(value, macros);
    });
    newParams.body = newFormData;
    return [url, newParams];
  };

  return replaceMacrosOnSubmitHook;
}
