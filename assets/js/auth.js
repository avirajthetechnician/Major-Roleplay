const MAJOR_INTERNAL_EMAIL_DOMAIN='major-roleplay.local';
function majorClient(){
  if(!window.supabase?.createClient) throw new Error('Supabase library failed to load.');
  const key=window.MAJOR_SUPABASE_ANON_KEY;
  if(!key || key.startsWith('PASTE_')) throw new Error('Supabase publishable key is not configured yet.');
  return window.supabase.createClient(window.MAJOR_SUPABASE_URL,key);
}
function usernameToEmail(username){return username.trim().toLowerCase()+'@'+MAJOR_INTERNAL_EMAIL_DOMAIN;}
async function refreshAccount(){
  const els=document.querySelectorAll('[data-auth-state]');
  if(!els.length) return;
  try{
    const sb=majorClient();
    const {data:{user}}=await sb.auth.getUser();
    els.forEach(el=>{
      if(user){
        const name=user.user_metadata?.username || user.email?.split('@')[0] || 'Member';
        el.innerHTML=`<span class="auth-user">${escapeHtml(name)}</span><a href="admin.html" data-admin-link style="display:none">Admin</a><button class="auth-logout" data-logout>Log out</button>`;
        sb.from('profiles').select('role').eq('id',user.id).maybeSingle().then(({data})=>{if(data?.role==='admin'||data?.role==='moderator') el.querySelector('[data-admin-link]')?.style.setProperty('display','inline')});
      }else el.innerHTML='<a href="auth.html">Log in</a><a class="signup" href="register.html">Sign up</a>';
    });
    document.querySelectorAll('[data-logout]').forEach(b=>b.onclick=async()=>{await sb.auth.signOut();location.reload()});
  }catch(e){console.warn(e.message)}
}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
async function loginForm(){
  const form=document.querySelector('#login-form'); if(!form) return;
  form.addEventListener('submit',async e=>{e.preventDefault();const msg=document.querySelector('#auth-message');try{const sb=majorClient();const {error}=await sb.auth.signInWithPassword({email:usernameToEmail(form.username.value),password:form.password.value});if(error) throw error;location.href=new URLSearchParams(location.search).get('next')||'forum.html'}catch(err){msg.textContent='Invalid username or password.';msg.className='auth-message error'}});
}
async function registerForm(){
  const form=document.querySelector('#register-form'); if(!form) return;
  form.addEventListener('submit',async e=>{e.preventDefault();const msg=document.querySelector('#auth-message');const username=form.username.value.trim().toLowerCase();if(!/^[a-z0-9_.-]{3,24}$/.test(username)){msg.textContent='Username must be 3–24 characters and use only letters, numbers, ., _, or -.';msg.className='auth-message error';return}if(form.password.value!==form.password2.value){msg.textContent='Passwords do not match.';msg.className='auth-message error';return}try{const sb=majorClient();const {data,error}=await sb.auth.signUp({email:usernameToEmail(username),password:form.password.value,options:{data:{username}}});if(error) throw error;msg.textContent='Account created. Redirecting…';msg.className='auth-message success';setTimeout(()=>location.href='forum.html',500)}catch(err){msg.textContent=err.message;msg.className='auth-message error'}});
}
document.addEventListener('DOMContentLoaded',()=>{refreshAccount();loginForm();registerForm()});
