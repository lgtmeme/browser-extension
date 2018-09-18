// @flow
// @format

import {getCurrentRepo, getMemeRepoFor, doesRepoExist} from './github-fs';

// eslint-disable-next-line no-console
console.log("I'm an inline script");

const currentRepo = getCurrentRepo(window.location.pathname);
// eslint-disable-next-line no-console
console.log('current', currentRepo);

if (currentRepo) {
  const memeRepo = getMemeRepoFor(currentRepo);
  // eslint-disable-next-line no-console
  console.log('memeRepo', memeRepo);

  doesRepoExist(memeRepo).then(exists =>
    // eslint-disable-next-line no-console
    console.log('meme repo exists?', exists),
  );
}
