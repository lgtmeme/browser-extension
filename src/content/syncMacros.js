// @flow
// @format

import type {Macro} from '../fileFormat';
import {
  getCurrentRepo,
  getMemeRepoForOwner,
  doesRepoExist,
  getFileContents,
  NotFoundError,
} from '../githubFs';
import {MACROS_FILENAME, deserializeMacrosFromFile} from '../fileFormat';
import {sendMessage, registerListener} from '../rpc';

// Cache so we don't do this like mad on each page load
// TODO clear the cache somehow
// TODO this doesn't update once we've loaded it. Need to refresh on interval
// TODO also, we should stick this into local storage and only update on an
// interval
const macrosByOwner: {[owner: string]: ?Array<Macro>} = {};

let previousOwner: ?string = null;

function getCurrentOwner(): ?string {
  const repo = getCurrentRepo(document.location.pathname);
  if (!repo) {
    return null;
  }
  return repo.owner;
}

async function getMacrosForOwner(owner: string): Promise<?Array<Macro>> {
  const memeRepo = getMemeRepoForOwner(owner);

  const exists = await doesRepoExist(memeRepo);
  if (!exists) {
    return null;
  }

  let rawFile: string;
  try {
    rawFile = await getFileContents(memeRepo, MACROS_FILENAME);
  } catch (e) {
    if (e instanceof NotFoundError) {
      return null;
    }
    throw e;
  }

  const deserialized = deserializeMacrosFromFile(rawFile);
  if (!deserialized) {
    return null;
  }

  const macros = deserialized.content;

  return macros;
}

async function onUrlChange() {
  const currentOwner = getCurrentOwner();
  if (currentOwner === previousOwner) {
    return;
  }
  previousOwner = currentOwner;

  if (!currentOwner) {
    return;
  }

  let macros: ?Array<Macro> = null;
  if (macrosByOwner.hasOwnProperty(currentOwner)) {
    macros = macrosByOwner[currentOwner];
  } else {
    macros = await getMacrosForOwner(currentOwner);
  }

  sendMessage({type: 'macrosUpdated', content: macros || []});
}

export function startSyncingMacros() {
  registerListener(message => {
    if (message.type === 'urlChanged') {
      onUrlChange();
    }
  });

  // First load
  onUrlChange();
}
