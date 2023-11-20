import type { InjectionKey } from 'vue';

import { PluginManager } from './plugins/PluginManager';

export const PluginManagerKey = Symbol() as InjectionKey<PluginManager>;
