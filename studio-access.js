/* Fail clearly at setup boundaries, rather than sending users to a JSON error page. */
(()=>{const status=document.getElementById('apple-login-status');let busy=false;
 document.getElementById('account-login').addEventListener('click',async event=>{
  event.preventDefault();if(busy)return;busy=true;status.textContent='로그인 연결 확인 중…';
  try{const r=await fetch('/api/google-calendar?action=status',{cache:'no-store',signal:AbortSignal.timeout(12000)}),data=await r.json();
   if(!r.ok||!data.configured){status.textContent='이 테스트 앱의 Google 로그인이 아직 설정되지 않았습니다. 설정이 완료되면 계정 동기화를 사용할 수 있어요.';return;}
   location.assign(event.currentTarget?.href||document.getElementById('account-login').href);
  }catch{status.textContent='로그인 연결을 확인하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.';}finally{busy=false;}
 });
})();
