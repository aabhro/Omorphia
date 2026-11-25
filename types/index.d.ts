export type ThemeMode = 'dark' | 'light' | 'auto';
export interface ThemeAPI { get(element?: HTMLElement): string; set(mode: ThemeMode, element?: HTMLElement): void; toggle(element?: HTMLElement): void; }
export interface ToastAction { label: string; onClick?: () => void; }
export interface ToastOptions { title?: string; description?: string; variant?: 'success'|'danger'|'error'|'warning'|'info'|'neutral'; duration?: number; action?: ToastAction; onDismiss?: () => void; }
export interface ToastHandle { dismiss(): void; element: HTMLElement; }
export interface ConfirmOptions { title?: string; message?: string; confirmLabel?: string; cancelLabel?: string; destructive?: boolean; }
export interface Command { id?: string; label: string; group?: string; description?: string; icon?: string; keywords?: string[]; shortcut?: string; href?: string; target?: string; onSelect?: (command: Command) => void; run?: (command: Command) => void; disabled?: boolean; }
export interface CommandRegistry { register(commands: Command|Command[]): () => void; unregister(id: string): void; clear(): void; list(): Command[]; }
export interface IconRegistry { has(name: string): boolean; register(name: string, svg: string): void; registerAll(icons: Record<string,string>): void; load(name: string): Promise<boolean>; }
export interface IconConfig { cdn: string; }
export class UIPopover extends HTMLElement { open: boolean; show(): void; hide(): void; toggle(): void; }
export class UIDropdown extends UIPopover {}
export class UIModal extends HTMLElement { open: boolean; show(): void; close(returnValue?: string): void; toggle(): void; }
export class UICommandPalette extends HTMLElement { disabled: boolean; readonly isOpen: boolean; readonly commands: Command[]; open(): void; close(): void; toggle(): void; register(commands: Command|Command[]): () => void; all(): Command[]; filter(query: string): Array<{c:Command;ranges:number[][];score?:number}>; matches_hotkey(event: KeyboardEvent): boolean; }
export class UIDatePicker extends HTMLElement { value: string; readonly date: Date|null; disabled: boolean; readonly open: boolean; show(): void; hide(): void; toggle(): void; isDisabled(date: Date): boolean; focus(options?: FocusOptions): void; }
export class UITimePicker extends HTMLElement { value: string; disabled: boolean; readonly open: boolean; readonly is12Hour: boolean; show(): void; hide(): void; toggle(): void; focus(options?: FocusOptions): void; parseTypedTime(value: string): {hour:number;minute:number}|null; }
export class UIButton extends HTMLElement {}
export class UITooltip extends HTMLElement {}
export class UITabs extends HTMLElement { value: string; }
export class UITab extends HTMLElement {}
export class UIPagination extends HTMLElement {}
export class UISearch extends HTMLElement { data: unknown[]; value: string; clear(): void; }
export class UISidebar extends HTMLElement { collapsed: boolean; toggle(): void; collapse(): void; expand(): void; openMobile(): void; closeMobile(): void; }
export class UISidebarItem extends HTMLElement {}
export class UIInput extends HTMLElement { value:string; disabled:boolean; focus(options?:FocusOptions):void; select():void; checkValidity():boolean; reportValidity():boolean; }
export class UITextarea extends HTMLElement { value:string; disabled:boolean; focus(options?:FocusOptions):void; checkValidity():boolean; reportValidity():boolean; }
export class UICheckbox extends HTMLElement { checked:boolean; disabled:boolean; }
export class UIRadio extends HTMLElement { checked:boolean; disabled:boolean; }
export class UISwitch extends HTMLElement { checked:boolean; disabled:boolean; }
export class UIRange extends HTMLElement { value:number; disabled:boolean; }
export class UIOption extends HTMLElement { readonly value:string; readonly label:string; disabled:boolean; }
export class UISelect extends HTMLElement { value:string|string[]; disabled:boolean; focus(options?:FocusOptions):void; choose(option:UIOption):void; }
export class UIDrawer extends HTMLElement { open:boolean; show():void; close(reason?:string):void; toggle():void; }
export class UIAccordion extends HTMLElement {}
export class UIAccordionItem extends HTMLElement { open:boolean; show():void; hide():void; toggle():void; }
export class UIMenuItem extends HTMLElement {}

