(function(root){
  'use strict';
  const VERSION='1.0.0';
  const STORAGE_PROFILES='vceDeploymentProfilesV1';
  const STORAGE_ACTIVE='vceDeploymentActiveV1';
  const STORAGE_TESTED='vceDeploymentTestedV1';
  const currentOrigin=(root.location&&root.location.origin)?root.location.origin:(root.location.protocol+'//'+root.location.host);
  const currentPath=(root.location&&root.location.pathname)?root.location.pathname:'/';
  const currentDirectory=new URL(currentPath.endsWith('/')?currentPath:currentPath.replace(/[^/]*$/,''),currentOrigin+'/').href;
  const bundled={
    LOCAL:{label:'Local test server',baseUrl:currentDirectory,paths:{webapp:'webapp_team_evento_C22A_DEF_MISSION_AGGREGATE_STATUS_R2_INTEGRATION.html',gmc:'gmc_core_evento_R4_2_PHASE2_RUNTIME_BONUS_CONSOLIDATED_CANDIDATE_9.html',liveScreen:'battle_live_screen_evento_CANDIDATE_01.html'}},
    GITHUB_PAGES:{label:'GitHub Pages',baseUrl:'https://CONFIGURE.example/repository/',paths:{webapp:'index.html',gmc:'gmc/index.html',liveScreen:'live/index.html'}}
  };
  const clone=v=>JSON.parse(JSON.stringify(v));
  function normId(v){return String(v||'').trim().toUpperCase()}
  function normalizeBaseUrl(v){const u=new URL(String(v||'').trim());if(!/^https?:$/.test(u.protocol))throw Error('Only HTTP/HTTPS deployments are supported.');if(!u.pathname.endsWith('/'))u.pathname+='/';u.search='';u.hash='';return u.href}
  function validateProfile(p){if(!p||typeof p!=='object')throw Error('Deployment profile required.');const baseUrl=normalizeBaseUrl(p.baseUrl);const paths=p.paths||{};for(const k of ['webapp','gmc','liveScreen']){if(typeof paths[k]!=='string'||!paths[k].trim())throw Error('Missing deployment path: '+k);if(paths[k].startsWith('/'))throw Error('Deployment paths must be relative: '+k)}return {label:String(p.label||'Deployment').trim(),baseUrl,paths:{webapp:paths.webapp.trim(),gmc:paths.gmc.trim(),liveScreen:paths.liveScreen.trim()}}}
  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'');return v&&typeof v==='object'?v:fallback}catch{return fallback}}
  function custom(){return readJson(STORAGE_PROFILES,{})}
  function profiles(){const c=custom();delete c.LOCAL;delete c.GITHUB_PAGES;return {...clone(bundled),...c}}
  function activeId(){const id=normId(localStorage.getItem(STORAGE_ACTIVE)||'LOCAL');return profiles()[id]?id:'LOCAL'}
  function get(id){id=normId(id||activeId());const p=profiles()[id];if(!p)throw Error('Unknown deployment profile: '+id);return Object.freeze({id,...validateProfile(p),testedAt:readJson(STORAGE_TESTED,{})[id]||null})}
  function getActive(){return get(activeId())}
  function saveProfile(id,label,baseUrl,paths){id=normId(id);if(!/^[A-Z0-9_-]{2,32}$/.test(id)||['LOCAL','GITHUB_PAGES'].includes(id))throw Error('Invalid or reserved deployment ID.');const p=validateProfile({label,baseUrl,paths});const c=custom();c[id]=p;localStorage.setItem(STORAGE_PROFILES,JSON.stringify(c));return id}
  function saveBundledProfile(id,baseUrl,paths){id=normId(id);if(id!=='GITHUB_PAGES')throw Error('Only GITHUB_PAGES can be configured as bundled profile.');const p=validateProfile({label:'GitHub Pages',baseUrl,paths});const c=custom();c.__GITHUB_PAGES_OVERRIDE=p;localStorage.setItem(STORAGE_PROFILES,JSON.stringify(c));return id}
  function effectiveProfiles(){const p=profiles(),c=custom();if(c.__GITHUB_PAGES_OVERRIDE)p.GITHUB_PAGES=c.__GITHUB_PAGES_OVERRIDE;delete p.__GITHUB_PAGES_OVERRIDE;return p}
  function getEffective(id){id=normId(id||activeId());const p=effectiveProfiles()[id];if(!p)throw Error('Unknown deployment profile: '+id);return Object.freeze({id,...validateProfile(p),testedAt:readJson(STORAGE_TESTED,{})[id]||null})}
  function buildUrl(kind,{battleId,teamId,profileId}={}){const p=getEffective(profileId),path=p.paths[kind];if(!path)throw Error('Unknown deployment URL kind: '+kind);const u=new URL(path,p.baseUrl);if(battleId)u.searchParams.set('battle',battleId);if(teamId)u.searchParams.set('team',teamId);return u.href}
  async function testProfile(id,battleId='test_vce_xmas_quest'){const p=getEffective(id);const tests=[];for(const kind of ['webapp','gmc','liveScreen']){const url=buildUrl(kind,{profileId:p.id,battleId,teamId:kind==='webapp'?'alpha':undefined});let ok=false,status='UNREACHABLE';try{const r=await fetch(url,{method:'GET',cache:'no-store'});ok=r.ok;status=String(r.status)}catch(e){status=e.message}tests.push({kind,url,ok,status})}const allPass=tests.every(x=>x.ok);if(allPass){const t=readJson(STORAGE_TESTED,{});t[p.id]=new Date().toISOString();localStorage.setItem(STORAGE_TESTED,JSON.stringify(t))}return {profileId:p.id,allPass,tests}}
  function setActive(id){const p=getEffective(id),tested=readJson(STORAGE_TESTED,{});if(!tested[p.id])throw Error('Profile must PASS TEST before activation.');localStorage.setItem(STORAGE_ACTIVE,p.id);return getEffective(p.id)}
  function removeProfile(id){id=normId(id);if(['LOCAL','GITHUB_PAGES'].includes(id))throw Error('Bundled profile cannot be removed.');const c=custom();delete c[id];localStorage.setItem(STORAGE_PROFILES,JSON.stringify(c));if(activeId()===id)localStorage.setItem(STORAGE_ACTIVE,'LOCAL')}
  root.VCEDeploymentEnvironment=Object.freeze({version:VERSION,profiles:effectiveProfiles,activeId,get:getEffective,getActive,saveProfile,saveBundledProfile,testProfile,setActive,removeProfile,buildUrl,validateProfile});
})(window);
