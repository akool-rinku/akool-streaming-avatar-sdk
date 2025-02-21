import { RTCClient, Metadata, StreamMessage } from "./types";

export async function setAvatarParams(client: RTCClient, meta: Metadata) {
  const cleanedMeta = Object.fromEntries(Object.entries(meta).filter(([_, value]) => !!value));
  const message: StreamMessage = {
    v: 2,
    type: 'command',
    mid: `msg-${Date.now()}`,
    pld: { cmd: 'set-params', data: cleanedMeta },
  };
  const jsondata = JSON.stringify(message);
  console.log(`setAvatarParams, size=${jsondata.length}, data=${jsondata}`);
  return client.sendStreamMessage(jsondata, false);
}

export async function interruptResponse(client: RTCClient) {
  const message: StreamMessage = {
    v: 2,
    type: 'command',
    mid: `msg-${Date.now()}`,
    pld: { cmd: 'interrupt' },
  };
  const jsondata = JSON.stringify(message);
  console.log(`interruptResponse, size=${jsondata.length}, data=${jsondata}`);
  return client.sendStreamMessage(jsondata, false);
}

export async function sendMessageToAvatar(client: RTCClient, messageId: string, content: string) {
  const MAX_ENCODED_SIZE = 950;
  const BYTES_PER_SECOND = 6000;

  const encodeMessage = (text: string, idx: number, fin: boolean): Uint8Array => {
    const message: StreamMessage = {
      v: 2,
      type: 'chat',
      mid: messageId,
      idx,
      fin,
      pld: { text },
    };
    return new TextEncoder().encode(JSON.stringify(message));
  };

  if (!content) {
    throw new Error('Content cannot be empty');
  }

  const baseEncoded = encodeMessage('', 0, false);
  const maxQuestionLength = Math.floor((MAX_ENCODED_SIZE - baseEncoded.length) / 4);
  const chunks: string[] = [];
  let remainingMessage = content;
  let chunkIndex = 0;

  while (remainingMessage.length > 0) {
    let chunk = remainingMessage.slice(0, maxQuestionLength);
    let encoded = encodeMessage(chunk, chunkIndex, false);

    // If necessary, reduce chunk size
    while (encoded.length > MAX_ENCODED_SIZE && chunk.length > 1) {
      chunk = chunk.slice(0, Math.ceil(chunk.length / 2));
      encoded = encodeMessage(chunk, chunkIndex, false);
    }

    if (encoded.length > MAX_ENCODED_SIZE) {
      throw new Error('Message encoding failed: content too large for chunking');
    }

    chunks.push(chunk);
    remainingMessage = remainingMessage.slice(chunk.length);
    chunkIndex++;
  }

  console.log(`Splitting message into ${chunks.length} chunks`);

  for (let i = 0; i < chunks.length; i++) {
    const isLastChunk = i === chunks.length - 1;
    const encodedChunk = encodeMessage(chunks[i] || '', i, isLastChunk);
    const chunkSize = encodedChunk.length;
    const minimumTimeMs = Math.ceil((1000 * chunkSize) / BYTES_PER_SECOND);
    const startTime = Date.now();

    console.log(`Sending chunk ${i + 1}/${chunks.length}, size=${chunkSize} bytes`);

    try {
      await client.sendStreamMessage(encodedChunk, false);
    } catch (error: unknown) {
      throw new Error(`Failed to send chunk ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    if (!isLastChunk) {
      const elapsedMs = Date.now() - startTime;
      const remainingDelay = Math.max(0, minimumTimeMs - elapsedMs);
      if (remainingDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingDelay));
      }
    }
  }
} 