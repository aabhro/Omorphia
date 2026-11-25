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
