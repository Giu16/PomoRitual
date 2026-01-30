// Elementos DOM
    
    const clickSound = document.getElementById('clickSound');
    const beepSound = document.getElementById('beepSound');
    const finalSound = document.getElementById('finalSound');
    const timerEl = document.getElementById("timer");
    const statusEl = document.getElementById("status");
    const startBtn = document.getElementById("startBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const resetBtn = document.getElementById("resetBtn");
    const alertSound = document.getElementById("alertSound");
    const inputFoco = document.getElementById("inputFoco");
    const inputPausaCurta = document.getElementById("inputPausaCurta");
    const inputPausaLonga = document.getElementById("inputPausaLonga");
    const circle = document.querySelector(".circle-progress");
    const bolaTimer = document.getElementById("bola-timer");
    
    // Event listeners para os botões
    startBtn.addEventListener('click', () => {
    clickSound.play().catch(() => {}).finally(() => {
    iniciarTimer();
        });
    });

    pauseBtn.addEventListener('click', pausarTimer);
    resetBtn.addEventListener('click', resetarTimer);

    // Variáveis do timer
    let DURACOES = {
      foco: 25 * 60,
      pausaCurta: 5 * 60,
      pausaLonga: 15 * 60
    };
    let tempoRestante = DURACOES.foco;
    let ciclo = 0;
    let status = "foco";
    let timerInterval = null;

    // SVG circle properties
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = 0;

    // Função para atualizar progresso circular
    function setProgress(percent) {
      const offset = circumference - percent * circumference;
      circle.style.strokeDashoffset = offset;
    }

    // Formatar tempo para mm:ss
    function formatarTempo(segundos) {
      const min = String(Math.floor(segundos / 60)).padStart(2, "0");
      const seg = String(segundos % 60).padStart(2, "0");
      return `${min}:${seg}`;
    }

    // Atualizar display e progresso
   function atualizarDisplay() {
  timerEl.textContent = formatarTempo(tempoRestante);
  let statusTexto = "";
  switch(status) {
    case "foco":
      statusTexto = "FOCO";
      break;
    case "pausaCurta":
      statusTexto = "PAUSA CURTA";
      break;
    case "pausaLonga":
      statusTexto = "PAUSA LONGA";
      break;
  }
  statusEl.textContent = statusTexto;

  const total = DURACOES[status];
  const percent = (total - tempoRestante) / total;
  setProgress(percent);

  // Atualiza o título da aba
  document.title = `${formatarTempo(tempoRestante)} - ${statusTexto}`;

  // Atualiza o texto da bola móvel se ela estiver visível
  if (bolaTimer.style.display === "flex") {
    atualizarBola();
  }
}
    // Função para mudar de status após o fim do tempo
    function proximoStatus() {
      if (status === "foco") {
        ciclo++;
        if (ciclo % 4 === 0) {
          status = "pausaLonga";
          tempoRestante = DURACOES.pausaLonga;
        } else {
          status = "pausaCurta";
          tempoRestante = DURACOES.pausaCurta;
        }
      } else {
        status = "foco";
        tempoRestante = DURACOES.foco;
      }
    }

    // Iniciar timer
    function iniciarTimer() {
      if (timerInterval) return;
        
      inputPausaCurta.disabled = true;
      inputPausaLonga.disabled = true;

      timerInterval = setInterval(() => {
    if (tempoRestante > 0) {
    if (tempoRestante <= 6) {
      beepSound.play().catch(() => {/* som bloqueado */});
    }
    tempoRestante--;
    atualizarDisplay();
  } else {
    clearInterval(timerInterval);
    timerInterval = null;

    finalSound.play().catch(() => {/* som bloqueado */});
    alertSound.play().catch(() => {/* som bloqueado */});
    mostrarNotificacao();

    proximoStatus();
    atualizarDisplay();
    iniciarTimer();
  }
}, 1000);
    }

    // Pausar timer
    function pausarTimer() {
      if(timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;

      }
    }

    // Resetar timer
    function resetarTimer() {
      if(timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      status = "foco";
      tempoRestante = DURACOES.foco;
      ciclo = 0;
      atualizarDisplay();


      inputFoco.disabled = false;
      inputPausaCurta.disabled = false;
      inputPausaLonga.disabled = false;
    }

    // Atualizar DURACOES quando usuário muda os inputs
    function atualizarDuracoes() {
      const focoMin = parseInt(inputFoco.value, 10);
      const pausaCurtaMin = parseInt(inputPausaCurta.value, 10);
      const pausaLongaMin = parseInt(inputPausaLonga.value, 10);

      if (focoMin > 0 && focoMin <= 60) DURACOES.foco = focoMin * 60;
      if (pausaCurtaMin > 0 && pausaCurtaMin <= 30) DURACOES.pausaCurta = pausaCurtaMin * 60;
      if (pausaLongaMin > 0 && pausaLongaMin <= 60) DURACOES.pausaLonga = pausaLongaMin * 60;

      if (status === "foco") tempoRestante = DURACOES.foco;
      else if (status === "pausaCurta") tempoRestante = DURACOES.pausaCurta;
      else tempoRestante = DURACOES.pausaLonga;

      atualizarDisplay();
    }

    document.addEventListener('DOMContentLoaded', solicitarPermissaoNotificacao);

    // Solicitar permissão para notificações
    function solicitarPermissaoNotificacao() {
      if (!("Notification" in window)) return;
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    // Mostrar notificação quando o tempo acabar
    
    function mostrarNotificacao() {
  if (Notification.permission !== "granted") return;

  // Detecta se o navegador é Safari (desktop ou iOS)
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const titulo = "Pomodoro Timer";
  let mensagem = "";
  switch(status) {
    case "foco": mensagem = "Hora de focar!"; break;
    case "pausaCurta": mensagem = "Pausa curta. Descanse!"; break;
    case "pausaLonga": mensagem = "Pausa longa. Aproveite!"; break;
  }

  if (isSafari) {
    // Notificação simples para Safari/iOS (sem botões)
    new Notification(titulo, {
      body: mensagem,
      icon: "https://img.icons8.com/ios-filled/50/268bd2/timer.png"
    });
  } else {
    // Notificação avançada para outros navegadores
    const options = {
      body: mensagem,
      icon: "https://img.icons8.com/ios-filled/50/268bd2/timer.png",
      requireInteraction: true,
      actions: [
        {action: 'iniciar', title: 'Iniciar', icon: 'https://img.icons8.com/ios-glyphs/30/268bd2/play--v1.png'},
        {action: 'pausar', title: 'Pausar', icon: 'https://img.icons8.com/ios-glyphs/30/268bd2/pause--v1.png'},
        {action: 'resetar', title: 'Resetar', icon: 'https://img.icons8.com/ios-glyphs/30/268bd2/reset.png'}
      ]
    };
    const notificacao = new Notification(titulo, options);

    notificacao.onclick = () => window.focus();

    notificacao.addEventListener('action', event => {
      switch(event.action) {
        case 'iniciar': iniciarTimer(); break;
        case 'pausar': pausarTimer(); break;
        case 'resetar': resetarTimer(); break;
      }
      notificacao.close();
    });

    setTimeout(() => notificacao.close(), 30000);
  }
}

    // Atualizar DURACOES ao mudar inputs
    inputFoco.addEventListener("change", atualizarDuracoes);
    inputPausaCurta.addEventListener("change", atualizarDuracoes);
    inputPausaLonga.addEventListener("change", atualizarDuracoes);

    // Botões
    startBtn.addEventListener("click", iniciarTimer);
    pauseBtn.addEventListener("click", pausarTimer);
    resetBtn.addEventListener("click", resetarTimer);

    // Inicializações
    solicitarPermissaoNotificacao();
    atualizarDisplay();
    
// Variáveis para controlar posição e arraste
let bolaPos = { x: window.innerWidth - 80, y: window.innerHeight - 80 };
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

moverBola(bolaPos.x, bolaPos.y);

// Função para mover a bola limitando dentro da tela
function moverBola(x, y) {
  bolaPos.x = Math.min(Math.max(0, x), window.innerWidth - bolaTimer.offsetWidth);
  bolaPos.y = Math.min(Math.max(0, y), window.innerHeight - bolaTimer.offsetHeight);
  bolaTimer.style.left = bolaPos.x + "px";
  bolaTimer.style.top = bolaPos.y + "px";
}

// Eventos para iniciar arraste com mouse (desktop)
bolaTimer.addEventListener("mousedown", e => {
  isDragging = true;
  dragOffset.x = e.clientX - bolaPos.x;
  dragOffset.y = e.clientY - bolaPos.y;
  bolaTimer.style.cursor = "grabbing";
});

// Evento para mover a bola com o mouse
document.addEventListener("mousemove", e => {
  if (isDragging) {
    moverBola(e.clientX - dragOffset.x, e.clientY - dragOffset.y);
  }
});

// Evento para finalizar o arraste com o mouse
document.addEventListener("mouseup", () => {
  isDragging = false;
  bolaTimer.style.cursor = "grab";
});

// Eventos para arraste com touch (mobile)
bolaTimer.addEventListener("touchstart", e => {
  isDragging = true;
  const touch = e.touches[0];
  dragOffset.x = touch.clientX - bolaPos.x;
  dragOffset.y = touch.clientY - bolaPos.y;
});

document.addEventListener("touchmove", e => {
  if (isDragging) {
    const touch = e.touches[0];
    moverBola(touch.clientX - dragOffset.x, touch.clientY - dragOffset.y);
  }
});

document.addEventListener("touchend", () => {
  isDragging = false;
});

// Mostrar ou esconder a bola dependendo se a aba está ativa ou não
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    bolaTimer.style.display = "flex";
    atualizarBola();
    moverBola(bolaPos.x, bolaPos.y);
  } else {
    bolaTimer.style.display = "none";
  }
});

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault(); // evita scroll na página
    if (!timerInterval) iniciarTimer();
    else pausarTimer();
  }
});

// Atualizar o texto da bola com o tempo formatado
function atualizarBola() {
  bolaTimer.textContent = formatarTempo(tempoRestante);

}




