// @flow
// @format

import invariant from 'invariant';

import type {Macro, MacrosFile} from '../fileFormat';
import {
  getCurrentRepo,
  getMemeRepoForOwner,
  doesRepoExist,
  getFileContents,
  setFileContents,
  NotFoundError,
} from '../githubFs';
import {
  MACROS_FILENAME,
  deserializeMacrosFromFile,
  serializeMacrosToFile,
} from '../fileFormat';
import {sendMessage, registerListener} from '../rpc';

// Cache so we don't do this like mad on each page load
// TODO clear the cache somehow
// TODO this doesn't update once we've loaded it. Need to refresh on interval
// TODO also, we should stick this into local storage and only update on an
// interval
const macroFilesByOwner: {[owner: string]: ?MacrosFile} = {};

let previousOwner: ?string = null;

function getCurrentOwner(): ?string {
  const repo = getCurrentRepo(document.location.pathname);
  if (!repo) {
    return null;
  }
  return repo.owner;
}

async function getMacrosForOwner(owner: string): Promise<?MacrosFile> {
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

  return deserializeMacrosFromFile(rawFile);
}

export function getMacrosFile(): ?MacrosFile {
  const currentOwner = getCurrentOwner();
  if (!currentOwner) {
    return null;
  }
  const macroFile = macroFilesByOwner[currentOwner];
  if (!macroFile) {
    return null;
  }
  return macroFile;
}

// Expose this locally in the content script context as well
export function getMacros(): ?Array<Macro> {
  const file = getMacrosFile();
  if (!file) {
    return null;
  }
  return file.content;
}

function notifyPageContext(macros: Array<Macro>) {
  sendMessage({type: 'macrosUpdated', content: macros});
}

export async function forceSyncMacros(): Promise<?MacrosFile> {
  const currentOwner = getCurrentOwner();
  if (!currentOwner) {
    return null;
  }

  macroFilesByOwner[currentOwner] = await getMacrosForOwner(currentOwner);

  const macroFile = macroFilesByOwner[currentOwner];
  const macros = macroFile ? macroFile.content : [];
  notifyPageContext(macros || []);

  return macroFilesByOwner[currentOwner];
}

export async function addMacro(newMacro: Macro): Promise<void> {
  // Sync to the latest before beginning.
  const existingMacroFile = await forceSyncMacros();
  invariant(existingMacroFile, 'No target macro file');
  if (existingMacroFile.content.map(m => m.name).includes(newMacro.name)) {
    throw new Error(`Macro with ${newMacro.name} already exists`);
  }

  const macros = existingMacroFile.content.slice(0);
  macros.push(newMacro);
  const newFile = serializeMacrosToFile(existingMacroFile, macros);

  const owner = getCurrentOwner();
  invariant(owner, 'Must have an owner');
  const memeRepo = getMemeRepoForOwner(owner);
  await setFileContents(memeRepo, MACROS_FILENAME, () => newFile);

  // Sync again after saving, to reload local cache. Can probably be skipped if
  // we refactor serializeMacrosToFile to give back a Deserialization<>.
  await forceSyncMacros();
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
  if (!macroFilesByOwner.hasOwnProperty(currentOwner)) {
    macroFilesByOwner[currentOwner] = await getMacrosForOwner(currentOwner);
  }
  const macroFile = macroFilesByOwner[currentOwner];
  macros = macroFile ? macroFile.content : [];

  notifyPageContext(macros || []);
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
