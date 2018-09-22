// @flow
// @format

import nullthrows from 'nullthrows';

import {getXPathNodes} from '../util/domUtil';

import type {Repo} from './types';
import {getRepoUrl} from './findRepo';

export function getFileUrl(repo: Repo, filepath: string): string {
  return `${getRepoUrl(
    repo,
  )}/blob/master/${filepath}?_pjax=%23js-repo-pjax-container`;
}

export class NotFoundError extends Error {}

export type GetFileResult = {
  editAuthenticityToken: string,
  contents: string,
};

export async function getFile(
  repo: Repo,
  filepath: string,
): Promise<GetFileResult> {
  const res = await fetch(getFileUrl(repo, filepath), {
    headers: {
      'X-PJAX': 'true',
      'X-PJAX-Container': '#js-repo-pjax-container',
    },
  });
  if (res.status === 404) {
    throw new NotFoundError();
  }
  if (res.status !== 200) {
    throw new Error(
      `Could not get file ${filepath} on repo ${getRepoUrl(repo)}`,
    );
  }
  const text = await res.text();
  const container = document.createElement('div');
  container.innerHTML = text;

  const codeLineEls = getXPathNodes(
    container,
    "//td[contains(@class, 'blob-code')]",
  );
  const lines = codeLineEls.map(el => el.innerText);
  const contents = lines.join('\n');

  const authTokenEls = getXPathNodes(
    container,
    "//form[contains(@class, 'js-update-url-with-hash')]/input[@name='authenticity_token']",
  );
  const editAuthenticityToken = nullthrows(
    authTokenEls[0].getAttribute('value'),
  );

  return {
    contents,
    editAuthenticityToken,
  };
}

export async function getFileContents(
  repo: Repo,
  filepath: string,
): Promise<string> {
  const getFileResults = await getFile(repo, filepath);
  return getFileResults.contents;
}
