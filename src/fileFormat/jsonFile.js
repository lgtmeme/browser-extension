// @flow
// @format

import invariant from 'invariant';
import jsonStringify from 'json-stable-stringify';

import type {Version, DeserializedFile} from './versioning';
import {
  versionStr,
  strToVersion,
  canClientWrite,
  canClientRead,
} from './versioning';

export function serializeJSONFile<T>(
  clientVersion: Version,
  existingVersion: Version,
  content: T,
): string {
  invariant(
    canClientWrite(clientVersion, existingVersion),
    'Version to write is not new enough',
  );
  return jsonStringify(
    {
      version: versionStr(clientVersion),
      content,
    },
    {space: '  '},
  );
}

export class DeserializeJSONFileError extends Error {}

export function deserializeJSONFile(
  clientVersion: Version,
  raw: string,
): ?DeserializedFile {
  let file;
  try {
    file = JSON.parse(raw);
  } catch (ex) {
    throw new DeserializeJSONFileError('Cannot serialize file');
  }

  if (
    !file ||
    typeof file.version !== 'string' ||
    !file.hasOwnProperty('content')
  ) {
    throw new DeserializeJSONFileError('Invalid JSON file');
  }

  const fileVersion = strToVersion(file.version);
  if (fileVersion == null) {
    throw new DeserializeJSONFileError('Invalid version');
  }

  if (!canClientRead(clientVersion, fileVersion)) {
    return null;
  }

  return {
    version: fileVersion,
    content: file.content,
  };
}
