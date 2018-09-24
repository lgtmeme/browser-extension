// @flow
// @format

// TODO this does not actually do RPC - it only sends a message and can't do
// responses yet. It also needs to do a initial handshake when first
// establishing the connection, so early messages are queued until the listener
// on the other side is setup and messages aren't dropped.

import type {Macro} from './fileFormat';

export type RPCMessageType = 'test' | 'macrosUpdated';

export type RPCMessageTestContent = number;
export type RPCMessageMacrosUpdated = Array<Macro>;

export type RPCMessage =
  | {
      type: 'test',
      content: RPCMessageTestContent,
    }
  | {
      type: 'macrosUpdated',
      content: RPCMessageMacrosUpdated,
    }
  | {
      type: 'urlChanged',
    };

// TODO this has no security - any script can window.postMessage a message
// pretending to be us. Uh no idea what to do here for the future.
const MESSAGE_NOUNCE = 'RaNdOm tOKen To muLtIPlEx mEssAGeS';

export function sendMessage(message: RPCMessage): void {
  const wrapper = {
    nounce: MESSAGE_NOUNCE,
    message,
  };
  window.postMessage(wrapper, '*');
}

export type Listener = RPCMessage => mixed;
const listeners: Array<Listener> = [];

let windowListenerRegistered = false;

export function registerListener(listener: Listener): void {
  if (!windowListenerRegistered) {
    windowListenerRegistered = true;
    window.addEventListener(
      'message',
      event => {
        // We only accept messages from ourselves
        if (event.source !== window) {
          return;
        }

        const {data} = event;
        if (data.nounce !== MESSAGE_NOUNCE) {
          return;
        }

        const message = ((data.message: any): RPCMessage);
        listeners.forEach(l => l(message));
      },
      false,
    );
  }
  listeners.push(listener);
}
