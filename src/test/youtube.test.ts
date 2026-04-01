import { describe, expect, it } from 'vitest';
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeWatchUrl } from '@/lib/youtube';

describe('youtube helpers', () => {
  it('extracts the video id from YouTube Shorts URLs', () => {
    expect(extractYouTubeId('https://www.youtube.com/shorts/xgl-43PsnmI?si=UMtXft9doWLVWfIc')).toBe('xgl-43PsnmI');
  });

  it('extracts the video id from watch and short URLs', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('returns null for invalid URLs', () => {
    expect(extractYouTubeId(null)).toBeNull();
    expect(extractYouTubeId('https://example.com/video')).toBeNull();
  });

  it('builds YouTube watch and embed URLs', () => {
    expect(getYouTubeWatchUrl('xgl-43PsnmI')).toBe('https://www.youtube.com/watch?v=xgl-43PsnmI');
    expect(getYouTubeEmbedUrl('xgl-43PsnmI')).toBe(
      'https://www.youtube.com/embed/xgl-43PsnmI?autoplay=1&rel=0&playsinline=1',
    );
  });
});