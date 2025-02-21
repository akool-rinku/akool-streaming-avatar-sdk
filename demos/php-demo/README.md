# Akool Streaming Avatar PHP Demo

A simple PHP demo application showcasing the integration of the Akool Streaming Avatar SDK.

## Requirements

- PHP 7.4 or higher
- PHP cURL extension
- Web server (Apache/Nginx)
- Modern web browser with WebRTC support

## Setup

1. Configure your web server to serve the `public` directory.

2. Set your Akool Avatar ID in one of two ways:
   - Environment variable: `AKOOL_AVATAR_ID=your_avatar_id`
   - Directly in `config/config.php`

3. (Optional) Update the client credentials in `config/config.php` if needed.

## Directory Structure

```
php-demo/
├── config/
│   └── config.php         # Configuration file
├── public/
│   ├── index.php         # Main application
│   └── clear_session.php # Session cleanup
└── src/
    └── AkoolClient.php   # API client class
```

## Features

- Token-based authentication
- Session management
- Real-time video streaming
- Two-way chat
- Microphone control
- Responsive UI

## Usage

1. Open the application in your web browser
2. Click "Start New Session" to begin
3. Allow microphone access when prompted
4. Use the chat interface to communicate
5. Toggle microphone as needed
6. Click "End Session" when finished

## Security Notes

- The client credentials are stored in PHP and never exposed to the frontend
- Session data is stored server-side
- All API requests are made server-side
- HTTPS is recommended for production use 


## Docker Setup

1. Build the Docker image
```bash
docker build -t akool-streaming-avatar-php-demo .
```

2. Run the Docker container
```bash
docker run -d -p 8080:80 akool-streaming-avatar-php-demo
```

3. Access the application at `http://localhost`

