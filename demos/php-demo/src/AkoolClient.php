<?php

class AkoolClient {
    private $config;
    private $token;

    public function __construct(array $config) {
        $this->config = $config;
    }

    public function getToken() {
        if ($this->token) {
            return $this->token;
        }

        $ch = curl_init($this->config['api_base_url'] . '/open/v3/getToken');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'clientId' => $this->config['client_id'],
            'clientSecret' => $this->config['client_secret']
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($statusCode !== 200) {
            throw new Exception('Failed to get token: ' . $response);
        }

        $data = json_decode($response, true);
        if ($data['code'] !== 1000) {
            throw new Exception('Failed to get token: ' . $data['msg'] ?? 'Unknown error');
        }

        $this->token = $data['token'];
        return $this->token;
    }

    public function createSession() {
        $token = $this->getToken();

        $ch = curl_init($this->config['api_base_url'] . '/open/v4/liveAvatar/session/create');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'avatar_id' => $this->config['avatar_id']
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token
        ]);

        $response = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($statusCode !== 200) {
            throw new Exception('Failed to create session: ' . $response);
        }

        $data = json_decode($response, true);
        if ($data['code'] !== 1000) {
            throw new Exception('Failed to create session: ' . $data['msg'] ?? 'Unknown error');
        }

        return $data;
    }
} 