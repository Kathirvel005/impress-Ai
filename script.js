/* ==========================================
   💖 Advanced Romantic Web Experience Logic
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Global elements
  const starCanvas = document.getElementById("starCanvas");
  const mainMessage = document.getElementById("mainMessage");
  const nameInput = document.getElementById("nameInput");
  const chatInput = document.getElementById("chatInput");
  const chatBox = document.getElementById("chatBox");

  /* ==========================================
     ✨ Constellation Engine (Background Canvas)
     ========================================== */
  const ctx = starCanvas.getContext("2d");
  let particles = [];
  const mouse = { x: null, y: null, radius: 140 };

  function resizeCanvas() {
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y) {
      this.x = x || Math.random() * starCanvas.width;
      this.y = y || Math.random() * starCanvas.height;
      this.size = Math.random() * 2.5 + 0.8;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.speedY = (Math.random() - 0.5) * 0.6;
      this.opacity = Math.random() * 0.7 + 0.3;
      this.color = Math.random() > 0.4 ? "rgba(255, 182, 193, " : "rgba(218, 112, 214, ";
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Wrap-around edges
      if (this.x < 0) this.x = starCanvas.width;
      if (this.x > starCanvas.width) this.x = 0;
      if (this.y < 0) this.y = starCanvas.height;
      if (this.y > starCanvas.height) this.y = 0;

      // Mouse interactive attract
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.hypot(dx, dy);
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          this.x -= dx * force * 0.03;
          this.y -= dy * force * 0.03;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.opacity + ")";
      ctx.shadowBlur = this.size * 3;
      ctx.shadowColor = "#ff4f9a";
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }
  }

  // Populate stars
  function initStars() {
    particles = [];
    const count = Math.min(100, Math.floor((starCanvas.width * starCanvas.height) / 11000));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }
  initStars();

  // Track mouse
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Spawn star on click
  window.addEventListener("click", (e) => {
    // Only spawn if not clicking interactive UI buttons
    if (e.target.tagName !== "BUTTON" && e.target.tagName !== "INPUT" && !e.target.closest(".glass")) {
      createLocalSparkles(e.clientX, e.clientY);
      spawnHeartExplosion(e.clientX, e.clientY);
    }
  });

  // Connect lines
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (dist < 110) {
          const opacity = (1 - dist / 110) * 0.12;
          ctx.strokeStyle = `rgba(255, 182, 193, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  // Animation Loop
  function animateStars() {
    ctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    drawConnections();
    requestAnimationFrame(animateStars);
  }
  animateStars();


  /* ==========================================
     🎵 Ambient Synthesizer & Audio Visualizer
     ========================================== */
  const audioToggle = document.getElementById("audioToggle");
  const visualizerCanvas = document.getElementById("visualizerCanvas");
  const trackNameDisplay = document.getElementById("trackName");

  const vCtx = visualizerCanvas.getContext("2d");
  let audioContext = null;
  let synthInterval = null;
  let isPlayingSynth = false;
  let analyser = null;
  let dataArray = [];
  let currentNoteIndex = 0;

  // Romantic synth chord progression (Am -> F -> C -> G)
  const synthMelody = [
    [220, 261.63, 329.63, 440], // Am (A3, C4, E4, A4)
    [174.61, 220, 261.63, 349.23], // F (F3, A3, C4, F4)
    [261.63, 329.63, 392, 523.25], // C (C4, E4, G4, C5)
    [196, 246.94, 293.66, 392]  // G (G3, B3, D4, G4)
  ];

  function playSynthNote(ctx, time, frequencies) {
    frequencies.forEach((freq, idx) => {
      // Main oscillator (sine wave for soft warm sound)
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const delay = ctx.createDelay();
      const feedback = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, time);

      // Low pass filter to make it warmer
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, time);

      // Volume envelope (slow attack, long decay)
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.08 / frequencies.length, time + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 2.5);

      // Simple delay/echo effect setup
      delay.delayTime.value = 0.4;
      feedback.gain.value = 0.3;

      osc.connect(filter);
      filter.connect(gainNode);

      // Connect to analyser
      gainNode.connect(analyser);

      // Simple echo routing
      gainNode.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(analyser);

      osc.start(time);
      osc.stop(time + 2.6);
    });
  }

  function startSynthEngine() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyser.connect(audioContext.destination);
      dataArray = new Uint8Array(analyser.frequencyBinCount);
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    isPlayingSynth = true;
    audioToggle.innerHTML = "⏸";
    trackNameDisplay.innerText = "Ambient Melody";
    
    // Trigger visualizer loop
    drawVisualizer();

    // Trigger synth note loops
    let nextNoteTime = audioContext.currentTime;
    
    function scheduleMelody() {
      if (!isPlayingSynth) return;
      
      const chord = synthMelody[currentNoteIndex % synthMelody.length];
      playSynthNote(audioContext, nextNoteTime, chord);
      
      currentNoteIndex++;
      nextNoteTime += 2.0; // schedule every 2 seconds
      
      synthInterval = setTimeout(scheduleMelody, 2000);
    }
    
    scheduleMelody();
  }

  function stopSynthEngine() {
    isPlayingSynth = false;
    audioToggle.innerHTML = "▶";
    trackNameDisplay.innerText = "Paused";
    clearTimeout(synthInterval);
    if (audioContext) {
      audioContext.suspend();
    }
  }

  audioToggle.addEventListener("click", () => {
    if (isPlayingSynth) {
      stopSynthEngine();
    } else {
      startSynthEngine();
    }
  });

  function drawVisualizer() {
    if (!isPlayingSynth) {
      vCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
      return;
    }

    requestAnimationFrame(drawVisualizer);
    analyser.getByteFrequencyData(dataArray);

    vCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
    const barWidth = (visualizerCanvas.width / dataArray.length) * 1.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * visualizerCanvas.height;
      
      // Dynamic colors based on frequency amplitude
      vCtx.fillStyle = `hsla(${330 + (i * 2)}, 90%, 65%, ${0.35 + (dataArray[i] / 255) * 0.6})`;
      vCtx.fillRect(x, visualizerCanvas.height - barHeight, barWidth - 2, barHeight);

      x += barWidth;
    }
  }


  /* ==========================================
     🎁 3D Gift Box & SVG Envelope Surprise Flow
     ========================================== */
  const surpriseModal = document.getElementById("surpriseModal");
  const giftBox = document.getElementById("giftBox");
  const envelopeWrapper = document.getElementById("envelopeWrapper");
  const envelope = document.getElementById("envelope");

  // Make the gift click function globally reachable
  window.triggerGiftOpen = function() {
    if (giftBox.classList.contains("open")) return;

    // Phase 1: Shake the gift box
    giftBox.classList.add("shake");
    speakText("Wait, let's see what is inside this special box...");

    setTimeout(() => {
      giftBox.classList.remove("shake");
      // Phase 2: Open the gift box
      giftBox.classList.add("open");
      
      // Heart burst effects from gift center
      const centerRect = giftBox.getBoundingClientRect();
      const startX = centerRect.left + centerRect.width / 2;
      const startY = centerRect.top + centerRect.height / 2;
      spawnHeartExplosion(startX, startY);
      createLocalSparkles(startX, startY);

      // Phase 3: Reveal the envelope
      setTimeout(() => {
        envelopeWrapper.classList.add("show");
        speakText("An envelope? Open it up!");
      }, 800);

    }, 600);
  };

  // Make envelope click globally reachable
  window.triggerEnvelopeOpen = function() {
    if (envelope.classList.contains("open")) {
      // Close the envelope
      envelope.classList.remove("open");
      speechSynthesis.cancel();
      return;
    }

    envelope.classList.add("open");
    speakText("Let's read this letter...");

    // Read surprise letter contents aloud
    setTimeout(() => {
      const letterText = document.getElementById("surpriseLetterText").innerText;
      speakText(letterText);
      
      // Sparkle burst around screen
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          createLocalSparkles(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
        }, i * 300);
      }
    }, 1000);
  };

  window.openSurprise = function() {
    surpriseModal.style.display = "flex";
    // Reset state
    giftBox.classList.remove("open", "shake");
    envelopeWrapper.classList.remove("show");
    envelope.classList.remove("open");
  };

  window.closeSurprise = function() {
    surpriseModal.style.display = "none";
    speechSynthesis.cancel();
  };


  /* ==========================================
     🎮 Love Language & Compatibility Quiz
     ========================================== */
  const quizCards = document.querySelectorAll(".quiz-card");
  const quizProgressBar = document.getElementById("quizProgressBar");
  const quizContainer = document.getElementById("quizContainer");

  let quizStep = 0;
  let quizAnswers = {
    A: 0,
    B: 0,
    C: 0,
    D: 0
  };

  window.selectQuizOption = function(option) {
    // Record selection
    quizAnswers[option]++;

    // Transition to next slide
    const currentCard = quizCards[quizStep];
    currentCard.classList.remove("upcoming");
    currentCard.classList.add("hide");

    quizStep++;
    const progressPercent = (quizStep / quizCards.length) * 100;
    quizProgressBar.style.width = `${progressPercent}%`;

    if (quizStep < quizCards.length) {
      const nextCard = quizCards[quizStep];
      nextCard.classList.remove("upcoming");
    } else {
      // End of quiz: calculate result
      displayQuizResult();
    }
  };

  function displayQuizResult() {
    // Determine highest selected love language option
    let maxOption = "A";
    let maxVal = quizAnswers.A;
    
    for (const key in quizAnswers) {
      if (quizAnswers[key] > maxVal) {
        maxVal = quizAnswers[key];
        maxOption = key;
      }
    }

    let archetype = "Warm Cocoa Soulmates";
    let score = 85 + Math.floor(Math.random() * 15); // Random percentage between 85% and 99%
    let description = "You value deeply intimate conversations and emotional warmth. True connections are built on small, shared moments.";

    if (maxOption === "A") {
      archetype = "Star-Crossed Dreamers";
      description = "You share a high poetic frequency. Connecting under starry skies and speaking with beautiful silence is your love language.";
    } else if (maxOption === "C") {
      archetype = "Creative Spark Companions";
      description = "You are dynamic and playful. Exploring new places, crafting shared moments, and building things from scratch represents your bond.";
    } else if (maxOption === "D") {
      archetype = "Silly & Sweet Companions";
      description = "Warm laughter and shared jokes are your signature style. Appreciating quirks and bringing easy smiles makes you perfect soulmates.";
    }

    // Render result card with gauge meter
    quizContainer.innerHTML = `
      <div class="quiz-result-card">
        <div class="gauge-wrapper">
          <svg class="gauge-svg">
            <defs>
              <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ff4f9a" />
                <stop offset="100%" stop-color="#ba55d3" />
              </linearGradient>
            </defs>
            <circle class="gauge-bg" cx="70" cy="70" r="60"></circle>
            <circle class="gauge-fill" id="gaugeFill" cx="70" cy="70" r="60"></circle>
          </svg>
          <div class="gauge-text" id="gaugeVal">0%</div>
        </div>
        <h2 class="result-title">${archetype}</h2>
        <p class="result-desc">${description}</p>
        <button class="btn btn-secondary" onclick="resetQuiz()" style="margin-top: 20px;">Restart Quiz</button>
      </div>
    `;

    // Trigger visual progress animations
    setTimeout(() => {
      const gaugeFill = document.getElementById("gaugeFill");
      const gaugeVal = document.getElementById("gaugeVal");
      
      // Arc circumference = 2 * Math.PI * 60 = 377
      const offset = 377 - (377 * score) / 100;
      gaugeFill.style.strokeDashoffset = offset;

      // Animate percentage count
      let currentVal = 0;
      const countInterval = setInterval(() => {
        currentVal++;
        gaugeVal.innerText = `${currentVal}%`;
        if (currentVal >= score) {
          clearInterval(countInterval);
        }
      }, 15);

      speakText(`Your Compatibility Result is ${archetype} at ${score} percent! ${description}`);
      spawnHeartExplosion(window.innerWidth / 2, window.innerHeight / 2);
    }, 200);
  }

  window.resetQuiz = function() {
    quizStep = 0;
    quizAnswers = { A: 0, B: 0, C: 0, D: 0 };
    quizProgressBar.style.width = "0%";
    
    // Re-render original quiz container contents
    let quizHtml = "";
    quizCards.forEach((card, idx) => {
      const classAttr = idx === 0 ? "quiz-card" : "quiz-card upcoming";
      quizHtml += `<div class="${classAttr}">${card.innerHTML}</div>`;
    });

    quizContainer.innerHTML = quizHtml;
    // Rebind DOM reference
    setTimeout(() => {
      const parent = document.getElementById("quizContainer");
      const cards = parent.querySelectorAll(".quiz-card");
      quizCards.forEach((c, i) => {
        cards[i].className = i === 0 ? "quiz-card" : "quiz-card upcoming";
      });
    }, 100);
  };


  /* ==========================================
     🕰️ Scroll-triggered Memory Timeline Reveal
     ========================================== */
  const timelineItems = document.querySelectorAll(".timeline-item");

  function revealTimeline() {
    const triggerBottom = window.innerHeight * 0.85;

    timelineItems.forEach(item => {
      const itemTop = item.getBoundingClientRect().top;
      if (itemTop < triggerBottom) {
        item.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", revealTimeline);
  revealTimeline(); // Initial check on load


  /* ==========================================
     💬 Smart Assistant Chat & Voice Logic
     ========================================== */
  const romanticReplies = [
    "Some messages stay longer than they should… this feels like one of them 💖",
    "That felt… unexpectedly beautiful and warm ✨",
    "You have a way of making simple words feel incredibly special 🌸",
    "If this moment had a feeling, it would be soft, cozy, and light 🌷",
    "That didn’t sound like ordinary words… and I like that 💕",
    "Some conversations don’t need meaning… they just feel right 🌷",
    "That was quietly charming… like something worth holding onto 💖"
  ];

  const cuteQuotes = [
    "In a sky full of stars, you are a glowing constellation 💫",
    "Some people make the world a little brighter just by existing in it.",
    "If comfort was a person, it would feel like chatting with you.",
    "Simple smiles are the best gifts, and you spawn them easily."
  ];

  // Set default guest name if saved
  if (localStorage.getItem("guestName")) {
    const savedName = localStorage.getItem("guestName");
    nameInput.value = savedName;
    mainMessage.innerHTML = `Hey <b>${savedName}</b>, welcome back to this cozy corner. I’m glad you’re here 🌸`;
  }

  window.personalizeMessage = function() {
    const name = nameInput.value.trim();

    if (name === "") {
      mainMessage.innerHTML = "Please enter a name first 💗";
      return;
    }

    localStorage.setItem("guestName", name);
    mainMessage.innerHTML = `Hey <b>${name}</b>, I didn’t just build this page… I built a small moment, hoping it brings a warm smile to you — because honestly, you make things feel a little more special 🌷`;
    speakText(`Hey ${name}, I built this small moment hoping it brings a smile to you, because you make things feel more special.`);
    
    // Spawn burst effects
    createLocalSparkles(window.innerWidth / 2, window.innerHeight / 2);
    spawnHeartExplosion(window.innerWidth / 2, window.innerHeight / 2);
  };

  window.playSpecialMessage = function() {
    const message = "You don’t need a special occasion to be appreciated… some people are just naturally unforgettable 💫";
    mainMessage.innerHTML = message;
    speakText(message);
    createLocalSparkles(window.innerWidth / 2, window.innerHeight / 2);
  };

  window.sendMessage = function() {
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, "user");
    chatInput.value = "";

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = "";

      if (lower.includes("poem") || lower.includes("poetry")) {
        reply = "Here's a small thought:<br><i>'Stars align and lanterns glow,<br>Time moves fast, but thoughts move slow.<br>Some moments fade, as flowers do,<br>But warm thoughts stay when they're of you.'</i> 🌸";
      } else if (lower.includes("heart") || lower.includes("love")) {
        reply = "Spawning some hearts just for you! 💖";
        spawnHeartExplosion(window.innerWidth / 2, window.innerHeight / 2);
      } else if (lower.includes("joke") || lower.includes("funny")) {
        reply = "Why did the computer keep blushing? because it had too many warm cookies! 🍪";
      } else if (lower.includes("quote")) {
        reply = cuteQuotes[Math.floor(Math.random() * cuteQuotes.length)];
      } else {
        reply = romanticReplies[Math.floor(Math.random() * romanticReplies.length)];
      }

      addMessage(reply, "bot");
      
      // Strip HTML tags for speech output
      const cleanSpeech = reply.replace(/<[^>]*>/g, "");
      speakText(cleanSpeech);
    }, 700);
  };

  function addMessage(text, type) {
    const div = document.createElement("div");
    div.className = `msg ${type}`;
    div.innerHTML = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Handle Input enter keypress
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });


  /* ==========================================
     🎤 Web Speech Recognition & Synthesis
     ========================================== */
  let recognition = null;
  const voiceBtn = document.getElementById("voiceBtn");

  window.startVoice = function() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    if (recognition) {
      recognition.stop();
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    
    recognition.onstart = () => {
      voiceBtn.classList.add("btn-pulse");
      voiceBtn.innerHTML = "Listening... 🎤";
      mainMessage.innerHTML = "Listening... 🎤 Say something sweet.";
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      addMessage(transcript, "user");

      const lower = transcript.toLowerCase();
      let reply = "That sounded lovely 💗";

      if (lower.includes("hello") || lower.includes("hi")) {
        reply = "Hello… I think this just became a slightly better moment 🌸";
      } else if (lower.includes("love") || lower.includes("heart")) {
        reply = "Love doesn’t always need words… but when it does, it sounds like this 💖";
        spawnHeartExplosion(window.innerWidth / 2, window.innerHeight / 2);
      } else if (lower.includes("beautiful") || lower.includes("gorgeous")) {
        reply = "Beautiful things are rare… and sometimes, they appear in simple ways ✨";
      } else if (lower.includes("smile")) {
        reply = "If this made you smile even a little… then it already did its job 😊";
      } else if (lower.includes("music") || lower.includes("play")) {
        reply = "Starting the ambient synthesizer music! 🎹";
        startSynthEngine();
      }

      setTimeout(() => {
        addMessage(reply, "bot");
        speakText(reply);
        createLocalSparkles(window.innerWidth / 2, window.innerHeight / 2);
      }, 500);

      mainMessage.innerHTML = `You said: "${transcript}"`;
    };

    recognition.onend = () => {
      voiceBtn.classList.remove("btn-pulse");
      voiceBtn.innerHTML = "🎤 Voice Assistant";
      recognition = null;
    };

    recognition.onerror = (e) => {
      mainMessage.innerHTML = "Voice recognition could not catch that. Try again slowly.";
      voiceBtn.classList.remove("btn-pulse");
      voiceBtn.innerHTML = "🎤 Voice Assistant";
      recognition = null;
    };

    recognition.start();
  };

  // Pre-load voices so getVoices is populated in standard browsers
  if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

  // Handle voice gender change preview
  const genderSelect = document.getElementById("voiceGender");
  if (genderSelect) {
    genderSelect.addEventListener("change", () => {
      if (genderSelect.value === "male") {
        speakText("Male voice selected.");
      } else {
        speakText("Female voice selected.");
      }
    });
  }

  function speakText(text) {
    if (!("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedGender = genderSelect ? genderSelect.value : "female";

    // Query available voices
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    const isMaleVoiceName = (name) => {
      const n = name.toLowerCase();
      return n.includes("david") || n.includes("mark") || n.includes("alex") || 
             n.includes("daniel") || n.includes("george") || n.includes("male");
    };

    const isFemaleVoiceName = (name) => {
      const n = name.toLowerCase();
      return n.includes("zira") || n.includes("samantha") || n.includes("hazel") || 
             n.includes("siri") || n.includes("susan") || n.includes("female") || 
             n.includes("google us english") || n.includes("google uk english female") ||
             n.includes("haruka") || n.includes("karen") || n.includes("moira") || 
             n.includes("tessa") || n.includes("victoria");
    };

    if (selectedGender === "male") {
      // 1. Try to find a native English male voice
      selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith("en") && isMaleVoiceName(v.name));
      
      // 2. Fallback: Try to find any male voice in any language
      if (!selectedVoice) {
        selectedVoice = voices.find(v => isMaleVoiceName(v.name));
      }
      
      // 3. Second Fallback: Take first English voice (which might be female) or default
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith("en")) || voices[0];
      }

      // If the selected voice is female (or not explicitly male), deep pitch shift it to sound male!
      if (selectedVoice && !isMaleVoiceName(selectedVoice.name)) {
        utterance.pitch = 0.65; // Deep voice shift
      } else {
        utterance.pitch = 0.92; // Natural male voice pitch
      }
    } else {
      // 1. Try to find a native English female voice
      selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith("en") && isFemaleVoiceName(v.name));
      
      // 2. Fallback: Try to find any female voice in any language
      if (!selectedVoice) {
        selectedVoice = voices.find(v => isFemaleVoiceName(v.name));
      }
      
      // 3. Second Fallback: Take first English voice (which might be male) or default
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith("en")) || voices[0];
      }

      // If the selected voice is male (or not explicitly female), high pitch shift it to sound female!
      if (selectedVoice && !isFemaleVoiceName(selectedVoice.name)) {
        utterance.pitch = 1.45; // High pitch shift
      } else {
        utterance.pitch = 1.15; // Natural female voice pitch
      }
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = 0.88;
    utterance.volume = 1;

    console.log("Speech Synth -> Gender:", selectedGender, "Voice:", selectedVoice ? selectedVoice.name : "Default", "Pitch:", utterance.pitch);

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }


  /* ==========================================
     💥 Particle & Sparkle Effect Generators
     ========================================== */
  function createLocalSparkles(x, y) {
    const colors = ["#ff4f9a", "#ba55d3", "#ff7eb3", "#ffffff", "#ffd700"];
    for (let i = 0; i < 30; i++) {
      const sparkle = document.createElement("div");
      sparkle.className = "sparkle";
      sparkle.style.left = `${x}px`;
      sparkle.style.top = `${y}px`;
      
      const dx = (Math.random() - 0.5) * 350;
      const dy = (Math.random() - 0.5) * 350;
      sparkle.style.setProperty("--dx", `${dx}px`);
      sparkle.style.setProperty("--dy", `${dy}px`);
      sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];
      
      const size = Math.random() * 8 + 3;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      
      document.body.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 1200);
    }
  }

  function spawnHeartExplosion(x, y) {
    const emojis = ["💖", "💗", "🌸", "🌷", "✨", "💕", "🌹"];
    for (let i = 0; i < 24; i++) {
      const heart = document.createElement("div");
      heart.className = "falling-heart";
      heart.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
      heart.style.left = `${x}px`;
      heart.style.top = `${y}px`;
      heart.style.fontSize = `${16 + Math.random() * 18}px`;
      
      document.body.appendChild(heart);

      const dx = (Math.random() - 0.5) * 500;
      const dy = (Math.random() - 0.5) * 500;

      heart.animate(
        [
          { transform: "translate(0, 0) scale(0.6)", opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) scale(1.4)`, opacity: 0 }
        ],
        {
          duration: 1500,
          easing: "ease-out"
        }
      );

      setTimeout(() => heart.remove(), 1500);
    }
  }
});
