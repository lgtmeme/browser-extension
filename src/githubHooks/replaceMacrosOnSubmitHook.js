// @flow
// @format

import type {Macro} from '../fileFormat';

import type {GithubHook} from './registerHook';
import {cloneFormDataWithNewValue} from './util';
import {getMacroMarkdown} from './markdown';

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

    const URL_REGEX = /https:\/\/github.com\/[^/]+\/[^/]+\/issue_comments$/;
    if (!url.match(URL_REGEX)) {
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

      let newValue = value;
      macros.forEach(macro => {
        newValue = newValue.replace(
          new RegExp(`\\b${macro.name}\\b`, 'g'),
          getMacroMarkdown(macro),
        );
      });
      return newValue;
    });
    newParams.body = newFormData;
    return [url, newParams];
  };

  return replaceMacrosOnSubmitHook;
}
