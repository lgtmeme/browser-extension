// @flow
// @format

import type {GithubHook} from './registerHook';
import {cloneFormDataWithNewValue, cloneRequestWithNewFormData} from './util';

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
      if (key === 'text') {
        return value.replace(/\bhello\b/g, 'herro');
      }
      return null;
    }),
  );
  return [newReq];
};

export default replaceMacrosInPreviewHook;
