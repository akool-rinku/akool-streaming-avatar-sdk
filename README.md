# Akool Streaming Avatar SDK

A generic JavaScript SDK for integrating Agora RTC streaming avatar functionality into any JavaScript application.

## Installation

### NPM (Node.js/Modern JavaScript)
```bash
npm install akool-streaming-avatar-sdk
```

### CDN (Browser)
```html
<!-- Using unpkg -->
<script src="https://unpkg.com/akool-streaming-avatar-sdk"></script>

<!-- Using jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/akool-streaming-avatar-sdk"></script>
```

## Usage

### Modern JavaScript/TypeScript (ESM)
```typescript
import { GenericAgoraSDK } from 'akool-streaming-avatar-sdk';

// Create an instance of the SDK
const agoraSDK = new GenericAgoraSDK({ mode: "rtc", codec: "vp8" });

// Register event handlers
agoraSDK.on({
  onStreamMessage: (uid, message) => {
    console.log("Received message from", uid, ":", message);
  },
  onException: (error) => {
    console.error("An exception occurred:", error);
  },
  onMessageReceived: (message) => {
    console.log("New message:", message);
  },
  onMessageUpdated: (message) => {
    console.log("Message updated:", message);
  },
  onNetworkStatsUpdated: (stats) => {
    console.log("Network stats:", stats);
  },
  onTokenWillExpire: () => {
    console.log("Token will expire in 30s");
  },
  onTokenDidExpire: () => {
    console.log("Token expired");
  },
  onUserPublished: async (user, mediaType) => {
    if (mediaType === 'video') {
      const remoteTrack = await agoraSDK.getClient().subscribe(user, mediaType);
      remoteTrack?.play('your_video_element_id'); // play the video in a div with id your_video_element_id
    } else if (mediaType === 'audio') {
      const remoteTrack = await agoraSDK.getClient().subscribe(user, mediaType);
      remoteTrack?.play();
    }
  }
});

// get session info from your backend
// # look at https://docs.akool.com/ai-tools-suite/live-avatar#create-session for more details on how to create session.
const akoolSession = await fetch('your-backend-url-to-get-session-info');
const { data: { credentials, id } } = await akoolSession.json();

// Join a channel
await agoraSDK.joinChannel({
  agora_app_id: credentials.agora_app_id,
  agora_channel: credentials.agora_channel,
  agora_token: credentials.agora_token,
  agora_uid: credentials.agora_uid
}).catch(error => {
  console.error("Failed to join channel:", error);
});

// Initialize chat with avatar parameters
await agoraSDK.joinChat({
  vid: "voice-id",
  lang: "en",
  mode: 2 || 1 // 1 for repeat mode, 2 for dialog mode
});

// Send a message
await agoraSDK.sendMessage("Hello, world!");

// Get all messages
const messages = agoraSDK.getMessages();

// Get a specific message
const message = agoraSDK.getMessage("message-id");

// Toggle microphone
await agoraSDK.toggleMic();

// Check states
const isMicOn = agoraSDK.isMicEnabled();
const isConnected = agoraSDK.isConnected();
const isJoined = agoraSDK.isChannelJoined();

// Interrupt current response
await agoraSDK.interrupt();

// Leave chat (keeps channel connection)
await agoraSDK.leaveChat();

// Leave channel
await agoraSDK.leaveChannel();

// Or close everything at once
await agoraSDK.closeStreaming();
```

