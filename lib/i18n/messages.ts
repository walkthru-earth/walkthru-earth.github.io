import type { MessageCatalog } from './types';
import { coreMessages } from './messages-core';
import { controlsMessages } from './messages-controls';
import { privacyMessages } from './messages-privacy';
import { projectMessages } from './messages-projects';
import { linkMessages } from './messages-links';
import { softwareMessages } from './messages-software';
import { explorerMessages } from './messages-explorer';
import { strategyMessages } from './messages-strategy';

export const messages: MessageCatalog = {
  ...coreMessages,
  ...controlsMessages,
  ...privacyMessages,
  ...projectMessages,
  ...linkMessages,
  ...softwareMessages,
  ...explorerMessages,
  ...strategyMessages,
};
