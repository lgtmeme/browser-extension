// @flow
// @format

import {getXPathNodes} from '../util/domUtil';

import type {Repo} from './types';
import {getRepoUrl} from './findRepo';

export function getFileUrl(repo: Repo, filepath: string): string {
  return `${getRepoUrl(
    repo,
  )}/blob/master/${filepath}?_pjax=%23js-repo-pjax-container`;
}

export class NotFoundError extends Error {}

export async function getFileContents(
  repo: Repo,
  filepath: string,
): Promise<string> {
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
  return lines.join('\n');
}
