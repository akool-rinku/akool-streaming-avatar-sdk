<?php
require_once __DIR__ . '/../src/AkoolClient.php';

// Load configuration
$config = require_once __DIR__ . '/../config/config.php';

// Initialize Akool client
$client = new AkoolClient($config['akool']);

// Handle session creation
$session = null;
$error = null;

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'create_session') {
        $session = $client->createSession();
        // Store session in PHP session to persist it
        session_start();
        $_SESSION['akool_session'] = $session;
    } else {
        // Check if we have a session stored
        session_start();
        if (isset($_SESSION['akool_session'])) {
            $session = $_SESSION['akool_session'];
        }
    }
} catch (Exception $e) {
    $error = $e->getMessage();
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Akool Streaming Avatar Demo</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .error { color: red; margin: 10px 0; }
        .success { color: green; margin: 10px 0; }
        .container { display: flex; gap: 20px; }
        .video-container { flex: 2; }
        .chat-container { flex: 1; }
        #remote-video { width: 100%; aspect-ratio: 16/9; background: #f0f0f0; }
        #message-list { height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; }
        .message { margin-bottom: 10px; }
        .message.user { text-align: right; }
        .message.bot { text-align: left; }
        .controls { margin-top: 20px; }
        button { padding: 10px 20px; margin: 5px; }
        .status-message { color: #666; margin: 10px 0; }
        #start-session-btn { font-size: 1.2em; padding: 15px 30px; }
        .hidden { display: none; }
    </style>
    <!-- Include the Akool Streaming Avatar SDK -->
    <script src="https://unpkg.com/akool-streaming-avatar-sdk@1.0.4"></script>
    <script src="https://cdn.agora.io/sdk/release/AgoraRTC_N.js"></script>
</head>
<body>
    <h1>Akool Streaming Avatar Demo</h1>
    
    <?php if ($error): ?>
        <div class="error"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>

    <?php if (!$session): ?>
        <form method="POST">
            <input type="hidden" name="action" value="create_session">
            <button type="submit">Create New Session</button>
        </form>
    <?php else: ?>
        <div id="session-container">
            <!-- Initial view with start button -->
            <div id="start-view">
                <p class="status-message">Session created. Click the button below to start streaming.</p>
                <button id="start-session-btn" onclick="startSession()">Start Streaming Session</button>
            </div>

            <!-- Main interface (initially hidden) -->
            <div id="main-interface" class="hidden">
                <div class="container">
                    <div class="video-container">
                        <video id="remote-video"></video>
                        <div class="controls">
                            <button onclick="toggleMic()">Toggle Microphone</button>
                            <button onclick="endSession()">End Session</button>
                        </div>
                    </div>
                    <div class="chat-container">
                        <div id="message-list"></div>
                        <div class="message-input">
                            <input type="text" id="message-text" placeholder="Type your message...">
                            <button onclick="sendMessage()">Send</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            // Initialize the SDK
            const agoraSDK = new AkoolStreamingAvatar.GenericAgoraSDK({ mode: "rtc", codec: "vp8" });
            const credentials = <?php echo json_encode($session['data']['credentials']); ?>;
            const messageList = document.getElementById('message-list');
            const messageInput = document.getElementById('message-text');
            let sessionInitialized = false;

            // Register event handlers
            agoraSDK.on({
                onMessageReceived: (message) => {
                    appendMessage(message);
                },
                onMessageUpdated: (message) => {
                    updateMessage(message);
                },
                onUserPublished: async (user, mediaType) => {
                    if (mediaType === 'video') {
                        const remoteTrack = await agoraSDK.getClient().subscribe(user, mediaType);
                        remoteTrack?.play('remote-video');
                    } else if (mediaType === 'audio') {
                        console.log('audio');
                        const remoteTrack = await agoraSDK.getClient().subscribe(user, mediaType);
                        remoteTrack?.play();
                    }
                },
                onException: (error) => {
                    console.error('An error occurred:', error);
                    alert('An error occurred: ' + error.msg);
                }
            });

            // Initialize the session when user clicks start button
            async function startSession() {
                if (sessionInitialized) return;

                try {
                    // Show loading state
                    const startBtn = document.getElementById('start-session-btn');
                    startBtn.disabled = true;
                    startBtn.textContent = 'Initializing...';

                    // Initialize the session
                    await agoraSDK.joinChannel(credentials);
                    console.log('joined chat', );
                    await agoraSDK.joinChat({
                        vid: "Xb7hH8MSUJpSbSDYk0k2",
                        lang: "en",
                        mode: 2
                    });

                    // Hide start view and show main interface
                    document.getElementById('start-view').classList.add('hidden');
                    document.getElementById('main-interface').classList.remove('hidden');
                    
                    sessionInitialized = true;
                } catch (error) {
                    console.error('Failed to initialize session:', error);
                    alert('Failed to initialize session: ' + error.message);
                    
                    // Reset button state
                    startBtn.disabled = false;
                    startBtn.textContent = 'Start Streaming Session';
                }
            }

            // Message handling
            function appendMessage(message) {
                const div = document.createElement('div');
                div.id = `message-${message.id}`;
                div.className = `message ${message.isSentByMe ? 'user' : 'bot'}`;
                div.textContent = message.text;
                messageList.appendChild(div);
                messageList.scrollTop = messageList.scrollHeight;
            }

            function updateMessage(message) {
                const div = document.getElementById(`message-${message.id}`);
                if (div) {
                    div.textContent = message.text;
                }
            }

            async function sendMessage() {
                const text = messageInput.value.trim();
                if (!text) return;

                try {
                    await agoraSDK.sendMessage(text);
                    messageInput.value = '';
                } catch (error) {
                    console.error('Failed to send message:', error);
                    alert('Failed to send message: ' + error.message);
                }
            }

            // Microphone control
            async function toggleMic() {
                try {
                    await agoraSDK.toggleMic();
                } catch (error) {
                    console.error('Failed to toggle microphone:', error);
                    alert('Failed to toggle microphone: ' + error.message);
                }
            }

            // Session management
            async function endSession() {
                if (!sessionInitialized) return;

                try {
                    await agoraSDK.closeStreaming();
                    sessionInitialized = false;
                    // Clear PHP session
                    fetch('clear_session.php').then(() => {
                        window.location.reload();
                    });
                } catch (error) {
                    console.error('Failed to end session:', error);
                    alert('Failed to end session: ' + error.message);
                }
            }

            // Handle enter key in message input
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        </script>
    <?php endif; ?>
</body>
</html> 