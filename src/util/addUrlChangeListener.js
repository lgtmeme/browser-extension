// @flow
// @format

// JS doesn't expose a listener for when the URL changes via history -_-. The
// alternative to hooking into window globals is to declare "tabs" as
// a permission in the Chrome extension manifest, but that has the scary message
// of "Extension can read all your browser history".

let swapped = false;

type Listener = () => mixed;
const listeners: Array<Listener> = [];

function callListeners() {
  listeners.forEach(l => l());
}

export default function addUrlChangeListener(listener: () => mixed): void {
  if (!swapped) {
    swapped = true;

    const windowHistoryPushState = window.history.pushState;
    window.history.pushState = function pushState(...args) {
      const ret = windowHistoryPushState.apply(window.history, args);
      callListeners();
      return ret;
    };

    const windowHistoryReplaceState = window.history.replaceState;
    window.history.replaceState = function replaceState(...args) {
      const ret = windowHistoryReplaceState.apply(window.history, args);
      callListeners();
      return ret;
    };

    window.addEventListener('popstate', callListeners);
  }

  listeners.push(listener);
}
