document.addEventListener("DOMContentLoaded", function(event) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const globalGain = audioCtx.createGain();
    globalGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
    globalGain.connect(audioCtx.destination);

    const keyboardFrequencyMap = {
        '90': 261.625565300598634,  //Z - C
        '83': 277.182630976872096, //S - C#
        '88': 293.664767917407560,  //X - D
        '68': 311.126983722080910, //D - D#
        '67': 329.627556912869929,  //C - E
        '86': 349.228231433003884,  //V - F
        '71': 369.994422711634398, //G - F#
        '66': 391.995435981749294,  //B - G
        '72': 415.304697579945138, //H - G#
        '78': 440.000000000000000,  //N - A
        '74': 466.163761518089916, //J - A#
        '77': 493.883301256124111,  //M - B
        '81': 523.251130601197269,  //Q - C
        '50': 554.365261953744192, //2 - C#
        '87': 587.329535834815120,  //W - D
        '51': 622.253967444161821, //3 - D#
        '69': 659.255113825739859,  //E - E
        '82': 698.456462866007768,  //R - F
        '53': 739.988845423268797, //5 - F#
        '84': 783.990871963498588,  //T - G
        '54': 830.609395159890277, //6 - G#
        '89': 880.000000000000000,  //Y - A
        '55': 932.327523036179832, //7 - A#
        '85': 987.766602512248223,  //U - B
    }

    let activeOscillators = {};
    let waveformType = 'sine';

    document.getElementById('waveform').addEventListener('change', function(event) {
        waveformType = event.target.value;
    });

    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);

    function keyDown(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
            playNote(key);
            changeBackgroundColor();
        }
    }

    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && activeOscillators[key]) {
            let osc = activeOscillators[key];
            let noteGain = osc.noteGain;
    
            // Release
            noteGain.gain.cancelScheduledValues(audioCtx.currentTime); // Cancel any scheduled changes
            noteGain.gain.setValueAtTime(noteGain.gain.value, audioCtx.currentTime); // Set to current value
            noteGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5); // Ramp to almost zero in 0.5 seconds
    
            osc.stop(audioCtx.currentTime + 0.5);
            delete activeOscillators[key];
        }
    }

    function playNote(key) {
        const osc = audioCtx.createOscillator();
        osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime);
        osc.type = waveformType;
    
        const noteGain = audioCtx.createGain();
        // Attack
        noteGain.gain.setValueAtTime(0, audioCtx.currentTime); // Start at 0
        noteGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.1); // Ramp to full volume in 0.1 seconds
    
        // Decay and Sustain
        noteGain.gain.linearRampToValueAtTime(0.7, audioCtx.currentTime + 0.2); // Decay to 70% volume in 0.2 seconds
    
        osc.noteGain = noteGain; // Store for later access in keyUp
        osc.connect(noteGain).connect(globalGain);
        osc.start();
    
        activeOscillators[key] = osc;
    }

    function changeBackgroundColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    }
});