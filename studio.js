/* Mobile app shell; calculation and persistence stay in the domain modules. */
(()=>{'use strict';
 const labels={'bnav-cal':'근무','bnav-pay':'급여','bnav-menu':'식단','account-menu-button':'내 메뉴'};
 for(const [id,label] of Object.entries(labels)){const el=document.getElementById(id);el.setAttribute('aria-label',label);el.querySelector('.nav-visual>span').textContent=label;}
 const show=ShiftUI.showView;
 ShiftUI.showView=function(view){const result=show(view);if(view!=='calendar')document.getElementById('header-view-title').textContent={payroll:'급여',menu:'오늘 식단',all:'내 메뉴'}[view]||'Shift';for(const id of Object.keys(labels)){const el=document.getElementById(id);if(el.classList.contains('active'))el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');}return result;};
})();
