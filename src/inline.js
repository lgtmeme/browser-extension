// @flow
// @format

import {
  getCurrentRepo,
  getMemeRepoFor,
  doesRepoExist,
  getFileContents,
  setFileContents,
} from './github-fs';

// eslint-disable-next-line no-console
console.log("I'm an inline script");

const currentRepo = getCurrentRepo(window.location.pathname);
// eslint-disable-next-line no-console
console.log('current', currentRepo);

if (currentRepo) {
  const memeRepo = getMemeRepoFor(currentRepo);
  // eslint-disable-next-line no-console
  console.log('memeRepo is', memeRepo);

  const testRepo = {owner: 'lgtmeme', name: 'test'};
  // eslint-disable-next-line no-console
  console.log('testRepo', testRepo);

  doesRepoExist(testRepo).then(exists => {
    // eslint-disable-next-line no-console
    console.log('test repo exists?', exists);

    if (exists) {
      getFileContents(testRepo, 'test.json').then(contents => {
        // eslint-disable-next-line no-console
        console.log('got some contents', contents);

        setFileContents(
          testRepo,
          'test.json',
          old => `${old}\nsomething new ${old.split('\n').length.toString()}`,
        ).then(() => {
          // eslint-disable-next-line no-console
          console.log('saved');
        });
      });
    }
  });
}
