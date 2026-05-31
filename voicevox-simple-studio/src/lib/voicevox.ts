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

export async function synthesizeAudio(text: string, speakerId: number, baseUrl: string): Promise<Blob> {
  try {
    // 1. Create Audio Query
    const queryResponse = await fetch(`${baseUrl}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`, {
      method: 'POST',
    });
    
    if (!queryResponse.ok) {
      throw new Error(`Failed to create audio query: ${queryResponse.statusText}`);
    }
    
    const queryData = await queryResponse.json();

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
