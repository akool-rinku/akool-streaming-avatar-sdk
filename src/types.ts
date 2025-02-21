import { IAgoraRTCClient, NetworkQuality, RemoteAudioTrackStats, RemoteVideoTrackStats } from "agora-rtc-sdk-ng";

export interface RTCClient extends IAgoraRTCClient {
  sendStreamMessage(msg: Uint8Array | string, flag: boolean): Promise<void>;
}

export interface AgoraCredentials {
  agora_app_id: string;
  agora_channel: string;
  agora_token: string;
  agora_uid: number;
}

export interface NetworkStats {
  localNetwork: NetworkQuality;
  remoteNetwork: NetworkQuality;
  video: RemoteVideoTrackStats;
  audio: RemoteAudioTrackStats;
}

export interface Message {
  id: string;
  text: string;
  isSentByMe: boolean;
}

export type Metadata = {
  vid?: string;    // voiceId
  vurl?: string;   // voiceUrl
  lang?: string;   // language
  mode?: number;   // modeType
  bgurl?: string;  // backgroundUrl
};

export type CommandPayload = {
  cmd: string;
  data?: Metadata;
};

export type CommandResponsePayload = {
  cmd: string;
  code: number;
  msg?: string;
};

export type ChatPayload = {
  text: string;
  meta?: Metadata;
};

export type ChatResponsePayload = {
  text: string;
  from: 'bot' | 'user';
};

export type StreamMessage = {
  v: number;
  type: string;
  mid: string;
  idx?: number;
  fin?: boolean;
  pld: CommandPayload | ChatPayload | CommandResponsePayload | ChatResponsePayload;
}; 