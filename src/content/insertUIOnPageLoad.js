// @flow
// @format

import nullthrows from 'nullthrows';
import invariant from 'invariant';

import {getMacros, addMacro} from './syncMacros';
import {getXPathNodes, htmlToElement} from '../util/domUtil';
import {registerListener} from '../rpc';
import {
  matchMarkdownImageURLs,
  replaceMarkdownWithMacro,
} from '../util/markdown';

function createUIHTML(): string {
  // Having "js-saved-reply-container" in the class gets us automatic macro text insertion
  return `
    <div class="toolbar-group">
      <details class="details-reset details-overlay toolbar-item select-menu select-menu-modal-right js-saved-reply-container js-lgtmeme-container">
        <summary class="menu-target">
          <svg class="octicon octicon-reply" viewBox="0 0 16 15" version="1.1" width="16" height="15" aria-hidden="true">
            <g transform="translate(-1, -2)">
                <polygon points="2.03130922 1.5 4.02349672 1.5 7.80865297 8.65527344 11.6519147 1.5 13.5195905 1.5 13.5195905 13.2954102 12.1084577 13.2954102 12.1084577 3.52539062 8.48101626 9.91699219 7.06988344 9.91699219 3.44244204 3.52539062 3.44244204 13.2954102 2.03130922 13.2954102"></polygon>
                <polygon points="0 16 0 15 16 15 16 16"></polygon>
            </g>
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

function updateUIHTML(detailsEl: HTMLDetailsElement): void {
  const FORM_CLASSES = [
    'js-new-comment-form',
    'js-inline-comment-form',
    'new-pr-form',
  ];
  const textarea = getXPathNodes(
    detailsEl,
    `ancestor::form[${FORM_CLASSES.map(c => `contains(@class, "${c}")`).join(
      ' or ',
    )}]//textarea[contains(@class, "js-comment-field")]`,
  )[0];
  if (!(textarea instanceof HTMLTextAreaElement)) {
    return;
  }
  const images = matchMarkdownImageURLs(textarea.value);
  const formID = textarea.id;

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
        (image, imageIdx) => `
          <div>
            <div style="text-align: center; margin-bottom: 10px">
              <img src="${image}" class="lgtmeme-add-macro-image" style="max-width: 100%; max-height: 120px"/>
            </div>
            <form>
              <label
                for="${`${formID}-macroImage-${imageIdx}`}"
                style="display: block">
                Create Meme
              </label>
              <input
                placeholder="Choose a macro"
                class="lgtmeme-add-macro-input form-control input-sm"
                type="text"
                id="${`${formID}-macroImage-${imageIdx}`}"
                style="width: 228px"
              />
              <button type="submit" class="lgtmeme-add-macro-button btn btn-sm btn-primary">Add</button>
            </form>
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
    const onAddMacro = () => {
      const macro = addMacroInput.value;
      if (!macro) {
        // eslint-disable-next-line no-alert
        alert('Must enter a macro');
        return;
      }

      const existingMacros = getMacros();
      if (!existingMacros) {
        // eslint-disable-next-line no-alert
        alert("Some bullshit error happened and we couldn't sync macros");
        return;
      }

      if (existingMacros.map(m => m.name).includes(macro)) {
        // eslint-disable-next-line no-alert
        alert(`Macro '${macro}' already points to another meme`);
        return;
      }

      addMacroInput.disabled = true;
      addMacroButton.disabled = true;

      const macroObj = {
        name: macro,
        url: addMacroImage.src,
      };
      addMacro(macroObj)
        .then(() => {
          // eslint-disable-next-line no-console
          console.log(`Added macro: ${macroObj.name}`);
          detailsEl.open = false;
          const newTextareaValue = replaceMarkdownWithMacro(
            textarea.value,
            macroObj,
          );
          textarea.value = newTextareaValue;
        })
        .catch(e => {
          // TODO
          // eslint-disable-next-line no-alert
          alert(
            'Could not save macro for some reason. sadpanda. See console for error.',
          );
          // eslint-disable-next-line no-console
          console.error('Error saving macro', e);
        });
    };
    addMacroButton.addEventListener('click', onAddMacro);
    detailsEl.addEventListener('submit', e => {
      e.stopPropagation();
      e.preventDefault();
      onAddMacro();
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

export function insertUIOnEveryPageLoad() {
  // Current page load
  insertUIOnPageLoad();

  registerListener(message => {
    if (message.type === 'urlChanged') {
      insertUIOnPageLoad();
    }
  });
}
