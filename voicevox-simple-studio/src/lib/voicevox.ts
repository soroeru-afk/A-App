import { Speaker } from '../types';

export async function fetchSpeakers(baseUrl: string): Promise<Speaker[]> {
  try {
    const response = await fetch(`${baseUrl}/speakers`);
    if (!response.ok) {
      throw new Error(`Failed to fetch speakers: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching speakers:', error);
    throw error;
  }
}

export async function synthesizeAudio(
  text: string,
  speakerId: number,
  baseUrl: string,
  options?: { speedScale?: number; pitchScale?: number; intonationScale?: number }
): Promise<Blob> {
  try {
    // 1. Create Audio Query
    const queryResponse = await fetch(`${baseUrl}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`, {
      method: 'POST',
    });
    
    if (!queryResponse.ok) {
      throw new Error(`Failed to create audio query: ${queryResponse.statusText}`);
    }
    
    const queryData = await queryResponse.json();

    // Apply voice query overrides if provided
    if (options) {
      if (options.speedScale !== undefined) queryData.speedScale = options.speedScale;
      if (options.pitchScale !== undefined) queryData.pitchScale = options.pitchScale;
      if (options.intonationScale !== undefined) queryData.intonationScale = options.intonationScale;
    }

    // 2. Synthesize
    const synthResponse = await fetch(`${baseUrl}/synthesis?speaker=${speakerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryData),
    });

    if (!synthResponse.ok) {
        throw new Error(`Failed to synthesize audio: ${synthResponse.statusText}`);
    }

    return synthResponse.blob();
  } catch (error) {
    console.error('Error synthesizing audio:', error);
    throw error;
  }
}

export async function mergeWavFiles(blobs: Blob[]): Promise<Blob> {
  if (blobs.length === 0) {
    throw new Error('No audio blobs to merge');
  }
  if (blobs.length === 1) {
    return blobs[0];
  }

  const arrayBuffers = await Promise.all(blobs.map(blob => blob.arrayBuffer()));
  
  // Verify headers and compute total data size
  let totalDataSize = 0;
  const dataChunks: Uint8Array[] = [];
  let header: Uint8Array | null = null;

  for (const buffer of arrayBuffers) {
    const uint8View = new Uint8Array(buffer);
    
    // Find the 'data' subchunk to extract the data part and size
    let dataOffset = 44;
    let dataSize = uint8View.length - 44;

    const isStandard = uint8View[36] === 100 && uint8View[37] === 97 && uint8View[38] === 116 && uint8View[39] === 97;
    if (isStandard) {
      dataOffset = 44;
      dataSize = uint8View[40] | (uint8View[41] << 8) | (uint8View[42] << 16) | (uint8View[43] << 24);
    } else {
      let i = 12;
      while (i < uint8View.length - 8) {
        if (uint8View[i] === 100 && uint8View[i+1] === 97 && uint8View[i+2] === 116 && uint8View[i+3] === 97) {
          dataOffset = i + 8;
          dataSize = uint8View[i+4] | (uint8View[i+5] << 8) | (uint8View[i+6] << 16) | (uint8View[i+7] << 24);
          break;
        }
        const chunkSize = uint8View[i+4] | (uint8View[i+5] << 8) | (uint8View[i+6] << 16) | (uint8View[i+7] << 24);
        i += 8 + chunkSize;
      }
    }

    if (!header) {
      header = new Uint8Array(uint8View.slice(0, dataOffset));
    }

    const chunk = new Uint8Array(buffer, dataOffset, Math.min(dataSize, uint8View.length - dataOffset));
    dataChunks.push(chunk);
    totalDataSize += chunk.length;
  }

  if (!header) {
    throw new Error('Failed to parse WAV headers');
  }

  const riffSize = header.length + totalDataSize - 8;
  header[4] = riffSize & 0xff;
  header[5] = (riffSize >> 8) & 0xff;
  header[6] = (riffSize >> 16) & 0xff;
  header[7] = (riffSize >> 24) & 0xff;

  const dataSizeIndex = header.length - 4;
  header[dataSizeIndex] = totalDataSize & 0xff;
  header[dataSizeIndex + 1] = (totalDataSize >> 8) & 0xff;
  header[dataSizeIndex + 2] = (totalDataSize >> 16) & 0xff;
  header[dataSizeIndex + 3] = (totalDataSize >> 24) & 0xff;

  return new Blob([header, ...dataChunks], { type: 'audio/wav' });
}
