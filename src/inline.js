// @flow
// @format

import {
  getCurrentRepo,
  getMemeRepoFor,
  doesRepoExist,
  getFileContents,
  setFileContents,
} from './githubFs';

import {serializeMacrosToFile, deserializeMacrosFromFile} from './fileFormat';

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
      getFileContents(testRepo, 'test.json').then(raw => {
        // eslint-disable-next-line no-console
        console.log('got some contents', raw);

        const deserialized = deserializeMacrosFromFile(raw);
        // eslint-disable-next-line no-console
        console.log('deserialized', deserialized);
        if (deserialized) {
          const {deserializedFile, content} = deserialized;

          const macros = content.slice(0);
          macros.push({
            name: `justright ${macros.length}`,
            url: 'google.com',
          });

          const serialized = serializeMacrosToFile(deserializedFile, macros);
          // eslint-disable-next-line no-console
          console.log('serialized', serialized);

          setFileContents(testRepo, 'test.json', _ => serialized).then(() => {
            // eslint-disable-next-line no-console
            console.log('saved');
          });
        }
      });
    }
  });
}
