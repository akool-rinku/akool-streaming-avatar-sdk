import { useEffect, useState, useCallback } from 'react';

import { GenericAgoraSDK } from 'akool-streaming-avatar-sdk';
import type { SDKEvents } from 'akool-streaming-avatar-sdk';
import type { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { 
  Box, 
  Button, 
  TextField, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  CircularProgress
} from '@mui/material';

interface Message {
  id: string;
  text: string;
  isSentByMe: boolean;
}



export const AvatarChat = () => {
  const [sdk, setSdk] = useState<GenericAgoraSDK | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceId] = useState('Xb7hH8MSUJpSbSDYk0k2');
  const [lang] = useState('en');

  useEffect(() => {
    const initSDK = async () => {
      const agoraSDK = new GenericAgoraSDK({ mode: "rtc", codec: "vp8" });
      
      const events: Partial<SDKEvents> = {
        onMessageReceived: (message: Message) => {
          setMessages(prev => [...prev, message]);
        },
        onMessageUpdated: (message: Message) => {
          setMessages(prev => prev.map(m => m.id === message.id ? message : m));
        },
        onException(error) {
          console.error("An exception occurred:", error);
        },
        onUserPublished: async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video' | 'datachannel') => {
          if (mediaType === 'video') {
            const remoteTrack = await agoraSDK.getClient().subscribe(user, mediaType);
            remoteTrack?.play('avatar-video');
          }
        }
      };

      agoraSDK.on(events);
      setSdk(agoraSDK);
    };

    initSDK();

    return () => {
      sdk?.closeStreaming();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectToChannel = useCallback(async () => {
    if (!sdk) return;
    
    try {
      setIsLoading(true);


      // In a real app, you would get these credentials from your backend
      const token = "your_token";
      const response = await fetch('https://openapi.akool.com/api/open/v4/liveAvatar/session/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          avatar_id: 'your_avatar_id',
        })
      });

      const data = await response.json();
      if(data.code !== 1000) {
        // mui toast
        alert(data.msg);
        throw new Error('Failed to create session');
      }
      const credentials = data.data.credentials;

      await sdk.joinChannel({
        agora_app_id: credentials.agora_app_id,
        agora_channel: credentials.agora_channel,
        agora_token: credentials.agora_token,
        agora_uid: credentials.agora_uid
      });

      await sdk.joinChat({
        vid: voiceId,
        lang: lang,
        mode: 2
      });

      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setIsLoading(false);
    }
  }, [sdk, voiceId, lang]);

  const toggleMic = useCallback(async () => {
    if (!sdk) return;
    await sdk.toggleMic();
    setIsMicEnabled(prev => !prev);
  }, [sdk]);

  const sendMessage = useCallback(async () => {
    if (!sdk || !inputMessage.trim()) return;
    
    try {
      await sdk.sendMessage(inputMessage);
      setInputMessage('');
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [sdk, inputMessage]);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Akool Avatar Chat Demo
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            onClick={connectToChannel}
            disabled={isConnected || isLoading}
            sx={{ mr: 2 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Connect'}
          </Button>

          <Button
            variant="outlined"
            onClick={toggleMic}
            disabled={!isConnected}
          >
            {isMicEnabled ? 'Disable Mic' : 'Enable Mic'}
          </Button>
        </Box>

        <Box id="avatar-video" sx={{ width: '100%', height: 300, bgcolor: 'black', mb: 2 }} />

        <Paper 
          variant="outlined" 
          sx={{ 
            height: 300, 
            mb: 2, 
            overflow: 'auto',
            p: 2
          }}
        >
          <List>
            {messages.map((message) => (
              <ListItem key={message.id} sx={{ flexDirection: message.isSentByMe ? 'row-reverse' : 'row' }}>
                <ListItemText 
                  primary={message.text}
                  sx={{ 
                    textAlign: message.isSentByMe ? 'right' : 'left',
                    '& .MuiListItemText-primary': {
                      display: 'inline-block',
                      bgcolor: message.isSentByMe ? 'primary.main' : 'grey.200',
                      color: message.isSentByMe ? 'white' : 'text.primary',
                      p: 1,
                      borderRadius: 1,
                      maxWidth: '80%'
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={!isConnected}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button 
            variant="contained" 
            onClick={sendMessage}
            disabled={!isConnected || !inputMessage.trim()}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}; 