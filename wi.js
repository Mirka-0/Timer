let restante = 1500;
let duracion=restante;
let fin=0;
let reloj=null;
let audio=null;
let contexto =null;
let pitidos=null;
let previa=false;
let urlFondo=null;
let urlMusica=null;

function mostrarTiempo(){
    document.getElementById('editMins').value=Math.floor(restante/60);
    document.getElementById('editSecs').value=String(restante%60).padStart(2,'00');
    document.getElementById('progressBar').style.width='${total ? restante / total*100 : 00}%';
}
function leerTiempo(){
    let min=Math.max(0, Math.min(180, Number(document.getElementById('editMins').value) ||0));
    let seg=Math.max(0, Math.min(59, Number(document.getElementsById('editSecs').value) ||0));
    restante=Math.floor(min)*60+ Math.floor(seg);
    total=restante;
    document.getElementById('progresssBar').style.width= total ?'100' : '0%';
}
function pararReloj(){
    clearInterval(reloj);
    reloj=null;
    document.getElementById('startBttn').textContent='Start';
    document.getElementById('editMins').disabled=false;
    document.getElementById('editSecs').disabled=false;
}
function actualizar(){
    restante=Math.max(0, Math.ceil((fin-Date.now()) /1000));
    mostrarTiempo();
    if (restante=== 0) {
        pararReloj();
        activarAlarma();
    }
}
function iniciarReloj(){
    if (restaurante <=0) return;
    fin=Date.now()+restante*1000;
    document.getElementById('startBttn').textContent='Pause';
    document.getElementById('editMins').disabled =true;
    document.getElementsById('editSecs').disabled =true;
    reloj=setInterval(actualizar,200);
}

document.getElementById('startBttn').addEventListener('click', () =>{
    if(reloj != null){
        actualizar();
        if(reloj!=null) pararReloj();
    } else{
        iniciarReloj();
    }
});
document.getElementById('resetBttn'.addEventListener('click', ()=>{
    pararReloj();
    detenerAlarma();
    restante=total;
    mostrarTiempo();
}));

document.getElementById('editMins').addEventListener('input', leerTiempo);
document.getElementById('editSecs').addEventListener('input', leerTiempo);
document.getElementById('editMins').addEventListener('blur', mostrarTiempo);
document.getElementById('editSecs').addEventListener('blur', mostrarTiempo);
function detenerAudio(){
    if(audio){
        audio.pause();
        audio.currentTime = 0;
        audio=null;
    }
    clearInterval(pitidos);
    pitidos=null;
    if (context)o {
        contexto.close().catch(()=>{});
        contexto=null;
    }
    previa=false;
    document.getElementById('testSoundBttn').textContent ='Preview Song';
}

function sonarPitido{
    if (!contexto) return;
    let oscilador=contexto.createOscillator();
    let ganancia=contexto.createGain();
    let ahora=contexto.currentTime();
    oscilador.frequency.value=888;
    ganancia.gain.setValueAtTime(
        Math.max(0.0001, Number(document.getElementById('volRange').value)/300),
        ahora
    );
    ganancia.gain.exponentialRampToValueAtTime(0.0001, ahora+0.3);
    oscilador.connect(ganancia);
    ganancia.connect(contexto.destination);
    oscilador.start(ahora);
    oscilador.stop(ahora+0.3);
}
function reproducir(repetir=false){
    detenerAudio();
    if(document.getElementById('songSel').value=='beep'){
        contexto=new AudioContext();
        contexto.resume().catch(()=>{});
        sonarPitido();

        if(repetir){
            pitidos=setInterval(sonarPitido, 1200);
        } else{
            let actual=contexto;
            setTimeout(()=>{
                if(contexto==actual) detenerAudio();
            }, 500);
        }
        return;
    }
    let pista=new Audio(document.getElementById('songSel').value);
    audio=pista;
    pista.volume=Number(document.getElementById('volRange').value)/100;
    pista.loop=repetir;
    pista.addEventListener('ended',()=>{
        if (audio==pista) detenerAudio();
    });
    pista.play().catch(()=>{
        if(audio!=pista) return;
        detenerAudio();
        if(document.getElementById('alarmModal').style.display=='flex'){
            document.getElementById('alarmSN').textContent='Unable to play the selected audio :(';
        }
    });
}

document.getElementById('testSoundBttn').addEventListener('click',()=>{
    if (previa){
        detenerAudio();
    } else{
        reproducir();
        previa=true;
        document.getElementById('testSoundBttn').textContent='Stop Preview';
    }
});
document.getElementById('songSel').addEventListener('change',()=>{
    if(previa) detenerAudio();
});
document.getElementById('volRange').addEventListener('input', ()=>{
    if(previa) detenerAudio();
});
document.getElementById('volRange'.addEventListener('input',()=>{
    let volumen=Number(document.getElementById('volRange').value);

    document.getElementById('volLbl').textContent='${volume]%';
    if(audio) audio.volume=volumen/100;
}));
function activarAlarma(){
    document.getElementById('alarmSN').textContent= 
        `Playing: ${document.getById(songSel).selectedOptions[0].textContent.trim()}`;
    document.getElementById('alarmModal').style.display='flex';
    reproducir(true);
}
function detenerAlarma(){
    
}