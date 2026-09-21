import { AppData } from './types';

export const initialData: AppData = {
  masters: [
    {
      id: 'm1',
      name: 'Cinematic Portrait',
      content: 'masterpiece, best quality, highly detailed, cinematic lighting, 8k resolution, raw photo',
    },
    {
      id: 'm2',
      name: 'Anime Illustration',
      content: 'masterpiece, best quality, ultra-detailed, illustration, vibrant colors, anime style',
    },
    {
      id: 'm3',
      name: 'Cyberpunk Aesthetic',
      content: 'masterpiece, best quality, neon lighting, highly detailed, cyberpunk style, dark atmosphere',
    },
  ],
  negatives: [
    {
      id: 'n1',
      name: 'Standard Negative',
      content: 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry',
    },
  ],
  parts: [
    // Section 1: 構図・アングル・人数構成
    { id: 'p1_1', section: 1, category: 'Composition', name: '1 Girl', content: '1girl, solo', isPinned: true },
    { id: 'p1_2', section: 1, category: 'Composition', name: '1 Boy', content: '1boy, solo', isPinned: false },
    { id: 'p1_3', section: 1, category: 'Composition', name: 'Cowboy Shot', content: 'cowboy shot', isPinned: true },
    { id: 'p1_4', section: 1, category: 'Composition', name: 'Close up', content: 'close up, portrait', isPinned: false },
    { id: 'p1_5', section: 1, category: 'Composition', name: 'From Below', content: 'from below', isPinned: false },
    
    // Section 2: ポーズ・アクション
    { id: 'p2_1', section: 2, category: 'Pose', name: 'Sitting', content: 'sitting', isPinned: true },
    { id: 'p2_2', section: 2, category: 'Pose', name: 'Lying Down', content: 'lying, on stomach', isPinned: false },
    { id: 'p2_3', section: 2, category: 'Pose', name: 'Standing', content: 'standing', isPinned: false },
    { id: 'p2_4', section: 2, category: 'Pose', name: 'Looking Back', content: 'looking back over shoulder', isPinned: true },
    { id: 'p2_5', section: 2, category: 'Pair', name: 'Back to Back', content: 'two girls, back to back', isPinned: false },
    { id: 'p2_6', section: 2, category: 'Pair', name: 'Holding Hands', content: 'two people, holding hands', isPinned: false },
    { id: 'p2_7', section: 2, category: 'Group', name: '3 Girls', content: '3 girls, group', isPinned: false },
    { id: 'p2_8', section: 2, category: 'Group', name: 'Crowd', content: 'crowd, multiple people', isPinned: false },

    // Section 3: 詳細な特徴・肉体ディテール・エフェクト
    { id: 'p3_1', section: 3, category: 'Features', name: 'Detailed Eyes', content: 'detailed beautiful eyes', isPinned: true },
    { id: 'p3_2', section: 3, category: 'Features', name: 'Blonde Hair', content: 'blonde hair, long hair', isPinned: false },
    { id: 'p3_3', section: 3, category: 'Effects', name: 'Lens Flare', content: 'lens flare, bloom', isPinned: true },
    { id: 'p3_4', section: 3, category: 'Effects', name: 'Particulate', content: 'floating dust, glowing particles', isPinned: false },
    { id: 'p3_5', section: 3, category: 'Features', name: 'Tattoo', content: 'intricate body tattoo', isPinned: false },

    // Section 4: 衣装・シチュエーション・背景
    { id: 'p4_1', section: 4, category: 'Costume', name: 'Techwear', content: 'black techwear jacket, tactical gear', isPinned: true },
    { id: 'p4_2', section: 4, category: 'Costume', name: 'Suit', content: 'formal black suit, tie', isPinned: false },
    { id: 'p4_3', section: 4, category: 'Background', name: 'Rainy City', content: 'rainy city street, neon signs, night', isPinned: true },
    { id: 'p4_4', section: 4, category: 'Background', name: 'Sci-fi Lab', content: 'sci-fi laboratory, monitors, cables', isPinned: false },
    { id: 'p4_5', section: 4, category: 'Situation', name: 'Looking at Viewer', content: 'looking at viewer, serious expression', isPinned: true },
  ]
};
