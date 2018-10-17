// @flow
// @format

import nullthrows from 'nullthrows';
import invariant from 'invariant';

export function getXPathNodes(
  node: HTMLElement,
  path: string,
): Array<HTMLElement> {
  const xpathResult = (document: any).evaluate(
    path,
    node,
    null,
    window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null,
  );

  const result = [];
  for (let i = 0; i < xpathResult.snapshotLength; ++i) {
    result.push(xpathResult.snapshotItem(i));
  }

  return result;
}

export function htmlToElement(html: string): HTMLElement {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  const node = nullthrows(template.content.firstChild);
  invariant(node instanceof HTMLElement, 'Root must be an HTML element');
  return node;
}
