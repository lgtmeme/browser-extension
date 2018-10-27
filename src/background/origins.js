// @flow
// @format

import type {Chrome} from '../chrome';

declare var chrome: Chrome;

function getOriginKey(origin: string): string {
  return `origin-enabled-${origin}`;
}

export function originFromUrl(url: string): string {
  return `${new URL(url).origin}/`;
}

export async function getCurrentOrigin(): Promise<string> {
  return new Promise(resolve => {
    (chrome: any).tabs.getSelected(null, tab =>
      resolve(originFromUrl(tab.url)),
    );
  });
}

export function isOriginEnabled(origin: string): boolean {
  return !!localStorage.getItem(getOriginKey(origin));
}

export function enableOrigin(origin: string): void {
  localStorage.setItem(getOriginKey(origin), 'enabled');
}

export function disableOrigin(origin: string): void {
  localStorage.removeItem(getOriginKey(origin));
}
