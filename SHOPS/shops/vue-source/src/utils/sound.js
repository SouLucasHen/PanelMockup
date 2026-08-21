/**
 * Efeitos sonoros via Web Audio API — sem arquivos externos.
 * Gera tons curtos e sutis para ações do carrinho.
 */

let ctx = null;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return ctx;
}

/**
 * Som de click curto e sutil (botões +/-).
 */
export function playClick() {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, c.currentTime + 0.05);

    gain.gain.setValueAtTime(0.08, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(c.destination);

    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.08);
  } catch {}
}

/**
 * Som de adicionar ao carrinho — tom ascendente suave.
 */
export function playAdd() {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(520, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, c.currentTime + 0.1);

    gain.gain.setValueAtTime(0.07, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(c.destination);

    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.15);
  } catch {}
}

/**
 * Som de remover do carrinho — tom descendente suave.
 */
export function playRemove() {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, c.currentTime + 0.1);

    gain.gain.setValueAtTime(0.06, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(c.destination);

    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.12);
  } catch {}
}
