// @flow
// @format

const windowFetch = window.fetch;

export type GithubHook = (args: Array<mixed>) => Promise<?Array<mixed>>;

const registeredHooks: Array<GithubHook> = [];

async function customFetch(...args: Array<mixed>) {
  let newArgs = args;
  // Only 1 ajax hook should execute
  for (const hook of registeredHooks) {
    // On purpose await for the first non-null response in loop
    // eslint-disable-next-line no-await-in-loop
    const hookArgs = await hook(newArgs);
    if (hookArgs) {
      newArgs = hookArgs;
      break;
    }
  }
  return windowFetch.apply(this, newArgs);
}

export default function registerHook(hook: GithubHook): void {
  if (window.fetch !== customFetch) {
    window.fetch = customFetch;
  }
  registeredHooks.push(hook);
}
