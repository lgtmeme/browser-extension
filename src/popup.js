// @flow
// @format

import nullthrows from 'nullthrows';

import {
  getCurrentOrigin,
  canReadOrigin,
  askForOrigin,
  removeOrigin,
  hasTabs,
  isOriginEnabled,
  enableOrigin,
  disableOrigin,
} from './background';
import type {Chrome} from './chrome';

declare var chrome: Chrome;

document.writeln(`
  <html>
    <body style="width: 400px; height: 400px">
      <div>Has tabs: <span id="tabs"></span></div>
      <div>
        Origin: <span id="origin"></span><br />
        Has Chrome permission: <span id="chrome"></span><br />
        <button id="requestButton"></button>
      </div>
      <div>
        Should inject contentScript: <span id="inject"></span>
        <button id="injectButton"></button>
      </div>
    </body>
  </html>
`);

async function init() {
  const tabs = await hasTabs();
  nullthrows(document.getElementById('tabs')).innerHTML = tabs ? 'yes' : 'no';

  const origin = await getCurrentOrigin();
  const originRead = await canReadOrigin(origin);

  nullthrows(document.getElementById('origin')).innerHTML = origin;
  nullthrows(document.getElementById('chrome')).innerHTML = originRead
    ? 'yes'
    : 'no';

  const requestButton = nullthrows(document.getElementById('requestButton'));
  requestButton.innerHTML = originRead ? 'Revoke permission' : 'Get permission';
  requestButton.addEventListener('click', () => {
    if (!originRead) {
      askForOrigin(origin);
    } else {
      removeOrigin(origin);
    }
  });

  const enabled = isOriginEnabled(origin);
  nullthrows(document.getElementById('inject')).innerHTML = enabled
    ? 'yes'
    : 'no';

  const injectButton = nullthrows(document.getElementById('injectButton'));
  injectButton.innerHTML = enabled ? 'Do not inject' : 'Inject';
  injectButton.addEventListener('click', () => {
    if (!enabled) {
      enableOrigin(origin);
    } else {
      disableOrigin(origin);
    }
  });
}

init();