export interface ComboboxOption { value: string; label?: string; text?: string; description?: string; disabled?: boolean; [key: string]: unknown; }
export interface DataTableColumn<T = Record<string, unknown>> { key: keyof T | string; label?: string; sortable?: boolean; format?: (value: unknown, row: T) => string | number | Node; }
export interface TreeNode { id: string; label: string; icon?: string; count?: number; disabled?: boolean; children?: TreeNode[]; }
export interface TourStep { selector?: string; title?: string; description?: string; }
export class UIColorPicker extends HTMLElement { value: string; color: string; disabled: boolean; setColor(value: string, notify?: boolean): boolean; show(): void; hide(): void; focus(options?: FocusOptions): void; }
export class UIFileUpload extends HTMLElement { readonly files: File[]; disabled: boolean; openPicker(): void; addFiles(files: File[]): File[]; removeFile(index: number): boolean; }
export class UICombobox extends HTMLElement { data: ComboboxOption[]; source: ((query: string, signal: AbortSignal) => Promise<ComboboxOption[]>) | null; value: string; disabled: boolean; search(query: string): Promise<void>; choose(item: ComboboxOption): void; create(label: string): void; close(): void; focus(options?: FocusOptions): void; }
export class UIMultiSelect extends UISelect { removeValue(value: string): void; }
export class UINumberInput extends HTMLElement { value: number; readonly min: number; readonly max: number; readonly step: number; disabled: boolean; stepBy(direction: -1 | 1): void; focus(options?: FocusOptions): void; }
export class UIOtpInput extends HTMLElement { value: string; readonly length: number; disabled: boolean; setValue(value: string, notify?: boolean): void; focus(options?: FocusOptions): void; }
export class UIRichTextEditor extends HTMLElement { value: string; readonly textContentValue: string; get readonly(): boolean; getHTML(): string; setLink(url: string): boolean; exec(command: string, value?: string): boolean; focus(options?: FocusOptions): void; }
export class UIDataTable<T = Record<string, unknown>> extends HTMLElement { data: T[]; columns: DataTableColumn<T>[]; readonly page: number; readonly pageSize: number; readonly selectedRows: T[]; go(page: number): void; setFilter(query: string): void; setColumnVisible(key: string, visible: boolean): void; }
export class UITreeView extends HTMLElement { data: TreeNode[]; expanded: string[]; value: string[]; find(id: string): { node: TreeNode; parent: TreeNode | null; siblings: TreeNode[] } | null; toggle(id: string): void; select(id: string): void; move(sourceId: string, targetId: string): boolean; focus(options?: FocusOptions): void; }
export class UISplitPanel extends HTMLElement { ratio: number; }
export class UIStep extends HTMLElement {}
export class UIStepper extends HTMLElement { readonly index: number; value: string; go(index: number): boolean; nextStep(): boolean; previous(): boolean; }
export class UITimelineItem extends HTMLElement {}
export class UITimeline extends HTMLElement {}
export class UIRating extends HTMLElement { value: number; readonly max: number; readonly disabled: boolean; setValue(value: number, notify?: boolean): boolean; }
export class UISkeleton extends HTMLElement {}
export class UIEmptyState extends HTMLElement {}
export class UITour extends HTMLElement { steps: TourStep[]; readonly open: boolean; start(index?: number): boolean; nextStep(): void; previous(): void; end(reason?: string): void; }

export const version:string;
export const theme:ThemeAPI;
export const config:{toastPosition:string};
export function toast(options?:ToastOptions|string):ToastHandle;
export function confirm(options?:ConfirmOptions):Promise<boolean>;
export const commands:CommandRegistry;
export const icons:IconRegistry;
export function icon(name:string,size?:number|string):HTMLElement;
export const iconConfig:IconConfig;
export function shortcutLabel(): string;
declare global {
 interface HTMLElementTagNameMap {
  'ui-button':UIButton; 'ui-icon':HTMLElement; 'ui-tooltip':UITooltip; 'ui-modal':UIModal;
  'ui-popover':UIPopover; 'ui-dropdown':UIDropdown; 'ui-menu-item':UIMenuItem;
  'ui-tabs':UITabs; 'ui-tab':UITab; 'ui-pagination':UIPagination;
  'ui-command-palette':UICommandPalette; 'ui-command':HTMLElement; 'ui-search':UISearch;
  'ui-sidebar':UISidebar; 'ui-sidebar-item':UISidebarItem; 'ui-input':UIInput; 'ui-textarea':UITextarea;
  'ui-checkbox':UICheckbox; 'ui-radio':UIRadio; 'ui-switch':UISwitch; 'ui-range':UIRange;
  'ui-option':UIOption; 'ui-select':UISelect; 'ui-date-picker':UIDatePicker; 'ui-time-picker':UITimePicker;
  'ui-drawer':UIDrawer; 'ui-accordion':UIAccordion; 'ui-accordion-item':UIAccordionItem;
  'ui-color-picker':UIColorPicker; 'ui-file-upload':UIFileUpload; 'ui-combobox':UICombobox; 'ui-multi-select':UIMultiSelect;
  'ui-number-input':UINumberInput; 'ui-otp-input':UIOtpInput; 'ui-rich-text-editor':UIRichTextEditor;
  'ui-data-table':UIDataTable; 'ui-tree-view':UITreeView; 'ui-split-panel':UISplitPanel; 'ui-stepper':UIStepper; 'ui-step':UIStep;
  'ui-timeline':UITimeline; 'ui-timeline-item':UITimelineItem; 'ui-rating':UIRating; 'ui-skeleton':UISkeleton;
  'ui-empty-state':UIEmptyState; 'ui-tour':UITour;
 }
}
