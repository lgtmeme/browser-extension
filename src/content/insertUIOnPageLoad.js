// @flow
// @format

import nullthrows from 'nullthrows';
import invariant from 'invariant';

import {getMacros, addMacro} from './syncMacros';
import {getXPathNodes, htmlToElement} from '../util/domUtil';

function matchMarkdownImageURLs(markdown: string): Array<string> {
  const lines = markdown.split('\n');

  return lines
    .map(line => {
      const match = line.match(/^!\[[^\]]+\]\(([^ ]+)\)$/);
      if (!match) {
        return null;
      }
      return match[1];
    })
    .filter(Boolean);
}

function createUIHTML(): string {
  // Having "js-saved-reply-container" in the class gets us automatic macro text insertion
  return `
    <div class="toolbar-group">
      <details class="details-reset details-overlay toolbar-item select-menu select-menu-modal-right js-saved-reply-container js-lgtmeme-container">
        <summary class="menu-target">
          <svg class="octicon octicon-reply" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true">
            <path fill-rule="evenodd" d="M6 3.5c3.92.44 8 3.125 8 10-2.312-5.062-4.75-6-8-6V11L.5 5.5 6 0v3.5z"></path>
          </svg>
          <span class="dropdown-caret"></span>
        </summary>
        <details-menu class="select-menu-modal position-absolute right-0" style="z-index: 99;" role="menu">
          <div class="select-menu-header d-flex">
            <span class="select-menu-title flex-auto">
              LGTMeme
            </span>
          </div>
          <tab-list>
            <div class="select-menu-list content" style="padding: 10px">
            </div>
          </tab-list>
        </details-menu>
      </details>
    </div>
  `;
}

function updateUIHTML(detailsEl: HTMLElement): void {
  const textarea = getXPathNodes(
    detailsEl,
    'ancestor::*[contains(@class, "js-comment")]//textarea[contains(@class, "js-comment-field")]',
  )[0];
  if (!(textarea instanceof HTMLTextAreaElement)) {
    return;
  }
  const images = matchMarkdownImageURLs(textarea.value);

  let content;
  if (images.length === 0) {
    content = `
      <div class="select-menu-blankslate">
        <h3>Create meme</h3>
        <p>Drag and drop an image to the comment box, then select a macro here.</p>
      </div>
    `;
  } else {
    content = images
      .map(
        image => `
          <div style="display: table">
            <img src="${image}" class="lgtmeme-add-macro-image" style="max-width: 100px; max-height: 100px; margin-right: 10px"/>
            <div style="display: table-cell; vertical-align: middle">
              Create meme:
              <br />
              <input placeholder="Choose a macro" class="lgtmeme-add-macro-input" />
              <button type="button" class="lgtmeme-add-macro-button">Add</button>
            </div>
          </div>
        `,
      )
      .join('\n');
  }

  const contentContainer = getXPathNodes(
    detailsEl,
    'descendant::div[contains(@class, "select-menu-list content")]',
  )[0];
  invariant(contentContainer != null, 'Content container must not be null');
  contentContainer.innerHTML = content;

  // TODO support multiple image links
  const addMacroInput = getXPathNodes(
    detailsEl,
    'descendant::*[contains(@class, "lgtmeme-add-macro-input")]',
  )[0];
  const addMacroButton = getXPathNodes(
    detailsEl,
    'descendant::*[contains(@class, "lgtmeme-add-macro-button")]',
  )[0];
  const addMacroImage = getXPathNodes(
    detailsEl,
    'descendant::img[contains(@class, "lgtmeme-add-macro-image")]',
  )[0];
  if (addMacroInput && addMacroButton && addMacroImage) {
    invariant(
      addMacroInput instanceof HTMLInputElement,
      'Must be HTMLInputElement',
    );
    invariant(
      addMacroButton instanceof HTMLButtonElement,
      'Must be HTMLButtonElement',
    );
    invariant(
      addMacroImage instanceof HTMLImageElement,
      'Must be HTMLImageElement',
    );
    addMacroButton.addEventListener('click', () => {
      const macro = addMacroInput.value;
      if (!macro) {
        // TODO
        // eslint-disable-next-line no-alert
        alert('Must enter a macro');
        return;
      }

      const existingMacros = getMacros();
      if (!existingMacros) {
        // TODO
        // eslint-disable-next-line no-alert
        alert("Some bullshit error happened and we couldn't sync macros");
        return;
      }

      if (existingMacros.map(m => m.name).includes(macro)) {
        // TODO
        // eslint-disable-next-line no-alert
        alert(`Macro '${macro}' already points to another meme`);
        return;
      }

      addMacro({name: macro, url: addMacroImage.src})
        .then(() => {
          // TODO
          // eslint-disable-next-line no-console
          console.log('added');
        })
        .catch(e => {
          // TODO
          // eslint-disable-next-line no-console
          console.error('Error saving macro', e);
        });
    });
  }
}

function insertUI() {
  const markdownToolbarEls = getXPathNodes(
    nullthrows(document.body),
    '//markdown-toolbar',
  );
  markdownToolbarEls.forEach(toolbar => {
    const lgtmemeEl = htmlToElement(createUIHTML());
    toolbar.appendChild(lgtmemeEl);
    const detailsEl = lgtmemeEl.firstElementChild;
    invariant(
      detailsEl instanceof HTMLDetailsElement,
      'Must be an HTMLDetailsElement',
    );
    detailsEl.addEventListener('toggle', () => {
      if (detailsEl.open) {
        updateUIHTML(detailsEl);
      }
    });
  });
}

export function insertUIOnPageLoad() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertUI);
  } else {
    insertUI();
  }
}
