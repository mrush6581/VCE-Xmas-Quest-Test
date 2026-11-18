/* VCE Xmas Quest C22A Runtime Bonus Lifecycle Controller - CANDIDATE R2
 * Pure planner. Adds an atomic audit envelope compatible with Monitor v3.3.1.
 * No Firebase access, timestamps, randomness, or environment access.
 */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VCEC22ABonusLifecycle=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const CONTRACT='C22A_RUNTIME_BONUS_LIFECYCLE_V2';
 function E(code,msg,details){this.name='C22ABonusLifecycleError';this.code=code;this.message=msg;this.details=details||null;if(Error.captureStackTrace)Error.captureStackTrace(this,E)} E.prototype=Object.create(Error.prototype);E.prototype.constructor=E;
 const fail=(c,m,d)=>{throw new E(c,m,d)};
 const obj=(v,p)=>{if(!v||Object.prototype.toString.call(v)!=='[object Object]')fail('INVALID_OBJECT',p+' must be an object');return v};
 const text=(v,p)=>{if(typeof v!=='string'||!v.trim())fail('INVALID_STRING',p+' must be non-empty');return v.trim()};
 const integer=(v,p,min)=>{if(!Number.isInteger(v)||v<min)fail('INVALID_INTEGER',p+' must be integer >= '+min);return v};
 const freeze=v=>{if(!v||typeof v!=='object'||Object.isFrozen(v))return v;Object.keys(v).forEach(k=>freeze(v[k]));return Object.freeze(v)};
 function plan(action,state,audit){obj(state,'state');obj(audit,'audit');action=text(action,'action').toUpperCase();const bonusId=text(state.bonusId,'state.bonusId');const battle=text(state.battleStatus,'state.battleStatus').toUpperCase();const mission=text(state.missionStatus,'state.missionStatus').toUpperCase();const gen=integer(state.runtimeGeneration,'state.runtimeGeneration',1);const targets=(state.targetTeamIds||[]).slice().sort();const all=(state.allTeamIds||[]).slice().sort();if(!targets.length||!all.length)fail('INVALID_TEAM_SET','targetTeamIds/allTeamIds required');if(new Set(targets).size!==targets.length||new Set(all).size!==all.length)fail('DUPLICATE_TEAM','Duplicate Team ID');if(targets.some(x=>!all.includes(x)))fail('UNKNOWN_TARGET_TEAM','target not in allTeamIds');
  const controls=obj(state.controls,'state.controls');all.forEach(id=>{const c=obj(controls[id],'state.controls.'+id);integer(c.commandRevision,'commandRevision',1);if(typeof c.acceptingAnswers!=='boolean')fail('INVALID_CONTROL','acceptingAnswers boolean required')});
  if(battle!=='ACTIVE')fail('BATTLE_STATE_NOT_ALLOWED','Lifecycle mutation allowed only in ACTIVE');
  let next;if(action==='PUBLISH'&&mission==='LOCKED')next='PUBLISHED';else if(action==='CLOSE'&&mission==='PUBLISHED')next='CLOSED';else if(action==='REOPEN'&&mission==='CLOSED')next='PUBLISHED';else fail('INVALID_TRANSITION',mission+' -> '+action+' not allowed');
  const operationId=text(audit.operationId,'audit.operationId');if(!/^[A-Za-z0-9_-]{8,128}$/.test(operationId))fail('INVALID_OPERATION_ID','audit.operationId format invalid');
  const writer=text(audit.writer,'audit.writer');if(writer!=='C22A_LIFECYCLE_RUNNER')fail('INVALID_WRITER','writer must be C22A_LIFECYCLE_RUNNER');
  const organizerInstanceId=text(audit.organizerInstanceId,'audit.organizerInstanceId');const organizerSessionId=audit.organizerSessionId==null?null:text(audit.organizerSessionId,'audit.organizerSessionId');const appVersion=text(audit.appVersion,'audit.appVersion');
  const envelope=freeze({operationId,writer,organizerInstanceId,organizerSessionId,appVersion,command:action,bonusId,from:mission,to:next,runtimeGeneration:gen});
  const updates={};updates['publicMissions/'+bonusId+'/status']=next;all.forEach(id=>{const assigned=targets.includes(id);updates['teamRuntime/'+id+'/control/missions/'+bonusId]={acceptingAnswers:next==='PUBLISHED'&&assigned,commandRevision:controls[id].commandRevision+1}});updates['missionLastCommands/'+bonusId]=envelope;updates['mutationAudit/'+operationId]=envelope;
  const ordered={};Object.keys(updates).sort().forEach(k=>ordered[k]=updates[k]);return freeze({contract:CONTRACT,action,bonusId,runtimeGeneration:gen,from:mission,to:next,targetTeamIds:targets,operationId,updates:ordered});
 }
 return Object.freeze({contract:CONTRACT,planLifecycleTransition:plan,Error:E});
});
