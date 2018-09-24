// @flow
// @format

import type {Repo} from './types';

const MEME_REPO_NAME = 'lgtmemes';

export function getRepoUrl(repo: Repo): string {
  return `/${repo.owner}/${repo.name}`;
}

export function getCurrentRepo(path: string): ?Repo {
  const beforeQuestion = path.split('?')[0];
  const slashSplit = beforeQuestion.split('/');
  if (slashSplit.length < 3) {
    return null;
  }
  return {
    owner: slashSplit[1],
    name: slashSplit[2],
  };
}

export function getMemeRepoFor(currentRepo: Repo): Repo {
  return {
    owner: currentRepo.owner,
    name: MEME_REPO_NAME,
  };
}

export function getMemeRepoForOwner(owner: string): Repo {
  return {
    owner,
    name: MEME_REPO_NAME,
  };
}

export async function doesRepoExist(repo: Repo): Promise<boolean> {
  const res = await fetch(getRepoUrl(repo), {
    method: 'HEAD',
  });
  return res.status === 200;
}
