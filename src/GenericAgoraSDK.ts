import AgoraRTC, {
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
  NetworkQuality,
  RemoteAudioTrackStats,
  RemoteVideoTrackStats,
  UID,
  SDK_CODEC,
  ClientConfig,
} from "agora-rtc-sdk-ng";

import {
  RTCClient,
  AgoraCredentials,
  Metadata,
  StreamMessage,
  NetworkStats,
  Message,
  ChatResponsePayload,
  CommandResponsePayload,
} from "./types";

import {
  setAvatarParams,
  interruptResponse,
  sendMessageToAvatar,
} from "./agoraHelpers";

export interface SDKEvents {
  onStreamMessage?: (uid: UID, message: StreamMessage) => void;
  onException?: (error: { code: number; msg: string; uid: UID }) => void;
  onNetworkQuality?: (stats: NetworkQuality) => void;
  onUserJoined?: (user: IAgoraRTCRemoteUser) => void;
  onUserLeft?: (user: IAgoraRTCRemoteUser, reason: string) => void;
  onRemoteAudioStats?: (stats: RemoteAudioTrackStats) => void;
  onRemoteVideoStats?: (stats: RemoteVideoTrackStats) => void;
  onTokenWillExpire?: () => void;
  onTokenDidExpire?: () => void;
  onMessageReceived?: (message: Message) => void;
  onMessageUpdated?: (message: Message) => void;
  onNetworkStatsUpdated?: (stats: NetworkStats) => void;
  onUserPublished?: (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio' | 'datachannel') => void;
  onUserUnpublished?: (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio' | 'datachannel') => void;
}

export class GenericAgoraSDK {
  private client: RTCClient;
  private audioTrack: IMicrophoneAudioTrack | null = null;
  private events: SDKEvents = {};
  private messageMap: Map<string, Message> = new Map();
  private isJoined: boolean = false;
  private connected: boolean = false;

  constructor(options?: { mode?: string; codec?: SDK_CODEC }) {
    this.client = AgoraRTC.createClient({
      mode: options?.mode || "rtc",
      codec: options?.codec || "vp8",
    } as ClientConfig) as RTCClient;
    this.registerDefaultListeners();
  }

  private registerDefaultListeners() {
    // Stream messages
    this.client.on("stream-message", (uid: UID, body: Uint8Array) => {
      try {
        const decodedMsg = new TextDecoder().decode(body);
        console.log(`Received stream-message from ${uid}: ${decodedMsg}`);
        const message = JSON.parse(decodedMsg) as StreamMessage;
        if (message.v !== 2) {
          console.warn(`Unsupported message version: ${message.v}`);
          return;
        }

        if (message.type === 'chat') {
          const { text, from } = message.pld as ChatResponsePayload;
          const msg_id = `${message.type}_${message.mid}`;
          
          if (!this.messageMap.has(msg_id)) {
            const newMessage: Message = {
              id: msg_id,
              text,
              isSentByMe: from === 'user',
            };
            this.messageMap.set(msg_id, newMessage);
            if (this.events.onMessageReceived) {
              this.events.onMessageReceived(newMessage);
            }
          } else {
            const existingMessage = this.messageMap.get(msg_id)!;
            existingMessage.text += text;
            this.messageMap.set(msg_id, existingMessage);
            if (this.events.onMessageUpdated) {
              this.events.onMessageUpdated(existingMessage);
            }
          }
        } else if (message.type === 'cmd') {
          const { cmd, code, msg } = message.pld as CommandResponsePayload;
          console.log(`cmd-response, cmd=${cmd}, code=${code}, msg=${msg}`);
          if (code !== 1000) {
            console.error(`Command failed: ${cmd}, code=${code}, msg=${msg}`);
          }
        }

        if (this.events.onStreamMessage) {
          this.events.onStreamMessage(uid, message);
        }
      } catch (error) {
        console.error("Error decoding stream message:", error);
      }
    });

    // Exception handling
    this.client.on("exception", (error) => {
      if (this.events.onException) {
        this.events.onException(error);
      }
    });

    // Network quality monitoring
    this.client.on("network-quality", (stats: NetworkQuality) => {
      if (this.events.onNetworkQuality) {
        this.events.onNetworkQuality(stats);
      }

      // Update network stats
      const videoStats = this.client.getRemoteVideoStats();
      const audioStats = this.client.getRemoteAudioStats();
      const networkStats = this.client.getRemoteNetworkQuality();

      const firstVideoStats = Object.values(videoStats)[0] || {};
      const firstAudioStats = Object.values(audioStats)[0] || {};
      const firstNetworkStats = Object.values(networkStats)[0] || {};

      const networkStatsUpdate: NetworkStats = {
        localNetwork: stats,
        remoteNetwork: firstNetworkStats as NetworkQuality,
        video: firstVideoStats as RemoteVideoTrackStats,
        audio: firstAudioStats as RemoteAudioTrackStats,
      };

      if (this.events.onNetworkStatsUpdated) {
        this.events.onNetworkStatsUpdated(networkStatsUpdate);
      }
    });

    // User join/leave events
    this.client.on("user-joined", (user) => {
      if (this.events.onUserJoined) {
        this.events.onUserJoined(user);
      }
    });

    this.client.on("user-left", (user, reason) => {
      if (this.events.onUserLeft) {
        this.events.onUserLeft(user, reason);
      }
    });

    // Remote media stats
    this.client.on("remote-audio-stats", (stats: RemoteAudioTrackStats) => {
      if (this.events.onRemoteAudioStats) {
        this.events.onRemoteAudioStats(stats);
      }
    });

    this.client.on("remote-video-stats", (stats: RemoteVideoTrackStats) => {
      if (this.events.onRemoteVideoStats) {
        this.events.onRemoteVideoStats(stats);
      }
    });

    // Token expiry
    this.client.on("token-privilege-will-expire", () => {
      if (this.events.onTokenWillExpire) {
        this.events.onTokenWillExpire();
      }
    });

    this.client.on("token-privilege-did-expire", () => {
      if (this.events.onTokenDidExpire) {
        this.events.onTokenDidExpire();
      }
    });

    // Media events
    this.client.on("user-published", (user, mediaType) => {
      if (this.events.onUserPublished) {
        this.events.onUserPublished(user, mediaType);
      }
    });

    this.client.on("user-unpublished", (user, mediaType) => {
      if (this.events.onUserUnpublished) {
        this.events.onUserUnpublished(user, mediaType);
      }
    });
  }

  public on(events: SDKEvents) {
    this.events = { ...this.events, ...events };
  }

  public async joinChannel(credentials: AgoraCredentials): Promise<void> {
    if (this.isJoined) {
      await this.leaveChannel();
    }

    const { agora_app_id, agora_channel, agora_token, agora_uid } = credentials;
    await this.client.join(agora_app_id, agora_channel, agora_token, agora_uid);
    this.isJoined = true;
  }

  public async joinChat(metadata: Metadata): Promise<void> {
    await setAvatarParams(this.client, metadata);
    this.connected = true;
  }

  public async leaveChat(): Promise<void> {
    this.client.removeAllListeners('stream-message');
    this.connected = false;
    this.messageMap.clear();
  }

  public async leaveChannel(): Promise<void> {
    if (this.audioTrack) {
      await this.client.unpublish(this.audioTrack);
      this.audioTrack.stop();
      this.audioTrack.close();
      this.audioTrack = null;
    }

    await this.client.leave();
    this.isJoined = false;

    // Clean up listeners
    this.client.removeAllListeners('network-quality');
    this.client.removeAllListeners('exception');
    this.client.removeAllListeners('user-published');
    this.client.removeAllListeners('user-unpublished');
    this.client.removeAllListeners('token-privilege-will-expire');
    this.client.removeAllListeners('token-privilege-did-expire');
  }

  public async closeStreaming(cb?: () => void): Promise<void> {
    await this.leaveChat();
    await this.leaveChannel();
    if (cb) {
      cb();
    }
  }

  public async sendMessage(content: string): Promise<void> {
    const messageId = `msg-${Date.now()}`;
    const message: Message = {
      id: messageId,
      text: content,
      isSentByMe: true,
    };

    this.messageMap.set(messageId, message);
    if (this.events.onMessageReceived) {
      this.events.onMessageReceived(message);
    }

    await sendMessageToAvatar(this.client, messageId, content);
  }

  public async interrupt(): Promise<void> {
    await interruptResponse(this.client);
  }

  public async toggleMic(): Promise<void> {
    if (!this.audioTrack) {
      this.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: "speech_low_quality",
        AEC: true,
        ANS: true,
        AGC: true,
      });
      await this.client.publish(this.audioTrack);
      console.log("Microphone enabled.");
    } else {
      this.audioTrack.stop();
      this.audioTrack.close();
      await this.client.unpublish(this.audioTrack);
      this.audioTrack = null;
      console.log("Microphone disabled.");
    }
  }

  public isMicEnabled(): boolean {
    return this.audioTrack !== null;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public isChannelJoined(): boolean {
    return this.isJoined;
  }

  public getMessages(): Message[] {
    return Array.from(this.messageMap.values());
  }

  public getMessage(messageId: string): Message | undefined {
    return this.messageMap.get(messageId);
  }

  public getClient(): RTCClient {
    return this.client;
  }
} 