const header = document.querySelector("[data-header]");
const nav = document.querySelector("#site-nav");
const navToggle = document.querySelector(".nav-toggle");
const year = document.querySelector("[data-year]");
const galleryCarousel = document.querySelector("[data-gallery-carousel]");
const galleryTrack = document.querySelector("[data-gallery-track]");
const galleryViewport = document.querySelector("[data-gallery-viewport]");
const galleryPrev = document.querySelector("[data-gallery-prev]");
const galleryNext = document.querySelector("[data-gallery-next]");
const promoVideo = document.querySelector("[data-promo-video]");
const videoToggle = document.querySelector("[data-video-toggle]");
const videoFullscreen = document.querySelector("[data-video-fullscreen]");
const videoScreenToggle = document.querySelector("[data-video-screen-toggle]");
const videoSeek = document.querySelector("[data-video-seek]");
const videoTime = document.querySelector("[data-video-time]");
const videoControls = document.querySelector("[data-video-controls]");
const videoFrame = promoVideo?.closest(".video-frame");

const PROMO_LIMIT_SECONDS = 88;
let audioContext;
let masterGain;
let beatTimer;
let nextBeatTime = 0;
let beatStep = 0;
let controlsHideTimer;

const CONTROLS_HIDE_DELAY = 1200;
const autoHideControlsMedia = window.matchMedia("(hover: hover) and (pointer: fine)");

const galleryItems = [
  {
    src: "/media/gallery-01.webp",
    alt: "Salon girişinden genel görünüm",
    fallback: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1100&q=80",
  },
  {
    src: "/media/gallery-02.webp",
    alt: "Serbest ağırlık ve güç alanı",
    fallback: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80",
  },
  {
    src: "/media/gallery-03.webp",
    alt: "Ağırlık ve makine düzeni",
    fallback: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=900&q=80",
  },
  {
    src: "/media/gallery-04.webp",
    alt: "Geniş makine parkuru",
    fallback: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
  },
  {
    src: "/media/gallery-05.webp",
    alt: "Makine alanı detayı",
    fallback: "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=900&q=80",
  },
  {
    src: "/media/gallery-06.webp",
    alt: "Salon içi ekipman yerleşimi",
    fallback: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=900&q=80",
  },
  {
    src: "/media/gallery-07.webp",
    alt: "Kardiyo ve kondisyon alanı",
    fallback: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80",
  },
  {
    src: "/media/gallery-08.webp",
    alt: "Koşu bandı ve kardiyo köşesi",
    fallback: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    src: "/media/gallery-09.webp",
    alt: "Salon atmosferi",
    fallback: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=900&q=80",
  },
  {
    src: "/media/gallery-10.webp",
    alt: "Makine alanından yakın görünüm",
    fallback: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=80",
  },
  {
    src: "/media/gallery-11.webp",
    alt: "Salon içi genel detay",
    fallback: "https://images.unsplash.com/photo-1571019613914-85f342c1d7ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    src: "/media/gallery-12.webp",
    alt: "Salonun geniş açı görünümü",
    fallback: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1100&q=80",
  },
];

let activeCarouselIndex = 0;

const updateCarouselPosition = () => {
  if (!galleryTrack || !galleryViewport) return;

  const slides = galleryTrack.querySelectorAll("[data-gallery-slide]");
  if (!slides.length) return;

  slides.forEach((slide, index) => {
    slide.classList.toggle("is-active", index === activeCarouselIndex);
  });

  const activeSlide = slides[activeCarouselIndex];
  const gap = Number.parseFloat(getComputedStyle(galleryTrack).columnGap || getComputedStyle(galleryTrack).gap) || 16;
  let offset = 0;

  for (let index = 0; index < activeCarouselIndex; index += 1) {
    offset += slides[index].offsetWidth + gap;
  }

  offset += activeSlide.offsetWidth / 2;
  const translateX = galleryViewport.offsetWidth / 2 - offset;
  galleryTrack.style.transform = `translateX(${translateX}px)`;
};

