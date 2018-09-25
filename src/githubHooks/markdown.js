// @flow
// @format

import type {Macro} from '../fileFormat';

export function getMacroMarkdown(macro: Macro): string {
  return `![${macro.name}](${macro.url} "${macro.name}")`;
}
