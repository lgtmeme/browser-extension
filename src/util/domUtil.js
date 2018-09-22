// @flow
// @format

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
