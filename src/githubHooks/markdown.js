// @flow
// @format

import type {Macro} from '../fileFormat';

export function getMacroMarkdown(macro: Macro): string {
  return `![${macro.name}](${macro.url} "${macro.name}")`;
}

export function replaceWithMacros(text: string, macros: Array<Macro>): string {
  const lines = text.split('\n');
  const replacedLines = lines.map(line => {
    const trimmedLine = line.trim();
    for (const macro of macros) {
      if (trimmedLine === macro.name) {
        return getMacroMarkdown(macro);
      }
    }
    return line;
  });
  return replacedLines.join('\n');
}
