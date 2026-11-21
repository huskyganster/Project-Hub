/* PROJECT//HUB 3.0 / fictional, interactive boot + crash + reboot animations.
   No device actions are performed. This code never downloads or executes a real .exe.
*/
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const boot=$('boot'),site=$('site'),terminal=$('terminal-screen');
  if(!boot||!site)return;
  const screens=['terminal-screen','loading-screen','crash-screen','reboot-screen','success-screen'];
  const motionReduced=matchMedia('(prefers-reduced-motion: reduce)');
  const typedScript = [
    'struct group_info init_groups = { .usage = ATOMIC_INIT(2) };',
    '',
    'struct group_info *groups_alloc(int gidsetsize) {',
    '    struct group_info *group_info;',
    '    int nblocks;',
    '    int i;',
    '',
    '    nblocks = (gidsetsize + NGROUPS_PER_BLOCK - 1) / NGROUPS_PER_BLOCK;',
    '    /* Allocate at least one indirect block pointer */',
    '    nblocks = nblocks ? : 1;',
    '    group_info = kmalloc(sizeof(*group_info) + nblocks * sizeof(gid_t *), GFP_USER);',
    '    if (!group_info) return NULL;',
    '',
    '    group_info->ngroups = gidsetsize;',
    '    group_info->nblocks = nblocks;',
    '    atomic_set(&group_info->usage, 1);',
    '    return group_info;',
    '}',
    '',
    '/* HUSKYGANSTER VIRTUAL ENVIRONMENT */',
    '#include <projecthub/core.h>',
    '#include <archive/manifest.h>',
    '',
    'typedef struct {',
    '    const char *creator;',
    '    unsigned int releases;',
    '    bool interactive;',
    '} PROJECTHUB_CONFIG;',
    '',
    'PROJECTHUB_CONFIG hub = {',
    '    .creator = "Huskyganster",',
    '    .releases = 1,',
    '    .interactive = true',
    '};',
    '',
    'int main(void) {',
    '    verify_manifest("PROJECTHUB.EXE");',
    '    import_modules("projects/*");',
    '    mount_archive("THE_RED_BUTTON");',
    '    initialize_visual_runtime();',
    '    return READY_TO_EXECUTE;',
    '}',
    '',
    '>>> MODULE IMPORT COMPLETE',
    '>>> AWAITING OPERATOR CONFIRMATION [ENTER]'
  ].join('\n');
  const seed='struct group_info init_groups = { .usage = ATOMIC_INIT(2) };\n\n';
  const typingStart=seed.length;
  const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints>1&&/MacIntel/.test(navigator.platform));
  const increments=Math.max(1,Math.ceil((typedScript.length-typingStart)/(mobile?22:45)));
  let charCount=typingStart,stage='idle',active=false,idleTimer=0,scheduled=[],loaderFrame=0,soundOn=false,audioContext;
  let platform='unknown',winVersion='10';
  const ua=navigator.userAgent||'';
  if(/iPad|iPhone|iPod/.test(ua))platform='ios';
  else if(/MacIntel/i.test(navigator.platform)&&navigator.maxTouchPoints>1)platform='ios';
  else if(/Android/i.test(ua))platform='android';
  else if(/Windows/i.test(ua))platform='windows';
  else if(/Macintosh|Mac OS X/i.test(ua))platform='mac';
  else if(/Linux|X11/i.test(ua))platform='linux';
  // Windows 10 and 11 share common UA values. Only distinguish when the browser
  // explicitly exposes platformVersion; otherwise use the recognizable Win10-style fallback.
  if(platform==='windows'&&navigator.userAgentData?.getHighEntropyValues){
    navigator.userAgentData.getHighEntropyValues(['platformVersion']).then(data=>{
      if(parseInt(data.platformVersion,10)>=13)winVersion='11';
    }).catch(()=>{});
  }
  const later=(fn,ms)=>{const id=setTimeout(fn,ms);scheduled.push(id);return id;};
  function clearTasks(){scheduled.forEach(clearTimeout);scheduled=[];clearTimeout(idleTimer);cancelAnimationFrame(loaderFrame);}
  function show(screen){screens.forEach(name=>$(name).hidden=name!==screen);}
  function sound(freq=360,dur=.04,type='square',gain=.014){
    if(!soundOn)return;
    try{
      audioContext ||= new (window.AudioContext||window.webkitAudioContext)();
      if(audioContext.state==='suspended')audioContext.resume();
      const oscillator=audioContext.createOscillator(),volume=audioContext.createGain();
      oscillator.type=type;oscillator.frequency.value=freq;volume.gain.value=gain;
      volume.gain.setTargetAtTime(.0001,audioContext.currentTime+.008,Math.max(.008,dur/5));
      oscillator.connect(volume);volume.connect(audioContext.destination);
      oscillator.start();oscillator.stop(audioContext.currentTime+dur);
    }catch{}
  }
  function idleStart(){
    clearTimeout(idleTimer);
    if(stage!=='terminal'||charCount>=typedScript.length)return;
    idleTimer=setTimeout(()=>{
      if(stage!=='terminal'||charCount>=typedScript.length)return;
      $('hint-copy').textContent=mobile?'Tap the terminal or TAP TO TYPE to import PROJECT//HUB.':'Press any key to import PROJECT//HUB. Finish the code, then press Enter.';
      $('idle-hint').hidden=false;
      sound(420,.06,'sine',.012);
    },10000);
  }
  function advanceCode(){
    if(!active||stage!=='terminal'||charCount>=typedScript.length)return;
    $('idle-hint').hidden=true;
    charCount=Math.min(typedScript.length,charCount+increments);
    $('terminal-code').textContent=typedScript.slice(0,charCount);
    const percent=Math.floor((charCount-typingStart)/(typedScript.length-typingStart)*100);
    $('terminal-progress').textContent=percent+'% / MODULE IMPORT';
    $('terminal-interaction').scrollTop=$('terminal-interaction').scrollHeight;
    sound(290+Math.random()*180,.027,'square',.012);
    if(charCount===typedScript.length){
      clearTimeout(idleTimer);
      $('terminal-progress').textContent='100% / AWAITING EXECUTION';
      $('terminal-ready').hidden=false;
      $('mobile-tap').hidden=true;
      stage='ready';sound(860,.18,'sine',.02);
      $('execute-button').focus({preventScroll:true});
    }else idleStart();
  }
  function codeKeydown(event){
    if(!active)return;
    if(event.key==='Escape'){event.preventDefault();finish();return;}
    if(stage==='ready'&&event.key==='Enter'){
      if(event.target instanceof Element && event.target.closest('button:not(#execute-button)'))return;
      event.preventDefault();execute();return;
    }
    if(stage!=='terminal'||event.altKey||event.ctrlKey||event.metaKey)return;
    if(event.target instanceof Element && event.target.closest('button,a,input,textarea,select'))return;
    if(event.key.length===1||event.key==='Enter'||event.key==='Backspace'){
      event.preventDefault();advanceCode();
    }
  }
  document.addEventListener('keydown',codeKeydown,true);
  $('terminal-interaction').addEventListener('click',advanceCode);
  $('mobile-tap').addEventListener('click',advanceCode);
  $('hint-dismiss').addEventListener('click',()=>{$('idle-hint').hidden=true;idleStart()});
  $('execute-button').addEventListener('click',execute);
  $('skip-boot').addEventListener('click',finish);
  $('boot-sound').addEventListener('click',()=>{
    soundOn=!soundOn;
    $('boot-sound').textContent=soundOn?'SOUND ON':'SOUND OFF';
    $('boot-sound').setAttribute('aria-pressed',String(soundOn));
    if(soundOn)sound(640,.08,'sine',.025);
  });
  $('replay-boot').addEventListener('click',()=>{window.scrollTo(0,0);start(true)});
  function start(force=false){
    if(active)return;
    if(!force){try{if(sessionStorage.getItem('HUSKY_HUB_BOOT_COMPLETED_V3')==='yes'){boot.hidden=true;return;}}catch{}}
    clearTasks();active=true;stage='terminal';charCount=typingStart;
    $('terminal-code').textContent=typedScript.slice(0,charCount);
    $('terminal-interaction').scrollTop=0;
    $('terminal-progress').textContent='0% / MODULE IMPORT';
    $('terminal-ready').hidden=true;
    $('mobile-tap').hidden=!mobile;
    $('idle-hint').hidden=true;
    $('boot-flash').classList.remove('flash');boot.classList.remove('glitching');
    boot.hidden=false;show('terminal-screen');
    document.body.classList.add('boot-locked');site.classList.add('is-hidden');
    site.inert=true;
    $('terminal-interaction').focus({preventScroll:true});
    idleStart();
  }
  function execute(){
    if(!active||stage!=='ready')return;
    stage='executing';clearTimeout(idleTimer);$('idle-hint').hidden=true;
    show('loading-screen');sound(260,.25,'sawtooth',.018);
    const startTime=performance.now();
    const messages=[
      'Resolving project manifest...',
      'Importing Project #001: The Red Button...',
      'Initializing interactive environment...',
      'Synchronizing renderer and archive...',
      'Verifying PROJECTHUB.exe...' ];
    function loader(now){
      if(!active||stage!=='executing')return;
      const progress=Math.min(100,Math.floor(((now-startTime)/2400)*100));
      $('loader-fill').style.width=progress+'%';$('loader-percent').textContent=progress+'%';
      $('loader-status').textContent=messages[Math.min(messages.length-1,Math.floor(progress/23))];
      $('loader-log').textContent='> '+(progress<75?'fetching local website assets':'loading project archive from browser cache')+'...';
      if(progress<100)loaderFrame=requestAnimationFrame(loader);else later(glitch,250);
    }
    loaderFrame=requestAnimationFrame(loader);
  }
  function glitch(){
    if(!active)return;stage='glitch';
    show('terminal-screen');$('terminal-ready').hidden=true;$('mobile-tap').hidden=true;
    $('terminal-code').textContent=typedScript+'\n\n[ FATAL ] VISUAL RUNTIME CONFLICT\n[ WARN  ] SCREEN BUFFER CORRUPTED\n[ ERROR ] PROJECTHUB.EXE_HANDOFF_INTERRUPT\n\nRESTARTING VIRTUAL ENVIRONMENT...';
    $('terminal-interaction').scrollTop=$('terminal-interaction').scrollHeight;
    boot.classList.add('glitching');sound(95,.43,'sawtooth',.034);
    later(()=>{
      boot.classList.remove('glitching');
      $('boot-flash').classList.remove('flash');void $('boot-flash').offsetHeight;$('boot-flash').classList.add('flash');
      later(crash,200);
    },1100);
  }
  function crash(){
    if(!active)return;stage='crash';
    $('crash-screen').className='crash-screen boot-screen crash-'+(platform==='windows'?'win'+winVersion:platform);
    $('crash-content').innerHTML=crashHTML();show('crash-screen');sound(110,.08,'triangle',.017);
    later(reboot,platform==='ios'?2200:2800);
  }
  function crashHTML(){
    if(platform==='windows'){
      return `<div class="win-crash"><div class="win-face">:(</div><div class="win-text">Your ${winVersion==='11'?'device':'PC'} ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.</div><div class="win-percent">100% complete</div><div class="win-bottom"><div class="win-qr"><img src="images/bsod-qr.png" alt="QR code for a Huskyganster website" /></div><div><div>For more information about this issue and possible fixes, visit the PROJECT//HUB archive.</div><div class="win-small" style="margin-top:17px">If you call a support person, give them this info:</div><div class="win-small">Stop code: PROJECT_HUB_VISUAL_OVERRIDE</div></div></div></div>`;
    }
    if(platform==='mac')return `<div class="crash-inner mac-panic"><div class="panic-heading">Your computer restarted because of a problem.</div><div>Press a key or wait a few seconds to continue starting up.</div><div class="mac-hex">panic(cpu 0 caller 0xffffff8003c8a120): PROJECTHUB virtual display handoff<br>Kernel extension in backtrace: hg.projecthub.visual (3.0)<br>BSD process name corresponding to current thread: projecthub-sim<br>System uptime in nanoseconds: 0x00e3c251</div></div>`;
    if(platform==='ios')return `<div class="crash-inner iphone-fail"><div class="spinner"></div><p>Restarting visual environment…</p></div>`;
    if(platform==='android')return `<div class="crash-inner android-fail"><div class="android-error-icon">!</div><h2>System UI isn't responding</h2><p>The PROJECT//HUB visual environment encountered a problem.<br>Restarting simulated interface…</p><p style="font-size:13px;color:#999">PROJECTHUB_RUNTIME_EXCEPTION</p></div>`;
    if(platform==='linux')return `<pre class="linux-panic">[   0.000000] Linux version 6.x.x-husky #001 SMP\n[   0.042167] projecthub: initializing graphics subsystem\n[   0.148020] projecthub: registered visual device\n[   1.026841] BUG: unable to handle kernel paging request\n[   1.029551] IP: projecthub_visual_handoff+0x41/0xaf\n[   1.030131] Kernel panic - not syncing: PROJECT_HUB_VISUAL_OVERRIDE\n[   1.031691] CPU: 0 PID: 001 Comm: PROJECTHUB.exe\n[   1.043920] Rebooting simulated environment in 3 seconds...</pre>`;
    return `<div class="crash-inner mac-panic"><div class="panic-heading">VISUAL ENVIRONMENT INTERRUPTED</div><p>PROJECTHUB.exe encountered a simulated startup error.</p><p>Restarting interface...</p></div>`;
  }
  function appleSVG(){return `<svg width="115" height="137" viewBox="0 0 64 76" aria-hidden="true" fill="#fff"><path d="M41.5 12.4c3.4-3.6 3.1-8.1 3.1-8.1s-5.2.7-8.3 4.3c-2.8 3.2-2.6 7.2-2.6 7.2s4.8.5 7.8-3.4ZM55.1 54c-2 4.4-3 6.2-5.5 9.8-3.4 5.2-8.2 11.8-14 8.8-5.7-2.9-8.6-2.9-14 0-5.7 2.9-10.6-3.6-14.1-8.8C.7 53.6-4.5 38.8 1.9 28c3.2-5.4 8.7-8.8 14.6-8.8 5.8 0 9.4 3.3 14.1 3.3 4.7 0 7.6-3.3 14.2-3.3 5.1 0 10.3 2.8 13.5 7.4-12 6.7-10 24-3.2 29.4Z" transform="translate(4 0) scale(.85 1)"/></svg>`;}
  function reboot(){
    if(!active)return;stage='reboot';$('reboot-content').innerHTML=rebootHTML();show('reboot-screen');sound(460,.13,'sine',.02);
    later(success,platform==='linux'?2700:3000);
  }
  function rebootHTML(){
    if(platform==='windows')return `<div class="reboot-center"><div class="win-mark reboot-os-logo"><i></i><i></i><i></i><i></i></div><div class="windows-dots"><i></i><i></i><i></i></div><div class="reboot-label">STARTING VIRTUAL PROJECT ENVIRONMENT</div></div>`;
    if(platform==='mac'||platform==='ios')return `<div class="reboot-center"><div class="reboot-os-logo">${appleSVG()}</div><div class="reboot-loader"><span></span></div><div class="reboot-label">PROJECT//HUB VISUAL STARTUP</div></div>`;
    if(platform==='android')return `<div class="reboot-center"><div class="android-mark reboot-os-logo"><b>●</b> android</div><div class="windows-dots"><i></i><i></i><i></i></div><div class="reboot-label">STARTING PROJECT//HUB</div></div>`;
    if(platform==='linux')return `<div class="linux-mark reboot-os-logo">[  OK  ] Started Project Hub runtime<br>[  OK  ] Mounted project archive<br>[  OK  ] Loaded interactive graphics<br>[  OK  ] Connected to release index<br><br>huskyganster login: <b style="color:#fff">projecthub</b><br>Launching graphical environment... █</div>`;
    return `<div class="reboot-center"><div class="loader-symbol">//</div><div class="reboot-loader"><span></span></div><div class="reboot-label">STARTING PROJECT//HUB</div></div>`;
  }
  function success(){
    if(!active)return;stage='success';show('success-screen');sound(760,.22,'sine',.03);
    later(finish,1550);
  }
  function finish(){
    clearTasks();active=false;stage='finished';boot.classList.remove('glitching');
    document.body.classList.remove('boot-locked');site.inert=false;
    site.classList.remove('is-hidden');boot.hidden=true;
    try{sessionStorage.setItem('HUSKY_HUB_BOOT_COMPLETED_V3','yes')}catch{}
    // Ensure the page isn't scrolled down after the boot overlay disappears.
    if(window.scrollY>0&&stage==='finished')window.scrollTo({top:0,left:0,behavior:'instant'});
  }
  window.HUB_REPLAY_BOOT=()=>start(true);
  start(false);
})();
