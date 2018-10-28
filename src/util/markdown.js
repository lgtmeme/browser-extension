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

function escapeForRegex(s: string): string {
  // I don't actually know what exactly is or isn't useless here.
  // eslint-disable-next-line no-useless-escape
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function replaceMarkdownWithMacro(text: string, macro: Macro): string {
  const imageMarkdownRegex = new RegExp(
    `^!\\[[^\\]]*]\\(${escapeForRegex(macro.url)}\\)$`,
  );
  const lines = text.split('\n');
  const replacedLines = lines.map(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.match(imageMarkdownRegex)) {
      return macro.name;
    }
    return line;
  });
  return replacedLines.join('\n');
}
