export type BackgroundEffect = 'none' | 'blur' | 'image';

export class BackgroundManager {
  private selfieSegmentation: any = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private bgImage: HTMLImageElement | null = null;
  private currentEffect: BackgroundEffect = 'none';
  private videoElement: HTMLVideoElement | null = null;
  private isProcessing = false;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async init() {
    if (this.selfieSegmentation) return;

    // Load MediaPipe from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js';
    document.head.appendChild(script);

    return new Promise((resolve) => {
      script.onload = () => {
        // @ts-ignore
        this.selfieSegmentation = new SelfieSegmentation({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
        });

        this.selfieSegmentation.setOptions({
          modelSelection: 1, // 0 for general, 1 for landscape
        });

        this.selfieSegmentation.onResults(this.onResults.bind(this));
        resolve(true);
      };
    });
  }

  setEffect(effect: BackgroundEffect, imageUrl?: string) {
    this.currentEffect = effect;
    if (effect === 'image' && imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      img.onload = () => { this.bgImage = img; };
    }
  }

  private onResults(results: any) {
    if (!this.videoElement) return;

    this.canvas.width = results.image.width;
    this.canvas.height = results.image.height;

    this.ctx.save();
    
    // 1. Draw the Background First
    if (this.currentEffect === 'blur') {
      this.ctx.filter = 'blur(15px)';
      this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.filter = 'none';
    } else if (this.currentEffect === 'image' && this.bgImage) {
      this.ctx.drawImage(this.bgImage, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 2. Draw the User Mask (to cut the user out)
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.drawImage(results.segmentationMask, 0, 0, this.canvas.width, this.canvas.height);

    // 3. Draw the User (Only the user is kept)
    this.ctx.globalCompositeOperation = 'destination-over';
    this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);

    this.ctx.restore();
  }

  async startProcessing(video: HTMLVideoElement) {
    this.videoElement = video;
    if (this.isProcessing) return;
    this.isProcessing = true;

    const process = async () => {
      if (!this.isProcessing) return;
      if (this.currentEffect !== 'none' && this.selfieSegmentation) {
        await this.selfieSegmentation.send({ image: video });
      }
      requestAnimationFrame(process);
    };
    process();
  }

  stopProcessing() {
    this.isProcessing = false;
  }

  getCanvas() {
    return this.canvas;
  }
}
