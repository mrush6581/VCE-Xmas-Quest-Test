(function(){
  'use strict';

  const LAYER_VERSION='2.0.0';
  const DEFAULT_ENVIRONMENT='PRODUCTION';
  const STORAGE_PROFILES='vceFirebaseProfilesV1';
  const STORAGE_ACTIVE='vceFirebaseActiveEnvironmentV1';
  const STORAGE_LAYER_VERSION='vceFirebaseEnvironmentLayerVersion';
  const required=['apiKey','authDomain','databaseURL','projectId','storageBucket','messagingSenderId','appId'];

  const bundled={
    PRODUCTION:{
      label:'VCE Battle Engine',
      firebaseConfig:{
        apiKey:'AIzaSyAP7PxJygx1c31Q1Ib6PoZlSrYKmhWIvWg',
        authDomain:'vce-battle-engine.firebaseapp.com',
        databaseURL:'https://vce-battle-engine-default-rtdb.europe-west1.firebasedatabase.app',
        projectId:'vce-battle-engine',
        storageBucket:'vce-battle-engine.firebasestorage.app',
        messagingSenderId:'245788115859',
        appId:'1:245788115859:web:d089a120076b0f7bdb9e66'
      }
    },
    LEGACY:{
      label:'Firebase originale',
      firebaseConfig:{
        apiKey:'AIzaSyDZ2lOLfL-zW23r3Tnvt-3XyBudAfnlml4',
        authDomain:'vce-xmas-quest.firebaseapp.com',
        databaseURL:'https://vce-xmas-quest-default-rtdb.europe-west1.firebasedatabase.app',
        projectId:'vce-xmas-quest',
        storageBucket:'vce-xmas-quest.firebasestorage.app',
        messagingSenderId:'459157919089',
        appId:'1:459157919089:web:5718b06601c54ebf7d92d0'
      }
    }
  };

  function readCustom(){
    try{
      const value=JSON.parse(localStorage.getItem(STORAGE_PROFILES)||'{}');
      return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    }catch{return {}}
  }

  function profiles(){
    const custom=readCustom();
    /* Bundled profiles are authoritative: local data cannot replace PRODUCTION or LEGACY. */
    delete custom.PRODUCTION;
    delete custom.LEGACY;
    delete custom.PRIMARY;
    return {...bundled,...custom};
  }

  function validateConfig(cfg){
    const missing=required.filter(k=>typeof cfg?.[k]!=='string'||!cfg[k].trim());
    if(missing.length)throw new Error('Configurazione Firebase incompleta: '+missing.join(', '));
    if(!/^https:\/\//.test(cfg.databaseURL))throw new Error('databaseURL non valida');
    return true;
  }

  function migrateSelection(){
    const previousVersion=localStorage.getItem(STORAGE_LAYER_VERSION);
    const stored=String(localStorage.getItem(STORAGE_ACTIVE)||'').trim().toUpperCase();
    if(previousVersion!==LAYER_VERSION){
      /* PRIMARY belonged to v1 and must never remain an accidental default. */
      if(!stored||stored==='PRIMARY')localStorage.setItem(STORAGE_ACTIVE,DEFAULT_ENVIRONMENT);
      localStorage.setItem(STORAGE_LAYER_VERSION,LAYER_VERSION);
    }
  }

  function activeId(){
    migrateSelection();
    const stored=String(localStorage.getItem(STORAGE_ACTIVE)||DEFAULT_ENVIRONMENT).trim().toUpperCase();
    return profiles()[stored]?stored:DEFAULT_ENVIRONMENT;
  }

  function getActive(){
    const id=activeId(),profile=profiles()[id];
    if(!profile)throw new Error(`Ambiente Firebase "${id}" non trovato.`);
    validateConfig(profile.firebaseConfig);
    return Object.freeze({id,label:profile.label||id,firebaseConfig:Object.freeze({...profile.firebaseConfig})});
  }

  function saveProfile(id,label,cfg){
    id=String(id||'').trim().toUpperCase();
    if(!/^[A-Z0-9_-]{2,32}$/.test(id)||['PRODUCTION','LEGACY','PRIMARY'].includes(id))throw new Error('ID ambiente non valido o riservato');
    validateConfig(cfg);
    const custom=readCustom();
    custom[id]={label:String(label||id).trim(),firebaseConfig:{...cfg}};
    localStorage.setItem(STORAGE_PROFILES,JSON.stringify(custom));
    return id;
  }

  function setActive(id){
    id=String(id||'').trim().toUpperCase();
    if(!profiles()[id])throw new Error('Ambiente inesistente: '+id);
    localStorage.setItem(STORAGE_ACTIVE,id);
    localStorage.setItem(STORAGE_LAYER_VERSION,LAYER_VERSION);
    return getActive();
  }

  function removeProfile(id){
    id=String(id||'').trim().toUpperCase();
    if(['PRODUCTION','LEGACY','PRIMARY'].includes(id))throw new Error('Profilo integrato non eliminabile');
    const custom=readCustom();
    delete custom[id];
    localStorage.setItem(STORAGE_PROFILES,JSON.stringify(custom));
    if(activeId()===id)localStorage.setItem(STORAGE_ACTIVE,DEFAULT_ENVIRONMENT);
  }

  window.VCEFirebaseEnvironment=Object.freeze({
    layerVersion:LAYER_VERSION,
    defaultEnvironment:DEFAULT_ENVIRONMENT,
    profiles,activeId,getActive,saveProfile,setActive,removeProfile,validateConfig,required:[...required]
  });
})();
