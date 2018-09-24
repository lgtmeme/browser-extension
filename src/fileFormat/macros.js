// @flow
// @format

import invariant from 'invariant';

import type {File, DeserializedFile, Deserialization} from './versioning';
import {version} from './versioning';

import {serializeJSONFile, deserializeJSONFile} from './jsonFile';

const VERSION = version(0, 0, 1);

export const MACROS_FILENAME = 'macros.json';

export type Macro = {
  name: string,
  url: string,
};

export type MacrosFile = File<Array<Macro>>;

export function serializeMacrosToFile(
  existingFile: DeserializedFile,
  newMacros: Array<Macro>,
): string {
  // TODO for this client to write forward-compatible files, it needs to figure
  // out what changed, and merge the changes with the existing file, without
  // changing non-changed fields. This is the only way to have cross-version
  // roundtrip read/write. This may possibly be a generic enough thing that it
  // can be in serializeJSONFile.
  return serializeJSONFile(VERSION, existingFile.version, newMacros);
}

export class MacrosDeserializationError extends Error {}

function deserializeVersion0(content: mixed): Array<Macro> {
  if (!Array.isArray(content)) {
    throw new MacrosDeserializationError('Content is not an array');
  }
  return content.map((item, i) => {
    if (typeof item !== 'object' || item == null) {
      throw new MacrosDeserializationError(`Content[${i}] is not an object`);
    }
    const {name, url} = item;
    if (typeof name !== 'string') {
      throw new MacrosDeserializationError(
        `Content[${i}].name is not a string`,
      );
    }
    if (typeof url !== 'string') {
      throw new MacrosDeserializationError(`Content[${i}].url is not a string`);
    }
    return {
      name,
      url,
    };
  });
}

export function deserializeMacrosFromFile(
  file: string,
): ?Deserialization<Array<Macro>> {
  const deserializedFile = deserializeJSONFile(VERSION, file);
  if (!deserializedFile) {
    return null;
  }

  let macros: Array<Macro>;

  const {version: ver, content} = deserializedFile;
  if (ver.major === 0) {
    macros = deserializeVersion0(content);
  } else {
    invariant(false, `No deserialization logic for version ${ver.major}`);
  }

  return {
    deserializedFile,
    content: macros,
  };
}
