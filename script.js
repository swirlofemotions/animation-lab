'use strict';

// Движение задаётся в style.css; здесь — только события и состояния интерфейса.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// 07. Последовательное переключение дня и ночи.
const sky = document.querySelector('#sky-switch');
const skyStatus = document.querySelector('#sky-status');
let skyTimers = [];
function clearSkyTimers() {
  skyTimers.forEach(clearTimeout);
  skyTimers = [];
}
function setNight(night) {
  clearSkyTimers();
  sky.classList.toggle('is-night', night);
  sky.setAttribute('aria-pressed', String(night));
  sky.setAttribute('aria-label', night ? 'Переключить ночь на день' : 'Переключить день на ночь');
  if (reducedMotion.matches) {
    skyStatus.textContent = night ? 'Ночь · луна и звёзды' : 'День · исходное состояние';
    return;
  }
  if (night) {
    skyStatus.textContent = 'Солнце и облако уходят влево…';
    const phases = [
      [800, 'Солнце становится луной…'],
      [1400, 'Справа появляются звёзды…'],
      [1800, 'Небо темнеет…'],
      [2450, 'Ночь · луна и звёзды']
    ];
    phases.forEach(([delay, text]) => skyTimers.push(setTimeout(() => {
      skyStatus.textContent = text;
    }, delay)));
  } else {
    skyStatus.textContent = 'Возвращение к солнечному дню…';
    skyTimers.push(setTimeout(() => {
      skyStatus.textContent = 'День · исходное состояние';
    }, 850));
  }
}
sky.addEventListener('click', () => setNight(!sky.classList.contains('is-night')));
document.querySelector('#sky-reset').addEventListener('click', () => setNight(false));

// 08. Галерея без автопрокрутки: стрелки на границах становятся полосками.
const slider = document.querySelector('#slider');
const track = document.querySelector('#slide-track');
const slides = [...track.children];
const dots = [...document.querySelectorAll('[data-slide]')];
const previous = document.querySelector('#slide-prev');
const next = document.querySelector('#slide-next');
const slideStatus = document.querySelector('#slide-status');
let slideIndex = 0;
function showSlide(index) {
  slideIndex = Math.max(0, Math.min(slides.length - 1, index));
  track.style.transform = `translateX(-${slideIndex * 100}%)`;
  slides.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== slideIndex)));
  dots.forEach((dot, i) => {
    if (i === slideIndex) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
  previous.disabled = slideIndex === 0;
  next.disabled = slideIndex === slides.length - 1;
  previous.classList.toggle('is-edge', previous.disabled);
  next.classList.toggle('is-edge', next.disabled);
  const edge = slideIndex === 0 ? ' · начало' : slideIndex === slides.length - 1 ? ' · конец' : '';
  slideStatus.textContent = `Кадр ${slideIndex + 1} из ${slides.length}${edge}`;
}
previous.addEventListener('click', () => showSlide(slideIndex - 1));
next.addEventListener('click', () => showSlide(slideIndex + 1));
dots.forEach(dot => dot.addEventListener('click', () => showSlide(Number(dot.dataset.slide))));
document.querySelector('#slide-reset').addEventListener('click', () => showSlide(0));
slider.addEventListener('keydown', event => {
  const keys = {ArrowLeft: slideIndex - 1, ArrowRight: slideIndex + 1, Home: 0, End: slides.length - 1};
  if (Object.hasOwn(keys, event.key)) {
    event.preventDefault();
    showSlide(keys[event.key]);
  }
});

// 09. Конечная CSS-анимация длительностью 14 секунд, с паузой и перезапуском.
const cradle = document.querySelector('#cradle');
const cradleStage = cradle.closest('.cradle-stage');
const cradleStart = document.querySelector('#cradle-start');
const cradlePause = document.querySelector('#cradle-pause');
const cradleStatus = document.querySelector('#cradle-status');
function resetCradle() {
  cradle.classList.remove('is-running', 'is-paused');
  cradleStage.classList.remove('is-running', 'is-paused', 'is-finished');
  cradleStart.textContent = 'Запустить';
  cradlePause.textContent = 'Пауза';
  cradlePause.disabled = true;
  cradlePause.setAttribute('aria-pressed', 'false');
  cradleStatus.textContent = 'Покой';
  cradle.setAttribute('aria-label', 'Запустить колебания шариков слева направо');
}
function startCradle() {
  resetCradle();
  // Сбросить предыдущую CSS-анимацию перед повторным запуском.
  void cradle.offsetWidth;
  cradle.classList.add('is-running');
  cradleStage.classList.add('is-running');
  cradleStart.textContent = 'Заново';
  cradlePause.disabled = false;
  cradleStatus.textContent = reducedMotion.matches ? 'Сокращённое движение' : 'Колебания · 44° → 30° → 17° → 6°';
  cradle.setAttribute('aria-label', 'Перезапустить колебания шариков');
}
function pauseCradle() {
  if (!cradle.classList.contains('is-running')) return;
  const paused = !cradle.classList.contains('is-paused');
  cradle.classList.toggle('is-paused', paused);
  cradleStage.classList.toggle('is-paused', paused);
  cradlePause.textContent = paused ? 'Продолжить' : 'Пауза';
  cradlePause.setAttribute('aria-pressed', String(paused));
  cradleStatus.textContent = paused ? 'Пауза' : 'Колебания · продолжаются';
}
cradle.addEventListener('click', startCradle);
cradleStart.addEventListener('click', startCradle);
cradlePause.addEventListener('click', pauseCradle);
document.querySelector('#cradle-reset').addEventListener('click', resetCradle);
cradle.addEventListener('animationend', event => {
  if (event.animationName !== 'right-swing' || !cradle.classList.contains('is-running')) return;
  resetCradle();
  cradleStage.classList.add('is-finished');
  cradleStart.textContent = 'Повторить';
  cradleStatus.textContent = reducedMotion.matches ? 'Покой · движение сокращено' : 'Покой · колебания затихли';
});

// 19. Персонаж: запуск, настоящая пауза и возврат статичной исходной позы.
const rooster = document.querySelector('#rooster-scene');
const roosterToggle = document.querySelector('#rooster-toggle');
const roosterStatus = document.querySelector('#rooster-status');
roosterToggle.addEventListener('click', () => {
  if (!rooster.classList.contains('is-alive')) {
    rooster.classList.add('is-alive');
    roosterToggle.textContent = 'Пауза';
    roosterToggle.setAttribute('aria-pressed', 'true');
    roosterStatus.textContent = reducedMotion.matches ? 'Сокращённое движение' : 'Петушок ожил';
    return;
  }
  const paused = !rooster.classList.contains('is-paused');
  rooster.classList.toggle('is-paused', paused);
  roosterToggle.textContent = paused ? 'Продолжить' : 'Пауза';
  roosterToggle.setAttribute('aria-pressed', String(!paused));
  roosterStatus.textContent = paused ? 'Пауза' : 'Петушок ожил';
});
document.querySelector('#rooster-reset').addEventListener('click', () => {
  rooster.classList.remove('is-alive', 'is-paused');
  roosterToggle.textContent = 'Оживить петушка';
  roosterToggle.setAttribute('aria-pressed', 'false');
  roosterStatus.textContent = 'Статичный персонаж';
});

showSlide(0);
resetCradle();