### CommonJS (Node.js)
```javascript
const { GenericAgoraSDK } = require('akool-streaming-avatar-sdk');

// Create an instance of the SDK
const agoraSDK = new GenericAgoraSDK({ mode: "rtc", codec: "vp8" });

// Register event handlers
agoraSDK.on({
  onStreamMessage: (uid, message) => {
    console.log("Received message from", uid, ":", message);
  },
  onException: (error) => {
    console.error("An exception occurred:", error);
  },
  onMessageReceived: (message) => {
    console.log("New message:", message);
  },
  onMessageUpdated: (message) => {
    console.log("Message updated:", message);
  },
  onNetworkStatsUpdated: (stats) => {
    console.log("Network stats:", stats);
  },
  onTokenWillExpire: () => {
    console.log("Token will expire in 30s");
  },
  onTokenDidExpire: () => {
    console.log("Token expired");
  },
  onUserPublished: async (user, mediaType) => {
    if (mediaType === 'video') {
      const remoteTrack = await agoraSDK.getClient().subscribe(user, mediaType);
      remoteTrack?.play('your_video_element_id'); // play the video in a div with id your_video_element_id
    } else if (mediaType === 'audio') {
      const remoteTrack = await agoraSDK.getClient().subscribe(user, mediaType);
      remoteTrack?.play();
    }
  }
});

// Join a channel
agoraSDK.joinChannel({
  agora_app_id: "your-app-id",
  agora_channel: "your-channel",
  agora_token: "your-token",
  agora_uid: 12345
}).then(() => {
  console.log("Joined channel");
}).catch((error) => {
  console.error("Failed to join channel:", error);
});

// Initialize chat with avatar parameters
agoraSDK.joinChat({
  vid: "voice-id",
  lang: "en",
  mode: 2
}).then(() => {
  console.log("Initialized chat");
}).catch((error) => {
  console.error("Failed to initialize chat:", error);
});

// Send a message
agoraSDK.sendMessage("Hello, world!").then(() => {
  console.log("Message sent");
}).catch((error) => {
  console.error("Failed to send message:", error);
});

// Get all messages
const messages = agoraSDK.getMessages();

// Get a specific message
const message = agoraSDK.getMessage("message-id");

// Toggle microphone
agoraSDK.toggleMic().then(() => {
  console.log("Microphone toggled");
}).catch((error) => {
  console.error("Failed to toggle microphone:", error);
});

// Check states
const isMicOn = agoraSDK.isMicEnabled();
const isConnected = agoraSDK.isConnected();
const isJoined = agoraSDK.isChannelJoined();

// Interrupt current response
agoraSDK.interrupt().then(() => {
  console.log("Current response interrupted");
}).catch((error) => {
  console.error("Failed to interrupt current response:", error);
});

// Leave chat (keeps channel connection)
agoraSDK.leaveChat().then(() => {
  console.log("Left chat");
}).catch((error) => {
  console.error("Failed to leave chat:", error);
});

// Leave channel
agoraSDK.leaveChannel().then(() => {
  console.log("Left channel");
}).catch((error) => {
  console.error("Failed to leave channel:", error);
});

// Or close everything at once
agoraSDK.closeStreaming().then(() => {
  console.log("Closed streaming");
}).catch((error) => {
  console.error("Failed to close streaming:", error);
});
```

### Browser (Global/IIFE)
```html
<script src="https://unpkg.com/akool-streaming-avatar-sdk"></script>
<script>
  // The SDK is available as AkoolStreamingAvatar global
  const agoraSDK = new AkoolStreamingAvatar.GenericAgoraSDK({ mode: "rtc", codec: "vp8" });

  // Register event handlers
  agoraSDK.on({
    onStreamMessage: (uid, message) => {
      console.log("Received message from", uid, ":", message);
    },
    onException: (error) => {
      console.error("An exception occurred:", error);
    },
    onMessageReceived: (message) => {
      console.log("New message:", message);
    },
    onMessageUpdated: (message) => {
      console.log("Message updated:", message);
    },
    onNetworkStatsUpdated: (stats) => {
      console.log("Network stats:", stats);
    },
    onTokenWillExpire: () => {
      console.log("Token will expire in 30s");
    },
    onTokenDidExpire: () => {
      console.log("Token expired");
    },
    onUserPublished: async (user, mediaType) => {
      if (mediaType === 'video') {
        const remoteTrack = await agoraSDK.getClient().subscribe(user, mediaType);
        remoteTrack?.play('remote-video');
      }
    }
  });

  // Example functions
  async function initializeSDK() {
    // These values would typically come from your PHP backend
    await agoraSDK.joinChannel({
      agora_app_id: "YOUR_APP_ID",
      agora_channel: "YOUR_CHANNEL",
      agora_token: "YOUR_TOKEN",
      agora_uid: 12345
    });

    await agoraSDK.joinChat({
      vid: "YOUR_VOICE_ID",
      lang: "en",
      mode: 2
    });
  }

  async function toggleMic() {
    await agoraSDK.toggleMic();
  }

  async function sendMessage() {
    await agoraSDK.sendMessage("Hello from PHP!");
  }

  // Initialize when page loads
  initializeSDK().catch(console.error);
</script>
```


