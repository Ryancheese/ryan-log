type OpusDecoderInstance = {
  ready: Promise<void>;
  decodeFrame: (frame: Uint8Array) => {
    channelData: Float32Array[];
    samplesDecoded: number;
  };
};

export class XiaozhiAudioPlayer {
  private audioContext: AudioContext | null = null;
  private decoder: OpusDecoderInstance | null = null;
  private nextPlayTime = 0;
  private enabled = true;
  private initPromise: Promise<void> | null = null;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }
    this.initPromise = (async () => {
      const { OpusDecoder } = await import("opus-decoder");
      this.decoder = new OpusDecoder({ sampleRate: 16000, channels: 1 });
      await this.decoder.ready;
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      this.nextPlayTime = this.audioContext.currentTime;
    })();
    return this.initPromise;
  }

  async playOpus(packet: Uint8Array) {
    if (!this.enabled || packet.length === 0) {
      return;
    }
    await this.init();
    if (!this.decoder || !this.audioContext) {
      return;
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    const { channelData, samplesDecoded } = this.decoder.decodeFrame(packet);
    if (!samplesDecoded || !channelData[0]?.length) {
      return;
    }

    const buffer = this.audioContext.createBuffer(1, samplesDecoded, 16000);
    buffer.copyToChannel(Float32Array.from(channelData[0]), 0);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);

    const startAt = Math.max(this.audioContext.currentTime, this.nextPlayTime);
    source.start(startAt);
    this.nextPlayTime = startAt + buffer.duration;
  }

  stop() {
    this.nextPlayTime = 0;
    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
    }
    this.decoder = null;
    this.initPromise = null;
  }
}
