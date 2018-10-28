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

export function registerHookInFetch(hook: GithubHook): void {
  if (window.fetch !== customFetch) {
    window.fetch = customFetch;
  }
  registeredHooks.push(hook);
}

export type GithubFormHandler = (form: HTMLFormElement) => void;

const registeredHandlers: Array<GithubFormHandler> = [];
let formHandlerEventListenerAdded = false;

export function registerHandlerInFormSubmit(handler: GithubFormHandler): void {
  if (!formHandlerEventListenerAdded) {
    formHandlerEventListenerAdded = true;

    window.addEventListener('submit', e => {
      if (e.target instanceof HTMLFormElement) {
        registeredHandlers.forEach(h => h(e.target));
      }
    });
  }

  registeredHandlers.push(handler);
}
