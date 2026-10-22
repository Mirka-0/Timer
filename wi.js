let restante = 0;
let duracion=restante;
let fin=0;
let reloj=null;
let audio=null;
let contexto=null;
let fuente=null;
let ganancia=null;
let pitidos=null;
let espera=null;
let previa=false;
let urlFondo=null;
let urlMusica=null;

function mostrarTiempo(){
    document.getElementById('editMins').value=String(Math.floor(restante/60)).padStart(2,'0');
    document.getElementById('editSecs').value=String(restante%60).padStart(2,'0');
    let seg = reloj === null ? restante : Math.max(0,(fin-Date.now())/1000)
    document.getElementById('progressBar').style.transform=`scaleX(${duracion ? seg / duracion : 0})`;
}
function leerTiempo(){
    let min=Math.max(0, Math.min(180, Number(document.getElementById('editMins').value) ||0));
    let seg=Math.max(0, Math.min(59, Number(document.getElementById('editSecs').value) ||0));
    restante=Math.floor(min)*60+ Math.floor(seg);
    duracion=restante;
    document.getElementById('progressBar').style.transform= `scaleX(${duracion ? 1 : 0})`;
}
function pararReloj(){
    clearInterval(reloj);
    reloj=null;
    document.getElementById('startBttn').textContent='Start';
    document.getElementById('editMins').disabled=false;
    document.getElementById('editSecs').disabled=false;
}
function actualizar(){
    restante= Math.max(0, Math.ceil((fin-Date.now()) /1000));
    mostrarTiempo();
    if (restante=== 0) {
        pararReloj();
        activarAlarma();
    }
}
function iniciarReloj(){
    if (restante <= 0 || reloj !== null) return;
    fin = Date.now()+restante*1000;
    document.getElementById('startBttn').textContent='Pause';
    document.getElementById('editMins').disabled =true;
    document.getElementById('editSecs').disabled =true;
    reloj=setInterval(actualizar, 100);
}

document.getElementById('startBttn').addEventListener('click', () => {
    if (!contexto) contexto = new AudioContext();
    contexto.resume().catch(() => {});
    if(reloj !== null){
        actualizar();
        if(reloj!==null) pararReloj();
    } else{
        iniciarReloj();
    }
});
document.getElementById('resetBttn').addEventListener('click', () => {
    pararReloj();
    detenerAlarma();
    restante=duracion;
    mostrarTiempo();
});

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
    clearTimeout(espera);
    pitidos=null;
    espera=null;
    if (fuente) fuente.disconnect();
    if (ganancia) ganancia.disconnect();
    fuente = null;
    ganancia=null;
    previa=false;
    document.getElementById('testSoundBttn').textContent='Preview Song';
}

function sonarPitido() {
    if (!contexto) return;
    let osc=contexto.createOscillator();
    let vol=contexto.createGain();
    osc.frequency.value=880;
    vol.gain.value= Number(document.getElementById('volRange').value)/300;
    osc.connect(vol);
    vol.connect(contexto.destination);
    osc.start();
    osc.stop(contexto.currentTime+0.3);
}
function reproducir(repetir=false){
    detenerAudio();
    if(!contexto) contexto=new AudioContext();
    contexto.resume().catch(() => {})
    if(document.getElementById('songSel').value==='beep'){
        sonarPitido();

        if(repetir){
            pitidos=setInterval(sonarPitido, 1200);
        } else{
            espera=setTimeout(detenerAudio, 500);
        }
        return;
    }

    let pista=new Audio(document.getElementById('songSel').value);
    audio=pista;
    fuente=contexto.createMediaElementSource(pista);
    ganancia=contexto.createGain();
    ganancia.gain.value=Number(document.getElementById('volRange').value) / 100;
    fuente.connect(ganancia);
    ganancia.connect(contexto.destination);
    pista.loop=repetir;
    pista.addEventListener('ended',()=> {
        if (audio===pista) detenerAudio();

    });
    pista.play().catch(() => {
        if(audio!== pista) return;
        detenerAudio();
        if(document.getElementById('alarmModal').style.display==='flex'){
            document.getElementById('alarmSN').textContent='Unable to play the selected audio :(';
        }
    });
}

document.getElementById('testSoundBttn').addEventListener('click',() => {
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
document.getElementById('volRange').addEventListener('input', ()=> {
    let vol=Number(document.getElementById('volRange').value);
    document.getElementById('volLbl').textContent=`${vol}%`;
    if(ganancia) ganancia.gain.value = vol /100;
});
function activarAlarma(){
    document.getElementById('alarmSN').textContent= 
        `Playing: ${document.getElementById('songSel').selectedOptions[0].textContent.trim()}`;
    document.getElementById('alarmModal').style.display='flex';
    reproducir(true);
}
function detenerAlarma(){
    document.getElementById('alarmModal').style.display='none';
    detenerAudio();
}

document.getElementById('stopAlarmBttn').addEventListener('click', detenerAlarma);
document.getElementById('snoozeBttn').addEventListener('click', () =>{
        detenerAlarma();
        restante=300;
        duracion=restante;
        mostrarTiempo();
        iniciarReloj();
});
document.getElementById('bgColPick').addEventListener('input', () =>{
    document.getElementById('appContainer').style.backgroundColor= 
        document.getElementById('bgColPick').value;
    document.getElementById('appContainer').style.backgroundImage='none';
    if(urlFondo) URL.revokeObjectURL(urlFondo);
    urlFondo=null;
});
document.getElementById('bgPhotoI').addEventListener('change',(evento)=> {
    let archivo=evento.target.files[0];
    if(!archivo)return;
    if(urlFondo) URL.revokeObjectURL(urlFondo);
    urlFondo=URL.createObjectURL(archivo);
    document.getElementById('appContainer').style.backgroundImage=`url("${urlFondo}")`;
    evento.target.value='';
});
document.getElementById('customAudI').addEventListener('change', (evento)=> {
    let archivo=evento.target.files[0];
    if(!archivo)return;
    detenerAudio();
    if(urlMusica) URL.revokeObjectURL(urlMusica);
    document.getElementById('musicaSubida')?.remove();
    urlMusica=URL.createObjectURL(archivo);
    let opcion= new Option(
        archivo.name.replace(/\.[^.]+$/, ''),
        urlMusica
    );
    opcion.id='musicaSubida';
    document.getElementById('songSel').add(opcion);
    document.getElementById('songSel').value=urlMusica;
    evento.target.value='';
});
mostrarTiempo();