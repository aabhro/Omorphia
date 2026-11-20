import './icons.js';
import { icons, icon, config as iconConfig } from './icons.js';
import { config } from './config.js';
import { toast } from './components/toast.js';
import { UIButton } from './components/button.js';
import { UITooltip } from './components/tooltip.js';
import { UIModal, confirm } from './components/modal.js';
import { UIPopover, UIDropdown } from './components/popover.js';
import { UITabs, UITab } from './components/tabs.js';
import { UIPagination } from './components/pagination.js';
import { UICommandPalette, commands, shortcutLabel } from './components/command-palette.js';
import { UISearch } from './components/search.js';
import { UISidebar, UISidebarItem } from './components/sidebar.js';

export const version = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'dev';

/** Theme helper: theme.set('light' | 'dark' | 'auto', element = <html>) */
export const theme = {
  get: (el = document.documentElement) => el.getAttribute('data-ui-theme') || 'dark',
  set(mode, el = document.documentElement) { el.setAttribute('data-ui-theme', mode); el.dispatchEvent(new CustomEvent('ui-theme', { detail: { mode }, bubbles: true })); },
  toggle(el = document.documentElement) { theme.set(theme.get(el) === 'light' ? 'dark' : 'light', el); },
};
export { config, toast, confirm, commands, icons, icon, iconConfig, UIButton, UITooltip, UIModal, UIPopover, UIDropdown, UITabs, UITab, UIPagination, UICommandPalette, shortcutLabel, UISearch, UISidebar, UISidebarItem };
