import { theme, toast, confirm, commands, icon, shortcutLabel, UIDatePicker, UITimePicker } from '../types';

const date: UIDatePicker = document.createElement('ui-date-picker');
date.value = '2026-11-25';
date.show();
const time: UITimePicker = document.createElement('ui-time-picker');
time.value = '14:30';
time.focus();
theme.set('dark');
toast({ title: 'Ready', variant: 'success' }).dismiss();
void confirm({ title: 'Continue?' });
commands.register({ id: 'save', label: 'Save', onSelect: (command) => command.id });
icon('calendar');
shortcutLabel();
document.createElement('ui-popover').show();

import {
  UIColorPicker, UIFileUpload, UICombobox, UIMultiSelect, UINumberInput,
  UIOtpInput, UIRichTextEditor, UIDataTable, UITreeView, UISplitPanel,
  UIStepper, UITimeline, UIRating, UISkeleton, UIEmptyState, UITour
} from '../types';

const color: UIColorPicker = document.createElement('ui-color-picker');
color.value = '#b58bbf'; color.setColor('rgba(20, 40, 60, .5)', true);
const upload: UIFileUpload = document.createElement('ui-file-upload');
upload.addFiles([]); upload.removeFile(0);
const combo: UICombobox = document.createElement('ui-combobox');
combo.data = [{ value: 'prod', label: 'Production' }];
combo.source = async (query, signal) => { signal.throwIfAborted(); return [{ value: query }]; };
combo.search('prod');
const multi: UIMultiSelect = document.createElement('ui-multi-select');
multi.value = ['design']; multi.removeValue('design');
const number: UINumberInput = document.createElement('ui-number-input');
number.value = 2.5; number.stepBy(1);
const otp: UIOtpInput = document.createElement('ui-otp-input');
otp.value = '123456'; otp.setValue('654321', true);
const editor: UIRichTextEditor = document.createElement('ui-rich-text-editor');
editor.value = '<p>Text</p>'; editor.setLink('https://example.com');
const table: UIDataTable = document.createElement('ui-data-table');
table.data = [{ title: 'Atlas' }]; table.columns = [{ key: 'title', label: 'Title' }];
table.setFilter('Atlas'); table.go(1);
const tree: UITreeView = document.createElement('ui-tree-view');
tree.data = [{ id: 'root', label: 'Root', children: [{ id: 'child', label: 'Child' }] }];
tree.expanded = ['root']; tree.move('child', 'root');
const split: UISplitPanel = document.createElement('ui-split-panel'); split.ratio = 40;
const stepper: UIStepper = document.createElement('ui-stepper');
stepper.nextStep(); stepper.previous();
const timeline: UITimeline = document.createElement('ui-timeline');
const rating: UIRating = document.createElement('ui-rating'); rating.value = 4.5;
const skeleton: UISkeleton = document.createElement('ui-skeleton');
const empty: UIEmptyState = document.createElement('ui-empty-state');
const tour: UITour = document.createElement('ui-tour');
tour.steps = [{ selector: '#save', title: 'Save', description: 'Save your changes' }];
tour.start(); tour.end();
const files: File[] = document.createElement('ui-file-upload').files;
void color; void upload; void combo; void multi; void number; void otp; void editor;
void table; void tree; void split; void stepper; void timeline; void rating; void skeleton; void empty; void tour; void files;
