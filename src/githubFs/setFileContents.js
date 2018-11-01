// @flow
// @format

import nullthrows from 'nullthrows';

import {getXPathNodes} from '../util/domUtil';

import type {Repo} from './types';
import {getRepoUrl} from './findRepo';
import {getFile} from './getFileContents';

function editFileUrl(repo: Repo, filepath: string): string {
  return `${getRepoUrl(repo)}/edit/master/${filepath}`;
}

function saveFileUrl(repo: Repo, filepath: string): string {
  return `${getRepoUrl(repo)}/tree-save/master/${filepath}`;
}

export async function setFileContents(
  repo: Repo,
  filepath: string,
  getNewContents: (oldContents: string) => string,
): Promise<void> {
  // There are three steps to updating a file.

  // 1. Load the page itself and fetch the auth token

  const {editAuthenticityToken, contents} = await getFile(repo, filepath);

  // 2. Load the edit-file page with the auth token. This gives the commit hash
  //    and a new auth token.

  const editPageParams = new URLSearchParams();
  editPageParams.set('utf', '\u2713');
  editPageParams.set('authenticity_token', editAuthenticityToken);
  const editPageUrl = editFileUrl(repo, filepath);
  const editPageRes = await fetch(editPageUrl, {
    method: 'POST',
    body: editPageParams,
  });

  if (editPageRes.status !== 200) {
    throw new Error(
      `Could not load edit page for ${filepath} on ${getRepoUrl(repo)}`,
    );
  }
  const editPageContents = await editPageRes.text();
  const editPageContainer = document.createElement('div');
  editPageContainer.innerHTML = editPageContents;

  const commitHashEls = getXPathNodes(
    editPageContainer,
    "//input[@class='js-commit-oid']",
  );
  const commitHash = nullthrows(commitHashEls[0].getAttribute('value'));

  const authorEmailEls = getXPathNodes(
    editPageContainer,
    "//select[@name='author_email']/option[@selected]",
  );
  let authorEmail = null;
  if (authorEmailEls.length > 0) {
    authorEmail = nullthrows(authorEmailEls[0].getAttribute('value'));
  }

  const saveAuthTokenEls = getXPathNodes(
    editPageContainer,
    "//form[@class='js-blob-form']/input[@name='authenticity_token']",
  );
  const saveAuthToken = nullthrows(saveAuthTokenEls[0].getAttribute('value'));

  // 3. Commit the edit with the new auth token.
  const saveParams = new URLSearchParams();
  saveParams.set('utf', '\u2713');
  saveParams.set('authenticity_token', saveAuthToken);
  saveParams.set('filename', filepath);
  saveParams.set('new_filename', filepath);
  saveParams.set('commit', commitHash);
  saveParams.set('same_repo', '1');
  saveParams.set('pr', '');
  saveParams.set('content_changed', 'true');
  saveParams.set('value', getNewContents(contents));
  saveParams.set('message', '');
  saveParams.set('placeholder_message', `Update ${filepath}`);
  saveParams.set('description', '');
  if (authorEmail) {
    saveParams.set('author_email', authorEmail);
  }
  saveParams.set('commit-choice', 'direct');
  saveParams.set('target_branch', 'master');
  saveParams.set('quick_pull', '');
  const saveRes = await fetch(saveFileUrl(repo, filepath), {
    method: 'POST',
    body: saveParams,
    referrer: editPageUrl,
  });
  if (saveRes.status !== 200) {
    throw new Error(`Failed to save ${filepath}`);
  }
}
