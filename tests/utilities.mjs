import assert from 'node:assert/strict';
import {parseDate,isoDate,shiftMonth,isDateWithinBounds,clampDateToBounds} from '../src/js/core/date.js';
import {parseTime,parseTypedTime,normalizeTimeStep,formatTime} from '../src/js/core/time.js';
assert.equal(parseDate('2026-02-29'),null);assert.equal(isoDate(parseDate('2024-02-29')),'2024-02-29');assert.equal(isoDate(shiftMonth(parseDate('2026-03-31'),-1)),'2026-02-28');
assert.equal(isDateWithinBounds(parseDate('2026-11-10'),'2026-11-10','2026-11-20'),true);assert.equal(isDateWithinBounds(parseDate('2026-11-21'),'2026-11-10','2026-11-20'),false);assert.equal(isDateWithinBounds(parseDate('2026-11-15'),'2026-11-20','2026-11-10'),false);
assert.equal(isoDate(clampDateToBounds(parseDate('2026-11-01'),'2026-11-10','2026-11-20')),'2026-11-10');assert.equal(clampDateToBounds(parseDate('2026-11-15'),'2026-11-20','2026-11-10'),null);
assert.deepEqual(parseTime('23:59'),{hour:23,minute:59});assert.equal(parseTime('24:00'),null);assert.deepEqual(parseTypedTime('3:45 PM'),{hour:15,minute:45});assert.deepEqual(parseTypedTime('12:00 AM'),{hour:0,minute:0});assert.equal(parseTypedTime('13:00 PM'),null);assert.equal(normalizeTimeStep('7.5'),5);assert.equal(normalizeTimeStep('15'),15);assert.equal(formatTime({hour:0,minute:5},true),'12:05 AM');
console.log('Date and time utility checks passed.');
