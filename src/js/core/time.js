import {pad} from './date.js';
export function parseTime(value){const m=/^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value||''));return m?{hour:Number(m[1]),minute:Number(m[2])}:null;}
export const defaultTime=()=>({hour:9,minute:0});
export function parseTypedTime(raw){const v=String(raw||'').trim();let m=/^([01]?\d|2[0-3]):([0-5]\d)$/.exec(v);if(m)return{hour:Number(m[1]),minute:Number(m[2])};m=/^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i.exec(v);return m?{hour:Number(m[1])%12+(m[3].toUpperCase()==='PM'?12:0),minute:Number(m[2])}:null;}
export function normalizeTimeStep(value){const n=Number(value||5);return Number.isInteger(n)&&n>=1&&n<=30?n:5;}
export function formatTime(time,twelveHour=false){const h=Number(time?.hour)||0,m=Number(time?.minute)||0,display=twelveHour?(h+11)%12+1:h;return(twelveHour?String(display):pad(display))+':'+pad(m)+(twelveHour?(h<12?' AM':' PM'):'');}
