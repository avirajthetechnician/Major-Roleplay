function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
function normalizeForumUrl(){
  const url=new URL(location.href);
  if((url.pathname.endsWith('/forum-category.html')||url.pathname.endsWith('/post-thread.html'))&&url.searchParams.has('id')){
    const target=url.pathname.endsWith('/forum-category.html')?'category_id':'category_id';
    if(!url.searchParams.has(target)){url.searchParams.set(target,url.searchParams.get('id'));url.searchParams.delete('id');history.replaceState(null,'',url.pathname+url.search)}
  }
}
normalizeForumUrl();
async function initForumAuth(){
  document.querySelectorAll('.forum-account a,.account a').forEach(a=>{
    const text=a.textContent.trim().toLowerCase();
    if(text==='log in') a.href='auth.html';
    if(text==='sign up') a.href='register.html';
  });
  try{
    if(!window.supabase?.createClient) await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    if(!window.MAJOR_SUPABASE_URL) await loadScript('assets/js/supabase-config.js');
    if(!window.refreshAccount) await loadScript('assets/js/auth.js');
    if(window.refreshAccount&&!window.__majorAuthInitialized){window.__majorAuthInitialized=true;await window.refreshAccount()}
  }catch(e){console.warn('Forum authentication is not configured yet:',e.message)}
}
document.addEventListener('DOMContentLoaded',()=>{
  normalizeForumUrl();
  document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));
  const search=document.querySelector('.search');
  if(search){const rows=[...document.querySelectorAll('.thread-row')];search.addEventListener('input',()=>{const q=search.value.toLowerCase();rows.forEach(row=>row.style.display=row.textContent.toLowerCase().includes(q)?'grid':'none')})}
  initForumAuth();
});