## Features

- Easy-to-use API for Agora RTC integration
- TypeScript support with full type definitions
- Multiple bundle formats (ESM, CommonJS, IIFE)
- CDN distribution via unpkg and jsDelivr
- Event-based architecture for handling messages and state changes
- Message management with history and updates
- Network quality monitoring and statistics
- Microphone control for voice interactions
- Chunked message sending for large text
- Automatic rate limiting for message chunks
- Token expiry handling
- Error handling and logging

## API Reference

### Constructor

```typescript
new GenericAgoraSDK(options?: { mode?: string; codec?: SDK_CODEC })
```

### Methods

- `joinChannel(credentials: AgoraCredentials): Promise<void>` - Joins an Agora RTC channel
- `joinChat(metadata: Metadata): Promise<void>` - Initializes the avatar chat session
- `sendMessage(content: string): Promise<void>` - Sends a message to the avatar
- `interrupt(): Promise<void>` - Interrupts the current avatar response
- `toggleMic(): Promise<void>` - Toggles the microphone on/off
- `isMicEnabled(): boolean` - Checks if microphone is enabled
- `isConnected(): boolean` - Checks if connected to Agora services
- `isChannelJoined(): boolean` - Checks if joined to a channel
- `getMessages(): Message[]` - Returns all chat messages
- `getMessage(messageId: string): Message | undefined` - Returns a specific message
- `leaveChat(): Promise<void>` - Leaves the chat session but stays in channel
- `leaveChannel(): Promise<void>` - Leaves the Agora RTC channel
- `closeStreaming(): Promise<void>` - Closes all connections and cleanup
- `on(events: SDKEvents): void` - Registers event handlers

### Events

The SDK supports the following events through the `on()` method:

- `onStreamMessage`: Fired when a raw message is received
- `onMessageReceived`: Fired when a new chat message is received
- `onMessageUpdated`: Fired when an existing message is updated
- `onNetworkStatsUpdated`: Fired when network statistics are updated
- `onException`: Fired when an error occurs
- `onNetworkQuality`: Fired when network quality changes
- `onUserJoined`: Fired when a user joins the channel
- `onUserLeft`: Fired when a user leaves the channel
- `onUserPublished`: Fired when a user publishes media
- `onUserUnpublished`: Fired when a user stops publishing media
- `onTokenWillExpire`: Fired when the token is about to expire
- `onTokenDidExpire`: Fired when the token has expired
- `onRemoteAudioStats`: Fired when remote audio stats are updated
- `onRemoteVideoStats`: Fired when remote video stats are updated

## Types

```typescript
interface AgoraCredentials {
  agora_app_id: string;
  agora_channel: string;
  agora_token: string;
  agora_uid: number;
}

type Metadata = {
  vid?: string;    // voiceId
  vurl?: string;   // voiceUrl
  lang?: string;   // language
  mode?: number;   // modeType
  bgurl?: string;  // backgroundUrl
};

interface Message {
  id: string;
  text: string;
  isSentByMe: boolean;
}

interface NetworkStats {
  localNetwork: NetworkQuality;
  remoteNetwork: NetworkQuality;
  video: RemoteVideoTrackStats;
  audio: RemoteAudioTrackStats;
}
```

## Requirements

- Node.js 14 or higher (for development)
- Modern browser with WebRTC support

## Browser Support

The SDK requires a modern browser with WebRTC support, including:
- Chrome 56+
- Firefox 44+
- Safari 11+
- Edge 79+
- Opera 43+

## License

ISC License