// @flow
// @format

import type {Macro} from '../fileFormat';
import {replaceWithMacros} from '../util/markdown';

import type {GithubHook} from './registerHook';
import {cloneFormDataWithNewValue, cloneRequestWithNewFormData} from './util';

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
    const URL_REGEX = /https?:\/\/[^/]+\/preview\?markdown_unsupported=false&repository=[\d]+&subject=[\d]+&subject_type=(Issue|PullRequest)/;
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

        return replaceWithMacros(value, macros);
      }),
    );
    return [newReq];
  };

  return replaceMacrosInPreviewHook;
}
