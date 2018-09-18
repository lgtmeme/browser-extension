// @flow
// @format

export type Rule = {};

export type DeclarativeContent$Event = {
  addRules(rules: Rule[]): void,
  removeRules(ruleIdentifiers?: string[], callback?: () => void): void,
};

export type PageStateMatcher = {};

export type ShowPageAction = {};

export type DeclarativeContent = {
  onPageChanged: DeclarativeContent$Event,

  PageStateMatcher(pageUrl?: any): PageStateMatcher,

  ShowPageAction(): ShowPageAction,
};

export type Runtime$InstalledEvent = {
  addListener(callback: (details: any) => void): void,
};

export type Runtime$MessageEvent = {
  addListener(
    callback: (
      message?: any,
      sender: any,
      sendResponse: (response?: any) => void,
    ) => boolean | void,
  ): void,
};

export type Runtime = {
  onInstalled: Runtime$InstalledEvent,

  onMessage: Runtime$MessageEvent,

  sendMessage(
    // extensionId?: string,
    message: any,
    options?: any,
    responseCallback?: (response: any) => void,
  ): void,
};

export type Chrome = {
  declarativeContent: DeclarativeContent,
  runtime: Runtime,
  extension: Object,
};
