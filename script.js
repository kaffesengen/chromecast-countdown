const ctx = cast.framework.CastReceiverContext.getInstance();
const playerManager = ctx.getPlayerManager();
const state = { target: null, finished: false };

// 24-timers klokke i hjørnet
setInterval(() => { 
    const now = new Date();
    const timeStr = now.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    document.getElementById('wall-clock').innerText = timeStr; 
}, 1000);

playerManager.setMessageInterceptor(cast.framework.messages.MessageType.LOAD, (data) => {
    const cd = data.customData || {};
    state.target = cd.targetEpoch;
    state.finished = false;
    
    document.body.classList.remove('is-done');
    document.documentElement.style.setProperty('--flash-opacity', '0');

    if (cd.backgroundColors) {
        const r = document.documentElement;
        cd.backgroundColors.forEach((c, i) => r.style.setProperty(`--c${i+1}`, c));
    }

    const music = document.getElementById("bg-music");
    if (cd.musicUrl) {
        music.src = cd.musicUrl; music.load();
        const play = () => music.play().catch(() => setTimeout(play, 1000));
        music.oncanplay = play;
        const label = document.getElementById("music-text");
        label.style.display = "inline-block";
        label.textContent = "🎵 " + cd.musicUrl.split('/').pop().replace('.m4a','').replace(/_/g,' ');
    }
    document.getElementById("title-display").textContent = cd.label || "NEDTELLING";
    return data;
});

setInterval(() => {
    if (!state.target || state.finished) return;
    const left = state.target - Date.now();
    
    if (left <= 0) {
        triggerFinish();
    } else {
        const s = Math.floor(left / 1000);
        const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
        document.getElementById("time").textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    }
}, 500);

function triggerFinish() {
    state.finished = true;
    document.getElementById("bg-music").pause();
    document.getElementById("end-sound").play();
    document.body.classList.add('is-done');
    document.documentElement.style.setProperty('--flash-opacity', '0.4');
    setTimeout(() => {
        document.documentElement.style.setProperty('--flash-opacity', '0');
    }, 800);
}

// ENDRINGEN SOM HINDRER DVALE:
const options = new cast.framework.CastReceiverOptions();
options.maxInactivity = 208800; // 58 timer
options.disableIdleTimeout = true;
ctx.start(options);
