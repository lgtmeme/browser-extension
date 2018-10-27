// @flow
// @format

import type {Chrome} from '../chrome';

declare var chrome: Chrome;

export async function canReadOrigin(origin: string): Promise<boolean> {
  return new Promise(resolve => {
    (chrome: any).permissions.contains({origins: [origin]}, result => {
      resolve(!!result);
    });
  });
}

export async function askForOrigin(origin: string): Promise<boolean> {
  return new Promise(resolve => {
    (chrome: any).permissions.request(
      {
        origins: [origin],
        permissions: ['tabs'],
      },
      resolve,
    );
  });
}

export async function removeOrigin(origin: string): Promise<boolean> {
  return new Promise(resolve => {
    (chrome: any).permissions.remove(
      {
        origins: [origin],
      },
      resolve,
    );
  });
}

export async function hasTabs(): Promise<boolean> {
  return new Promise(resolve => {
    (chrome: any).permissions.contains({permissions: ['tabs']}, result => {
      resolve(!!result);
    });
  });
}
