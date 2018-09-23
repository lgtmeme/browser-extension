// @flow
// @format

/* Versioning Semantics
 *
 * Here are the priorities, in order, for our versioning story:
 * 1. Any existing clients can read the file.
 * 2. New features adopted ASAP.
 *
 * Versioning for each file is independent of others. This is all within the
 * context of one file. If contents in two files need to relate to each other,
 * they should be in one file.
 *
 * There are two cases of compatibility:
 * 1. Backward read compatible: an old client can read a new version.
 * 2. Forward write compatible: an old client can write to a new version without
 *    losing fidelity of information it does not understand.
 *
 * (Isn't it cool that the length of characters of "backward read" and "forward
 * write" are the same?)
 *
 * Each file format change belongs to one of the following categories:
 * 1. Addition which enables functionality in new clients, orthogonal to
 *    existing functionatliy. This is backward and forward compatible.
 * 2. Addition which augments an existing field, such that the combination of
 *    the two fields enable new functionality in new clients. The two fields are
 *    not orthogonal - updating only the original field requires possibly
 *    updating the new field. This is *only* backward compatible.
 * 3. Change of meaning for an existing field. This is *not* backward nor
 *    forward compatible.
 * 4. Change of format (and optionally meaning) for an existing field. This is
 *    *not* backward nor forward compatible.
 *
 * A version is defined as 'X.Y.Z'.
 * - When a file format changes in a forward and backward compatible way, Z is
 *   bumped. This is to keep track of file format changes.
 * - When a file format changes in a backward but not forward compatible way,
 *   Y is bumped and Z is set to 0.
 * - When a file format changes in a way that's neither backward nor forward
 *   compatible, X is bumped, and Y and Z are set to 0.
 *
 * A file has a version. A client has a version - the file format version at the
 * time of its release.
 *
 * To read a file, the client's X has to >= the file's X. A client must be able
 * to read all historical versions of a file format.
 *
 * If the client's X < the file's X, the client must be updated in order to read
 * it. Minimize bumping X in the file format.
 *
 * To write a file, the client's X.Y has to >= the file's X.Y. The version of
 * the file written is the client's X.Y. The client only writes the latest
 * version.
 *
 * If the client's X.Y < the file's X.Y, the client must be updated to write to
 * it. This isn't too bad since lgtmeme should be a read-heavy application.
 *
 * Most of the time, this should all be transparent to the user. Chrome keeps
 * extensions auto updated. This only becomes a user-facing issue if the browser
 * has been open for a long time (which does happen); we'd have to ask the user
 * to restart the browser.
 */

import invariant from 'invariant';
import semver from 'semver';

export type Version = {
  major: number,
  minor: number,
  patch: number,
};

export type WriteVersion = {
  major: number,
  minor: number,
};

export type ReadVersion = {
  major: number,
};

function isVersionNum(num: number): boolean {
  return Number.isInteger(num) && num >= 0;
}

function ensureVersionNum(num: number): void {
  invariant(isVersionNum(num), `Version num (${num}) is invalid`);
}

export function version(major: number, minor: number, patch: number): Version {
  ensureVersionNum(major);
  ensureVersionNum(minor);
  ensureVersionNum(patch);
  return {
    major,
    minor,
    patch,
  };
}

export function toReadVersion(
  ver: Version | WriteVersion | ReadVersion,
): ReadVersion {
  return {
    major: ver.major,
  };
}

export function toWriteVersion(ver: Version | WriteVersion): WriteVersion {
  return {
    major: ver.major,
    minor: ver.minor,
  };
}

export function versionStr(ver: Version | ReadVersion | WriteVersion): string {
  const {major} = ver;
  const minor = typeof ver.minor === 'number' ? ver.minor : null;
  const patch = typeof ver.patch === 'number' ? ver.patch : null;

  ensureVersionNum(major);
  const parts = [`${major}`];

  if (minor != null) {
    ensureVersionNum(minor);
    parts.push(`${minor}`);
    if (patch != null) {
      ensureVersionNum(patch);
      parts.push(`${patch}`);
    } else {
      parts.push('x');
    }
  } else {
    parts.push('x');
  }
  return parts.join('.');
}

export function strToVersion(s: string): ?Version {
  const semverStr = semver.valid(s);
  if (semverStr == null) {
    return null;
  }
  const [majorStr, minorStr, patchStr] = s.split('.');
  if (
    Number.isNaN(majorStr) ||
    Number.isNaN(minorStr) ||
    Number.isNaN(patchStr)
  ) {
    return null;
  }

  // don't use parseInt so we catch errors if it's a float
  const major = parseFloat(majorStr);
  const minor = parseFloat(minorStr);
  const patch = parseFloat(patchStr);
  if (
    typeof major !== 'number' ||
    typeof minor !== 'number' ||
    typeof patch !== 'number'
  ) {
    return null;
  }
  if (!isVersionNum(major) || !isVersionNum(minor) || !isVersionNum(patch)) {
    return null;
  }
  return {
    major,
    minor,
    patch,
  };
}

export function canClientRead(client: Version, file: Version): boolean {
  return semver.satisfies(
    versionStr(file),
    `<=${versionStr(toReadVersion(client))}`,
  );
}

export function canClientWrite(client: Version, file: Version): boolean {
  return semver.satisfies(
    versionStr(file),
    `<=${versionStr(toWriteVersion(client))}`,
  );
}

export type File<T> = {
  version: Version,
  content: T,
};

export type DeserializedFile = File<mixed>;

export type Deserialization<T> = {
  deserializedFile: DeserializedFile,
  content: T,
};

export class ReadVersionTooNewError extends Error {
  readVersion: Version;
  latestVersionCanBeRead: Version;

  constructor(readVersion: Version, latestVersionCanBeRead: Version) {
    super(
      `${versionStr(readVersion)} is too new; can only read up to ${versionStr(
        latestVersionCanBeRead,
      )}`,
    );

    this.readVersion = readVersion;
    this.latestVersionCanBeRead = latestVersionCanBeRead;
  }
}

export class WriteVersionNotNewEnoughError extends Error {
  writeVersion: Version;
  latestVersionCanBeWritten: Version;

  constructor(writeVersion: Version, latestVersionCanBeWritten: Version) {
    super(
      `${versionStr(
        writeVersion,
      )} is too new; can only write up to ${versionStr(
        latestVersionCanBeWritten,
      )}`,
    );

    this.writeVersion = writeVersion;
    this.latestVersionCanBeWritten = latestVersionCanBeWritten;
  }
}