const renderCarousel = () => {
  if (!galleryTrack) return;

  galleryTrack.innerHTML = galleryItems
    .map(
      (item, index) => `
        <div class="gallery-carousel__slide${index === activeCarouselIndex ? " is-active" : ""}" data-gallery-slide="${index}">
          <img
            src="${item.src}"
            alt="${item.alt}"
            loading="lazy"
            decoding="async"
            data-fallback-src="${item.fallback}"
            onerror="this.onerror=null;this.src=this.dataset.fallbackSrc;"
          />
        </div>
      `,
    )
    .join("");

  galleryTrack.querySelectorAll("img").forEach((image) => {
    if (image.complete) return;
    image.addEventListener("load", updateCarouselPosition, { once: true });
  });

  updateCarouselPosition();
};

const goToSlide = (index) => {
  if (!galleryItems.length) return;
  activeCarouselIndex = (index + galleryItems.length) % galleryItems.length;
  updateCarouselPosition();
};

renderCarousel();

galleryPrev?.addEventListener("click", () => {
  goToSlide(activeCarouselIndex - 1);
});

galleryNext?.addEventListener("click", () => {
  goToSlide(activeCarouselIndex + 1);
});

window.addEventListener("resize", updateCarouselPosition);

if (promoVideo) {
  promoVideo.defaultMuted = true;
  promoVideo.muted = true;
  promoVideo.volume = 0;
  promoVideo.removeAttribute("controls");
}

if (year) {
  year.textContent = new Date().getFullYear();
}

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

navToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open");
  document.body.classList.toggle("nav-open", Boolean(isOpen));
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const ensureAudio = async () => {
  if (!audioContext) {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return false;

    audioContext = new Context();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.18;
    masterGain.connect(audioContext.destination);
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  return true;
};

const playKick = (time) => {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(95, time);
  osc.frequency.exponentialRampToValueAtTime(42, time + 0.16);
  gain.gain.setValueAtTime(0.95, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

  osc.connect(gain).connect(masterGain);
  osc.start(time);
  osc.stop(time + 0.24);
};

const playHat = (time) => {
  const bufferSize = audioContext.sampleRate * 0.04;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * 0.45;
  }

  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();

  source.buffer = buffer;
  filter.type = "highpass";
  filter.frequency.value = 7000;
  gain.gain.setValueAtTime(0.16, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

  source.connect(filter).connect(gain).connect(masterGain);
  source.start(time);
};

const playSnare = (time) => {
  const bufferSize = audioContext.sampleRate * 0.12;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const noiseGain = audioContext.createGain();
  const tone = audioContext.createOscillator();
  const toneGain = audioContext.createGain();

  noise.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = 1800;
  noiseGain.gain.setValueAtTime(0.42, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

  tone.type = "triangle";
  tone.frequency.setValueAtTime(185, time);
  toneGain.gain.setValueAtTime(0.12, time);
  toneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

  noise.connect(filter).connect(noiseGain).connect(masterGain);
  tone.connect(toneGain).connect(masterGain);
  noise.start(time);
  tone.start(time);
  tone.stop(time + 0.12);
};

const playBass = (time, step) => {
  const notes = [55, 55, 65.4, 73.4, 49];
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(notes[step % notes.length], time);
  gain.gain.setValueAtTime(0.13, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

  osc.connect(gain).connect(masterGain);
  osc.start(time);
  osc.stop(time + 0.2);
};

const scheduleBeat = () => {
  if (!audioContext) return;

  const stepDuration = 0.125;
  while (nextBeatTime < audioContext.currentTime + 0.28) {
    const step = beatStep % 16;

    if (step === 0 || step === 8) playKick(nextBeatTime);
    if (step === 4 || step === 12) playSnare(nextBeatTime);
    if (step % 2 === 0) playHat(nextBeatTime);
    if ([0, 3, 6, 8, 11, 14].includes(step)) playBass(nextBeatTime, step);

    nextBeatTime += stepDuration;
    beatStep += 1;
  }
};

const startGymBeat = async () => {
  const canPlayAudio = await ensureAudio();
  if (!canPlayAudio || beatTimer) return;

  nextBeatTime = audioContext.currentTime + 0.04;
  beatStep = 0;
  scheduleBeat();
  beatTimer = window.setInterval(scheduleBeat, 80);
};

const stopGymBeat = () => {
  if (beatTimer) {
    window.clearInterval(beatTimer);
    beatTimer = undefined;
  }

  if (masterGain && audioContext) {
    const now = audioContext.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setTargetAtTime(0.0001, now, 0.08);
    window.setTimeout(() => {
      if (masterGain) masterGain.gain.value = 0.18;
    }, 220);
  }
};

const formatVideoTime = (seconds) => {
  const safeSeconds = Math.max(0, Math.min(PROMO_LIMIT_SECONDS, Number(seconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const updateVideoProgress = () => {
  if (!promoVideo) return;

  const currentTime = Math.min(promoVideo.currentTime, PROMO_LIMIT_SECONDS);
  if (videoSeek) {
    videoSeek.value = String(currentTime);
    videoSeek.style.setProperty("--seek-progress", `${(currentTime / PROMO_LIMIT_SECONDS) * 100}%`);
  }
  if (videoTime) {
    videoTime.textContent = `${formatVideoTime(currentTime)} / ${formatVideoTime(PROMO_LIMIT_SECONDS)}`;
  }
};

const updateVideoButton = () => {
  if (!promoVideo) return;

  const isPaused = promoVideo.paused;
  videoFrame?.classList.toggle("is-playing", !isPaused);
  if (isPaused) {
    clearVideoControlsTimer();
    videoFrame?.classList.add("is-controls-visible");
  } else {
    showVideoControls();
  }

  if (!videoToggle) return;

  videoToggle.setAttribute("aria-label", isPaused ? "Videoyu oynat" : "Videoyu duraklat");
  videoToggle.classList.toggle("is-playing", !isPaused);
};

const getVideoFrame = () => videoFrame;

const isVideoFullscreen = () => {
  const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
  return fullscreenElement === getVideoFrame();
};

const updateFullscreenButton = () => {
  if (!videoScreenToggle) return;

  const isFullscreen = isVideoFullscreen();
  videoScreenToggle.setAttribute("aria-label", isFullscreen ? "Tam ekrandan çık" : "Tam ekranı aç");
  videoScreenToggle.classList.toggle("is-fullscreen", isFullscreen);
};

const clearVideoControlsTimer = () => {
  if (controlsHideTimer) {
    window.clearTimeout(controlsHideTimer);
    controlsHideTimer = undefined;
  }
};

const shouldAutoHideVideoControls = () => Boolean(videoFrame && videoControls && promoVideo && !promoVideo.paused);

const hideVideoControls = () => {
  if (!videoFrame || !videoControls || !shouldAutoHideVideoControls()) return;

  videoFrame.classList.remove("is-controls-visible");
};

const showVideoControls = () => {
  if (!videoFrame || !videoControls) return;

  videoFrame.classList.add("is-controls-visible");
  clearVideoControlsTimer();
  if (!shouldAutoHideVideoControls()) return;
  controlsHideTimer = window.setTimeout(() => {
    hideVideoControls();
  }, CONTROLS_HIDE_DELAY);
};

const syncVideoControlsVisibility = () => {
  if (!videoFrame || !videoControls) return;

  clearVideoControlsTimer();
  videoFrame.classList.add("is-controls-visible");

  videoFrame.addEventListener("pointerenter", showVideoControls);
  videoFrame.addEventListener("pointermove", showVideoControls);
  videoFrame.addEventListener("pointerleave", hideVideoControls);
  videoFrame.addEventListener("pointerdown", showVideoControls);
  videoFrame.addEventListener("focusin", showVideoControls);
  videoFrame.addEventListener("focusout", () => {
    if (videoFrame.matches(":hover")) return;
    hideVideoControls();
  });
};

const toggleVideoFullscreen = async () => {
  const videoFrame = getVideoFrame();
  if (!videoFrame) return;

  if (isVideoFullscreen()) {
    const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
    if (exitFullscreen) await exitFullscreen.call(document);
    return;
  }

  const requestFullscreen = videoFrame.requestFullscreen || videoFrame.webkitRequestFullscreen;
  if (requestFullscreen) await requestFullscreen.call(videoFrame);
};

const playPromoVideo = async () => {
  if (!promoVideo) return;

  promoVideo.muted = true;
  promoVideo.volume = 0;
  if (promoVideo.currentTime >= PROMO_LIMIT_SECONDS) {
    promoVideo.currentTime = 0;
  }

  await startGymBeat();

  try {
    await promoVideo.play();
  } catch {
    stopGymBeat();
  }

  updateVideoButton();
};

const pausePromoVideo = () => {
  promoVideo?.pause();
  stopGymBeat();
  updateVideoButton();
};

const syncPromoAudioWithVisibility = async () => {
  if (!promoVideo) return;

  if (document.hidden) {
    stopGymBeat();
    return;
  }

  if (!promoVideo.paused) {
    await startGymBeat();
    updateVideoButton();
  }
};

videoToggle?.addEventListener("click", async () => {
  if (!promoVideo) return;

  if (promoVideo.paused) {
    await playPromoVideo();
  } else {
    pausePromoVideo();
  }
});

videoFullscreen?.addEventListener("click", async () => {
  if (!promoVideo) return;

  toggleVideoFullscreen().catch(() => {});
  await playPromoVideo();
});

videoScreenToggle?.addEventListener("click", () => {
  toggleVideoFullscreen().catch(() => {});
});

const seekPromoVideo = (seconds) => {
  if (!promoVideo) return;

  const targetTime = Math.max(0, Math.min(Number(seconds) || 0, PROMO_LIMIT_SECONDS));
  const applySeek = () => {
    promoVideo.currentTime = targetTime;
    if (videoSeek) {
      videoSeek.value = String(targetTime);
      videoSeek.style.setProperty("--seek-progress", `${(targetTime / PROMO_LIMIT_SECONDS) * 100}%`);
    }
    if (videoTime) {
      videoTime.textContent = `${formatVideoTime(targetTime)} / ${formatVideoTime(PROMO_LIMIT_SECONDS)}`;
    }
  };

  if (promoVideo.readyState === 0) {
    promoVideo.addEventListener("loadedmetadata", applySeek, { once: true });
  } else {
    applySeek();
  }
};

videoSeek?.addEventListener("input", () => seekPromoVideo(videoSeek.value));
videoSeek?.addEventListener("change", () => seekPromoVideo(videoSeek.value));

promoVideo?.addEventListener("volumechange", () => {
  if (!promoVideo.muted || promoVideo.volume !== 0) {
    promoVideo.muted = true;
    promoVideo.volume = 0;
  }
});

promoVideo?.addEventListener("timeupdate", () => {
  if (promoVideo.currentTime >= PROMO_LIMIT_SECONDS) {
    promoVideo.currentTime = PROMO_LIMIT_SECONDS;
    pausePromoVideo();
  }
  updateVideoProgress();
});

promoVideo?.addEventListener("pause", () => {
  stopGymBeat();
  updateVideoButton();
  updateVideoProgress();
});

promoVideo?.addEventListener("ended", () => {
  promoVideo.currentTime = PROMO_LIMIT_SECONDS;
  stopGymBeat();
  updateVideoButton();
  updateVideoProgress();
});

promoVideo?.addEventListener("loadedmetadata", updateVideoProgress);
promoVideo?.addEventListener("playing", updateVideoButton);
promoVideo?.addEventListener("pause", updateVideoButton);
promoVideo?.addEventListener("ended", updateVideoButton);
document.addEventListener("visibilitychange", () => {
  syncPromoAudioWithVisibility().catch(() => {});
});
window.addEventListener("focus", () => {
  syncPromoAudioWithVisibility().catch(() => {});
});
window.addEventListener("pageshow", () => {
  syncPromoAudioWithVisibility().catch(() => {});
});
document.addEventListener("fullscreenchange", updateFullscreenButton);
document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
updateVideoProgress();
updateFullscreenButton();
updateVideoButton();
syncVideoControlsVisibility();

window.addEventListener("keydown", (event) => {
  const galleryInView = (() => {
    if (!galleryCarousel) return false;
    const rect = galleryCarousel.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    return midpoint > 0 && midpoint < window.innerHeight;
  })();

  if (galleryInView && event.key === "ArrowLeft") {
    event.preventDefault();
    goToSlide(activeCarouselIndex - 1);
    return;
  }

  if (galleryInView && event.key === "ArrowRight") {
    event.preventDefault();
    goToSlide(activeCarouselIndex + 1);
    return;
  }

  if (event.key === "Escape") {
    pausePromoVideo();
  }
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
