export const pad = (value) => String(value).padStart(2, '0');
export const isoDate = (date) => date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
export function parseDate(value) {
 if(value==null||value==='')return null; const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value)); if(!m)return null;
 const d=new Date(0); d.setHours(0,0,0,0); d.setFullYear(Number(m[1]),Number(m[2])-1,Number(m[3]));
 return d.getFullYear()===Number(m[1])&&d.getMonth()===Number(m[2])-1&&d.getDate()===Number(m[3])?d:null;
}
export const dateLabel=(date,locale)=>new Intl.DateTimeFormat(locale||undefined,{year:'numeric',month:'short',day:'numeric'}).format(date);
export const yearMonth=date=>date.getFullYear()*12+date.getMonth();
export function weekStartOf(value){const n=Number.parseInt(value??'0',10);return Number.isFinite(n)?Math.min(6,Math.max(0,n)):0;}
export function shiftMonth(date,amount){const d=new Date(date.getFullYear(),date.getMonth()+amount,1);d.setDate(Math.min(date.getDate(),new Date(d.getFullYear(),d.getMonth()+1,0).getDate()));return d;}
export function isDateWithinBounds(date,minValue='',maxValue=''){
 if(!(date instanceof Date)||Number.isNaN(date.getTime()))return false;const min=parseDate(minValue),max=parseDate(maxValue);if(min&&max&&min>max)return false;
 const value=isoDate(date);return(!min||value>=isoDate(min))&&(!max||value<=isoDate(max));
}
export function clampDateToBounds(date,minValue='',maxValue=''){
 if(!(date instanceof Date)||Number.isNaN(date.getTime()))return null;const min=parseDate(minValue),max=parseDate(maxValue);if(min&&max&&min>max)return null;
 if(min&&isoDate(date)<isoDate(min))return min;if(max&&isoDate(date)>isoDate(max))return max;return date;
}
