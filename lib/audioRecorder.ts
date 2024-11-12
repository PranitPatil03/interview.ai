import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export class AudioRecorder {
  private audioContext: AudioContext | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private recordedChunks: Float32Array[] = [];
  private isRecording: boolean = false;
  private s3Client: S3Client;
  private bucketName: string;
  private isPaused: boolean = false;

  constructor(config: {
    bucketName: string;
    region: string;
    credentials: {
      accessKeyId: string;
      secretAccessKey: string;
    };
  }) {
    this.bucketName = config.bucketName;
    this.s3Client = new S3Client({
      region: config.region,
      credentials: config.credentials,
    });
  }

  async startRecording(stream: MediaStream): Promise<void> {
    try {
      this.audioContext = new AudioContext({ sampleRate: 44100 });
      this.mediaStreamSource =
        this.audioContext.createMediaStreamSource(stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.mediaStreamSource.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      this.recordedChunks = [];
      this.isRecording = true;

      this.processor.onaudioprocess = (e) => {
        if (this.isRecording && !this.isPaused) {
          this.recordedChunks.push(
            new Float32Array(e.inputBuffer.getChannelData(0))
          );
        }
      };
    } catch (error) {
      console.error("Error starting recording:", error);
      throw error;
    }
  }

  async stopRecordingAndUpload(): Promise<string> {
    if (!this.isRecording) {
      throw new Error("Not currently recording");
    }

    this.isRecording = false;
    if (this.processor && this.mediaStreamSource) {
      this.processor.disconnect();
      this.mediaStreamSource.disconnect();
    }

    try {
      const audioBlob = this.exportWAV(this.recordedChunks, 44100);
      const fileName = `interview-${Date.now()}.wav`;
      return await this.uploadToS3(audioBlob, fileName);
    } catch (error) {
      console.error("Error stopping recording and uploading:", error);
      throw error;
    }
  }

  private exportWAV(recordedChunks: Float32Array[], sampleRate: number): Blob {
    const bufferLength = recordedChunks.reduce(
      (acc, chunk) => acc + chunk.length,
      0
    );
    const audioBuffer = new Float32Array(bufferLength);
    let offset = 0;
    for (const chunk of recordedChunks) {
      audioBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    const wavBuffer = this.createWavFile(audioBuffer, sampleRate);
    return new Blob([wavBuffer], { type: "audio/wav" });
  }

  private createWavFile(
    samples: Float32Array,
    sampleRate: number
  ): ArrayBuffer {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    const numChannels = 1;

    writeString(view, 0, "RIFF");
    view.setUint32(4, 32 + samples.length * 2, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, samples.length * 2, true);

    const volume = 1;
    let index = 44;
    for (let i = 0; i < samples.length; i++) {
      view.setInt16(index, samples[i] * (0x7fff * volume), true);
      index += 2;
    }

    return buffer;
  }

  async uploadToS3(audioBlob: Blob, fileName: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: `recordings/${fileName}`,
        Body: audioBlob,
        ContentType: "audio/wav",
      });

      await this.s3Client.send(command);
      const fileUrl = `https://${this.bucketName}.s3.amazonaws.com/recordings/${fileName}`;
      return fileUrl;
    } catch (error) {
      console.error("Error uploading to S3:", error);
      throw error;
    }
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  pauseRecording() {
    if (!this.isRecording) {
      throw new Error("Not currently recording");
    }
    this.isPaused = true;
  }

  resumeRecording() {
    if (!this.isRecording) {
      throw new Error("Not currently recording");
    }
    if (!this.isPaused) {
      throw new Error("Recording is not paused");
    }
    this.isPaused = false;
  }
}
