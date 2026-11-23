type SfxName = "attack" | "hit" | "heal" | "levelup" | "event" | "ending" | "click";

class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private bgmNodes: AudioNode[] = [];
  muted = false;

  private ensure(): AudioContext {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.25;
      this.master.connect(this.ctx.destination);
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0;
      this.bgmGain.connect(this.master);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  warmup() { this.ensure(); }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.25;
  }

  private tone(freq: number, dur: number, type: OscillatorType, gain = 0.4, slideTo?: number) {
    const ctx = this.ensure();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(g).connect(this.master!);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }

  private noise(dur: number, gain = 0.3) {
    const ctx = this.ensure();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(g).connect(this.master!);
    src.start();
  }

  sfx(name: SfxName) {
    if (this.muted) return;
    switch (name) {
      case "attack": this.tone(220, 0.08, "sawtooth", 0.3, 110); break;
      case "hit": this.noise(0.15, 0.35); break;
      case "heal": this.tone(440, 0.25, "sine", 0.25, 660); break;
      case "levelup":
        this.tone(523, 0.15, "sine", 0.3);
        setTimeout(() => this.tone(659, 0.15, "sine", 0.3), 120);
        setTimeout(() => this.tone(784, 0.3, "sine", 0.3), 240);
        break;
      case "event": this.tone(880, 0.4, "sine", 0.15, 660); break;
      case "ending":
        this.tone(392, 0.6, "triangle", 0.25);
        setTimeout(() => this.tone(523, 0.8, "triangle", 0.25), 300);
        break;
      case "click": this.tone(660, 0.03, "sine", 0.06); break;
    }
  }

  startBgm() {
    const ctx = this.ensure();
    this.stopBgm();
    const drone = ctx.createOscillator();
    drone.type = "sine";
    drone.frequency.value = 55;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain).connect(drone.frequency);
    drone.connect(this.bgmGain!);
    drone.start(); lfo.start();
    this.bgmGain!.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 2);
    this.bgmNodes = [drone, lfo];
  }

  stopBgm() {
    if (!this.ctx) return;
    this.bgmNodes.forEach((n) => { try { (n as OscillatorNode).stop(); } catch {} });
    this.bgmNodes = [];
    this.bgmGain?.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
  }
}

export const audio = new AudioManager();
