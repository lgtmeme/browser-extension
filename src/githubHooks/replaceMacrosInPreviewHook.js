// @flow
// @format

import type {Macro} from '../fileFormat';

import type {GithubHook} from './registerHook';
import {cloneFormDataWithNewValue, cloneRequestWithNewFormData} from './util';
import {getMacroMarkdown} from './markdown';

export default function createHook(getMacros: () => ?Array<Macro>): GithubHook {
  const replaceMacrosInPreviewHook: GithubHook = async function replaceMacrosInPreviewHook(
    args: Array<mixed>,
  ): Promise<?Array<mixed>> {
    if (args.length !== 1) {
      return null;
    }
    const req = args[0];
    if (!(req instanceof Request)) {
      return null;
    }
    const URL_REGEX = /https:\/\/github.com\/preview\?markdown_unsupported=false&repository=[\d]+&subject=[\d]+&subject_type=Issue/;
    if (!req.url.match(URL_REGEX)) {
      return null;
    }

    const newReq = await cloneRequestWithNewFormData(req, formData =>
      cloneFormDataWithNewValue(formData, (key, value) => {
        if (key !== 'text') {
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
      }),
    );
    return [newReq];
  };

  return replaceMacrosInPreviewHook;
}
