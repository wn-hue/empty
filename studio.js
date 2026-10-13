/* Presentation-only read model. No writes to payroll or schedule storage. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);let frame=0;
 const names={DAY:'주간',NIGHT:'야간',OFF:'휴무',SPECIAL_DAY:'주특',SPECIAL_NIGHT:'야특',SPECIAL_DAY_NO_OT:'주특 잔업X',SPECIAL_NIGHT_NO_OT:'야특 잔업X'};
 const dateLabel=d=>new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'short'}).format(d);
 function update(){
  const now=new Date(),tomorrow=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1),today=getActualShift(now,currentGroup),next=getActualShift(tomorrow,currentGroup);
  $('studio-today-date').textContent=dateLabel(now);$('studio-today-shift').textContent=today.name;$('studio-group-chip').textContent=currentGroup+'조';$('studio-tomorrow').textContent='내일은 '+next.name;$('studio-today-symbol').textContent=today.type.includes('NIGHT')||today.origType==='NIGHT'?'☾':today.type==='OFF'?'◌':'☀';
  const counts={day:0,night:0,off:0},year=currentCalDate.getFullYear(),month=currentCalDate.getMonth(),last=new Date(year,month+1,0).getDate();
  for(let n=1;n<=last;n++){const s=getActualShift(new Date(year,month,n),currentGroup);const base=s.origType||s.type;if(base.includes('NIGHT'))counts.night++;else if(base==='OFF')counts.off++;else counts.day++;}
  const list=$('studio-month-counts');list.replaceChildren();
  for(const [key,label] of [['day','주간'],['night','야간'],['off','휴무']]){const el=document.createElement('div'),title=document.createElement('span'),value=document.createElement('strong'),unit=document.createElement('small');title.textContent=label;value.textContent=counts[key];unit.textContent='일';el.append(title,value,unit);list.append(el);}
  const upcoming=$('studio-upcoming');upcoming.replaceChildren();
  for(let n=1;n<=3;n++){const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+n),s=getActualShift(d,currentGroup),row=document.createElement('div'),label=document.createElement('span'),value=document.createElement('strong');row.className='studio-upcoming-row';label.textContent=dateLabel(d);value.textContent=names[s.type]||s.name;row.append(label,value);upcoming.append(row);}
 }
 function queue(){cancelAnimationFrame(frame);frame=requestAnimationFrame(update)}
 for(const name of ['renderCalendar','updateLeaveStats','calculatePayrollFromInputs']){const original=window[name];if(typeof original==='function')window[name]=function(...args){const result=original.apply(this,args);queue();return result};}
 window.addEventListener('load',queue);window.addEventListener('focus',queue);window.addEventListener('account:data-applied',queue);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)queue()});
 // Keep accessible navigation names synchronized with the new product language.
 const navNames={'bnav-cal':'근무','bnav-pay':'급여','bnav-menu':'식단','account-menu-button':'내 공간'};
 for(const [id,label] of Object.entries(navNames))$(id).setAttribute('aria-label',label);
 const show=ShiftUI.showView;ShiftUI.showView=function(view){const result=show(view);if(view!=='calendar')$('header-view-title').textContent={payroll:'급여',menu:'오늘 식단',all:'내 공간'}[view]||'Shift';queue();return result};
})();
