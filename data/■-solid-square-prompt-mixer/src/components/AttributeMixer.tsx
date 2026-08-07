import React, { useState, useEffect } from 'react';
import { Check, Settings2, Pencil, Plus, Trash2, Save, ChevronDown, ChevronUp, ChevronsUp, ChevronsDown, Edit2, RotateCcw, GripVertical, ArrowLeftToLine, Copy } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { Language, t } from '../i18n';
import { VariationPart } from '../types';

type PresetItem = { label: string; value: string };
type Presets = Record<string, PresetItem[]>;
export type CategoryDef = {
  id: string;
  label: string;
  isNegative?: boolean;
};

export const getDefaultSectionForCategory = (catId: string): number => {
  const sec1 = ['angle', 'camera', 'lens'];
  const sec2 = ['genderAndPeople', 'race', 'age', 'physique', 'pose', 'expression', 'clothing', 'hair', 'bodyHair', 'partner', 'bodyWet'];
  const sec3 = ['characteristics', 'accessories', 'artStyle', 'skinDetail', 'showerScene'];
  const sec4 = ['location', 'situation', 'weather', 'emptyLocation', 'lighting', 'background', 'environment'];
  
  if (sec1.includes(catId)) return 1;
  if (sec2.includes(catId)) return 2;
  if (sec3.includes(catId)) return 3;
  if (sec4.includes(catId)) return 4;
  return 5; // Others
};

type Combination = {
  id: string;
  name: string;
  selections: Record<string, number>;
  negativePrompt: string;
};

const DEFAULT_CATEGORIES: CategoryDef[] = [
  { id: 'genderAndPeople', label: '性別と人数 (Gender & People)' },
  { id: 'race', label: '人種 (Race)' },
  { id: 'age', label: '年齢 (Age)' },
  { id: 'physique', label: '体型 (Physique)' },
  { id: 'pose', label: '体位・ポーズ (Pose)' },
  { id: 'characteristics', label: '特徴・個性 (Characteristics)' },
  { id: 'expression', label: '表情・気持ち (Expression)' },
  { id: 'clothing', label: '衣類・コスチューム (Clothing)' },
  { id: 'hair', label: 'ヘア・髪型 (Hair)' },
  { id: 'bodyHair', label: 'アンダーヘア・脇毛 (Body Hair)' },
  { id: 'accessories', label: 'アクセサリー (Accessories)' },
  { id: 'angle', label: 'アングル (Angle)' },
  { id: 'location', label: '場所・背景 (Location)' },
  { id: 'situation', label: 'シチュエーション・状況 (Situation)' },
  { id: 'freeText1', label: '自由・フリー設定 1 (Free Text 1)' },
  { id: 'freeText2', label: '自由・フリー設定 2 (Free Text 2)' },
  { id: 'partner', label: '男 (Partner)' }
,
{ id: 'weather', label: '天候 (Weather)' },
  { id: 'emptyLocation', label: '無人の場所 (Empty Location)' },
  { id: 'bodyWet', label: '濡れ表現 (Wet Body)' },
  { id: 'showerScene', label: 'シャワーシーン (Shower Scene)' },
  { id: 'skinDetail', label: '肌の質感 (Skin Detail)' }
];

const DEFAULT_PRESETS: Presets = {
  genderAndPeople: [
    { label: '指定なし / None', value: '' },
    { label: '女性のみ (Female only)', value: '1girl, solo, ' },
    { label: '男性のみ (Male only)', value: '1boy, solo, ' },
    { label: '男女ペア (Male and Female pair)', value: '1girl, 1boy, couple, ' },
    { label: '女性複数 (Multiple females)', value: 'multiple girls, ' },
    { label: '男性複数 (Multiple males)', value: 'multiple boys, ' }
  ],
  weather: [
    { label: '指定なし / None', value: '' },
    { label: '快晴（雲一つない青空）', value: 'crystal clear sky, ' },
    { label: '晴天（自然な晴れ）', value: 'sunny day, bright sunlight, ' },
    { label: '木漏れ日のある晴れ', value: 'dappled sunlight, ' },
    { label: '薄曇り', value: 'lightly overcast sky, ' },
    { label: '完全な曇天', value: 'gloomy overcast weather, ' },
    { label: '濃霧', value: 'heavy fog, ' },
    { label: '朝霧', value: 'soft morning mist, ' },
    { label: '地面に漂う霧', value: 'ground fog, ' },
    { label: '雪', value: 'heavy snowfall, ' },
    { label: '嵐', value: 'cinematic stormy weather, ' },
    { label: '暴風', value: 'gale force winds, ' },
    { label: '大雨', value: 'torrential pouring rain, ' },
    { label: '普通の雨', value: 'steady rainy day, ' },
    { label: '雷雨', value: 'dramatic thunderstorm, ' }
  ],
  emptyLocation: [
    { label: '指定なし / None', value: '' },
    { label: '無人のアスファルト道路', value: 'empty asphalt road, no people, ' },
    { label: '寂れた一本道', value: 'deserted highway, ' },
    { label: '寂しい田舎道', value: 'lonely country road, ' },
    { label: '荒野の道路', value: 'wilderness road, ' },
    { label: '嵐の無人道路', value: 'empty stormy street, ' }
  ],
  bodyWet: [
    { label: '指定なし / None', value: '' },
    { label: 'びしょ濡れ', value: 'soaking wet, ' },
    { label: '肌と服の濡れツヤ', value: 'wet skin and clothing texture, ' },
    { label: '滴る水滴', value: 'dripping water droplets, ' },
    { label: 'ずぶ濡れの髪', value: 'drenched hair, ' }
  ],
  showerScene: [
    { label: '指定なし / None', value: '' },
    { label: 'シャワーを浴びる', value: 'taking a shower, ' },
    { label: 'シャワーヘッドを持つ', value: 'holding a shower head, ' },
    { label: '浴室', value: 'steamy bathroom background, ' },
    { label: '滴る温水', value: 'dripping warm water, ' }
  ],
  skinDetail: [
    { label: '指定なし / None', value: '' },
    { label: 'ランダムなホクロ', value: 'sporadic skin moles, ' },
    { label: '鳥肌・微細な凹凸', value: 'gooseflesh skin texture, ' },
    { label: '胸元の斑点・日焼けムラ', value: 'sun-damaged skin on chest, ' },
    { label: '背中全体の濃いそばかす', value: 'heavy back freckles, ' },
    { label: '加工なしの生写真', value: 'un-retouched skin, ' },
    { label: 'くしゃみ', value: '(about to sneeze:1.1), ' },
    { label: 'あくび', value: '(subtle yawn, sleepy eyes:1.1), ' }
  ],
  race: [
    { label: '指定なし / None', value: '' },
    { label: '日本人 / Japanese', value: '1japanese woman, ' },
    { label: 'ロシア人 / Russian', value: '1russian woman, white skin, ' },
    { label: 'イギリス人 / British', value: '1british woman, ' },
    { label: 'アメリカ人 / American', value: '1american woman, ' },
    { label: 'ドイツ人 / German', value: '1german woman, ' },
    { label: '白人 / Caucasian', value: '1caucasian woman, ' },
    { label: '黒人 / Black', value: '1dark skin woman, ' },
    { label: 'ラテン系 / Latina', value: '1latina woman, ' }
  ],
  age: [
    { label: '指定なし / None', value: '' },
    { label: '大人の女性 / Adult', value: 'adult woman, mature female, ' },
    { label: '熟女 / Mature', value: 'mature woman, milf, ' },
    { label: '人妻 / MILF', value: 'milf, mature woman, ' },
    { label: '老人 / Old Woman', value: 'old woman, aged, wrinkles, ' },
    { label: '若い女性 / Young Woman', value: 'young woman, youth, ' },
    { label: '10代 / Teen', value: 'teenager, teen girl, ' },
    { label: '女子高生 / High School Girl', value: 'high school girl, school uniform, ' }
  ],
  physique: [
    { label: '指定なし / None', value: '' },
    { label: 'スリム・美しい体型 / Slender', value: 'slender body, slim, ' },
    { label: 'ガチ重量級 / Heavyweight', value: 'heavyweight, colossal female, thick, fat, ' },
    { label: '筋肉質 / Muscular', value: 'muscular female, abs, ' },
    { label: 'カーヴィー(安産型) / Curvy', value: 'curvy, wide hips, thick thighs, ' },
    { label: '小柄・貧乳 / Petite', value: 'petite, small breasts, short, ' }
  ],
  pose: [
    { label: '指定なし / None', value: '' },
    { label: '何も持っていない', value: 'empty hands, ' },
    { label: '開いた手のひら', value: 'open hands, ' },
    { label: '直立姿勢 / Standing', value: 'standing, ' },
    { label: '座った姿勢 / Sitting', value: 'sitting, ' },
    { label: '蹲踞の姿勢 / Squatting', value: 'squatting, ' },
    { label: '両腕を上げた姿勢 / Arms Raised', value: 'arms up, hands up, ' }
  ],
  characteristics: [
    { label: '指定なし / None', value: '' },
    { label: '照れ・赤面 / Shy & Blushing', value: 'shy, blushing, ' },
    { label: '自信満々・ドヤ顔 / Confident & Smug', value: 'confident, smug, smiling, ' },
    { label: 'ヤンデレ / Yandere', value: 'yandere, empty eyes, dark aura, ' },
    { label: 'ツンデレ / Tsundere', value: 'tsundere, glaring, ' },
    { label: '眠そう / Sleepy', value: 'sleepy, rubbing eyes, ' },
    { label: '巨乳 / Huge Breasts', value: 'huge breasts, large breasts, ' },
    { label: '絶壁 / Flat Chest', value: 'flat chest, small breasts, ' },
    { label: '巨尻 / Big Butt', value: 'huge butt, wide hips, ' },
    { label: '太い腕 / Thick Arms', value: 'thick arms, ' }
  ],
  expression: [
    { label: '指定なし / None', value: '' },
    { label: '笑顔 / Smile', value: 'smile, happy, ' },
    { label: '泣き顔 / Crying', value: 'crying, tears, sad, ' },
    { label: '怒り顔 / Angry', value: 'angry, glaring, ' },
    { label: 'アヘ顔 / Ahegao', value: 'ahegao, rolled eyes, tongue out, ' },
    { label: '口を開けた顔 / Open Mouth', value: 'open mouth, ' }
  ],
  clothing: [
    { label: '指定なし / None', value: '' },
    { label: '旅行者の服', value: 'traveler attire, ' },
    { label: '普通の普段着', value: 'casual everyday clothes, ' },
    { label: '全裸 / Nude', value: 'nude, naked, completely nude, ' },
    { label: 'ビキニ / Bikini', value: 'bikini, swimsuit, ' },
    { label: 'ランジェリー / Lingerie', value: 'lingerie, bra, panties, ' },
    { label: '私服 / Casual', value: 'casual wear, t-shirt, jeans, ' }
  ],
  hair: [
    { label: '指定なし / None', value: '' },
    { label: 'ショート / Short Hair', value: 'short hair, ' },
    { label: 'ロング / Long Hair', value: 'long hair, ' },
    { label: 'ボブ / Bob Cut', value: 'bob cut, ' },
    { label: 'ポニーテール / Ponytail', value: 'ponytail, ' },
    { label: 'ツインテール / Twintails', value: 'twintails, ' },
    { label: '束ねた髪型 / Low Chignon', value: 'low chignon hairstyle, ' },
    { label: '寝癖・ボサボサ / Messy Hair', value: 'messy hair, bedhead, ' },
    { label: '金髪 / Blonde', value: 'blonde hair, ' },
    { label: '黒髪 / Black Hair', value: 'black hair, ' },
    { label: '茶髪 / Brown Hair', value: 'brown hair, ' },
    { label: 'ピンク髪 / Pink Hair', value: 'pink hair, ' }
  ],
  bodyHair: [
    { label: '指定なし / None', value: '' },
    { label: 'アンダーヘアあり / Pubic Hair', value: 'pubic hair, ' },
    { label: 'わき毛あり / Armpit Hair', value: 'armpit hair, ' },
    { label: 'ツルツル / Hairless', value: 'hairless, shaved, ' }
  ],
  accessories: [
    { label: '指定なし / None', value: '' },
    { label: '眼鏡 / Glasses', value: 'glasses, megane, ' },
    { label: 'チョーカー / Choker', value: 'choker, ' },
    { label: 'ピアス / Piercings', value: 'piercings, earrings, ' },
    { label: 'タトゥー / Tattoos', value: 'tattoos, body art, ' }
  ],
  angle: [
    { label: '指定なし / None', value: '' },
    { label: '正面 / Front View', value: 'front view, facing viewer, ' },
    { label: '横顔 / Side View', value: 'side view, profile, ' },
    { label: '後ろ姿 / Back View', value: 'back view, from behind, ' },
    { label: '俯瞰(上から) / High Angle', value: 'high angle, from above, ' },
    { label: 'アオリ(下から) / Low Angle', value: 'low angle, from below, ' }
  ],
  location: [
    { label: '指定なし / None', value: '' },
    { label: '屋内・部屋 / Indoors', value: 'indoors, bedroom, ' },
    { label: '屋外・街中 / Outdoors', value: 'outdoors, street, ' },
    { label: '海・ビーチ / Beach', value: 'beach, ocean, ' },
    { label: '学校・教室 / School', value: 'school, classroom, ' },
    { label: 'オフィス / Office', value: 'office, workplace, ' },
    { label: '自然・森 / Nature', value: 'nature, forest, ' }
  ],
  situation: [
    { label: '指定なし / None', value: '' },
    { label: '自撮り / Selfie', value: 'selfie, holding phone, ' },
    { label: '見つめ合う / Eye Contact', value: 'looking at viewer, eye contact, ' },
    { label: '食事中 / Eating', value: 'eating, holding food, ' },
    { label: '運動中 / Exercising', value: 'exercising, sweat, ' },
    { label: '戦闘中 / Fighting', value: 'fighting, action pose, ' }
  ],
  partner: [
    { label: '指定なし / None', value: '' },
    { label: '見えない男 / Faceless Male', value: '1other, faceless male, anonymous male, ' },
    { label: 'オーク / Orc', value: '1other, orc, monster, ' },
    { label: '触手 / Tentacles', value: 'tentacles, alien, monster, ' }
  ],
  freeText1: [
    { label: '指定なし / None', value: '' },
    { label: '高品質 / Masterpiece', value: 'masterpiece, best quality, ultra-detailed, ' },
    { label: 'リアル / Realistic', value: 'realistic, photorealistic, 8k, raw photo, ' }
  ],
  freeText2: [
    { label: '指定なし / None', value: '' },
    { label: 'シネマティック / Cinematic', value: 'cinematic lighting, dramatic lighting, ' },
    { label: 'アニメ風 / Anime Style', value: 'anime artwork, illustration, flat color, ' }
  ]
};

interface AttributeMixerProps {
  onApply: (pos: string, neg: string, target?: string) => void;
  onInsertText?: (text: string, isNegative?: boolean) => void;
  onCopyToParts?: (parts: VariationPart[], categories: { name: string, section: number }[]) => { added: number, skipped: number };
  theme?: string;
  lang?: Language;
  existingParts?: VariationPart[];
  customSectionNames?: Record<number, string>;
  customCategories?: { name: string, section: number }[];
}

export const AttributeMixer: React.FC<AttributeMixerProps> = ({ onApply, onInsertText, onCopyToParts, theme = 'default', lang = 'ja' as Language, existingParts = [], customSectionNames = {}, customCategories = [] }) => {
  
  
  const [categories, setCategories] = useState<CategoryDef[]>(() => {
    let finalCats = [...DEFAULT_CATEGORIES];
    const saved = localStorage.getItem('attribute_mixer_categories_v2') || localStorage.getItem('attribute_mixer_categories_v1') || localStorage.getItem('attribute_mixer_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Merge missing defaults (like genderAndPeople) at the beginning if they are missing
          const existingIds = new Set(parsed.map(c => c.id));
          const missingDefaults = DEFAULT_CATEGORIES.filter(c => !existingIds.has(c.id));
          finalCats = [...missingDefaults, ...parsed];
        }
      } catch(e) {}
    }
    return finalCats;
  });
  useEffect(() => {
    localStorage.setItem('attribute_mixer_categories_v2', JSON.stringify(categories));
    localStorage.setItem('attribute_mixer_categories_updated_at', String(Date.now()));
  }, [categories]);

  const [presets, setPresets] = useState<Presets>(() => {
    let finalPresets = { ...DEFAULT_PRESETS };
    const saved = localStorage.getItem('attribute_mixer_custom_presets_v7') || localStorage.getItem('attribute_mixer_custom_presets_v6') || localStorage.getItem('attribute_mixer_custom_presets_v5') || localStorage.getItem('attribute_mixer_custom_presets_v4') || localStorage.getItem('attribute_mixer_custom_presets_v3') || localStorage.getItem('attribute_mixer_custom_presets_v2') || localStorage.getItem('attribute_mixer_custom_presets_v1') || localStorage.getItem('attribute_mixer_custom_presets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        finalPresets = { ...DEFAULT_PRESETS, ...parsed }; // Ensure new defaults are merged
      } catch(e) {}
    }
    return finalPresets;
  });
  useEffect(() => {
    localStorage.setItem('attribute_mixer_custom_presets_v7', JSON.stringify(presets));
    localStorage.setItem('attribute_mixer_presets_updated_at', String(Date.now()));
  }, [presets]);

  const [combinations, setCombinations] = useState<Combination[]>(() => {
    let finalCombos: Combination[] = [];
    const keys = ['attribute_mixer_combinations_v1', 'attribute_mixer_combinations'];
    for (const k of keys) {
      try {
        const saved = localStorage.getItem(k);
        if (saved) {
          const parsed = JSON.parse(saved);
          const map = new Map();
          finalCombos.forEach(c => map.set(c.id, c));
          parsed.forEach((c: any) => map.set(c.id, c));
          finalCombos = Array.from(map.values());
          break; // only load the latest available
        }
      } catch (e) {}
    }
    return finalCombos;
  });
  useEffect(() => {
    localStorage.setItem('attribute_mixer_combinations_v1', JSON.stringify(combinations));
    localStorage.setItem('attribute_mixer_combos_updated_at', String(Date.now()));
  }, [combinations]);

  const [selections, setSelections] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('attribute_mixer_selections_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return Object.fromEntries(DEFAULT_CATEGORIES.map(c => [c.id, 0]));
  });
  useEffect(() => {
    localStorage.setItem('attribute_mixer_selections_v1', JSON.stringify(selections));
  }, [selections]);

  useEffect(() => {
    const handleImported = () => {
      
      const savedPresets = localStorage.getItem('attribute_mixer_custom_presets_v7') || localStorage.getItem('attribute_mixer_custom_presets_v6') || localStorage.getItem('attribute_mixer_custom_presets_v5') || localStorage.getItem('attribute_mixer_custom_presets_v4') || localStorage.getItem('attribute_mixer_custom_presets_v3') || localStorage.getItem('attribute_mixer_custom_presets_v2') || localStorage.getItem('attribute_mixer_custom_presets_v1') || localStorage.getItem('attribute_mixer_custom_presets');
      if (savedPresets) {
        try {
          const parsed = JSON.parse(savedPresets);
          const result = { ...parsed };
          for (const key of Object.keys(DEFAULT_PRESETS)) {
            if (!result[key]) {
              result[key] = DEFAULT_PRESETS[key];
            }
          }
          if (parsed.location) result.location = parsed.location;
          setPresets(result);
        } catch (e) {}
      }
      const savedCombos = localStorage.getItem('attribute_mixer_combinations_v1');
      if (savedCombos) {
        try {
          setCombinations(JSON.parse(savedCombos));
        } catch (e) {}
      }
      const savedCats = localStorage.getItem('attribute_mixer_categories_v2') || localStorage.getItem('attribute_mixer_categories_v1') || localStorage.getItem('attribute_mixer_categories');
      if (savedCats) {
        try {
          const parsed = JSON.parse(savedCats);
          if (Array.isArray(parsed)) {
            const existingIds = new Set(parsed.map((c: any) => c.id));
            const missingDefaults = DEFAULT_CATEGORIES.filter(c => !existingIds.has(c.id));
            setCategories([...missingDefaults, ...parsed]);
          }
        } catch(e) {}
      }
    };
    window.addEventListener('attributeMixerDataImported', handleImported); window.addEventListener('mixer_presets_updated', handleImported);
    return () => { window.removeEventListener('attributeMixerDataImported', handleImported); window.removeEventListener('mixer_presets_updated', handleImported); };
  }, []);

  

  const [editModes, setEditModes] = useState<Record<string, boolean>>({});
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [confirmBulkDeleteState, setConfirmBulkDeleteState] = useState(false);
  const [draggedCatId, setDraggedCatId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<{ category: string; index: number } | null>(null);
  const [dragEnabledItemId, setDragEnabledItemId] = useState<{ category: string; index: number } | null>(null);
  const [dragEnabledCatId, setDragEnabledCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState<string | null>(null);

  const [activeCombinationId, setActiveCombinationId] = useState<string>('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [showCopyConfirm, setShowCopyConfirm] = useState(false);
  const [showCheckedCopyConfirm, setShowCheckedCopyConfirm] = useState(false);
  const [isSavedListOpen, setIsSavedListOpen] = useState(false);
  const [editingCombId, setEditingCombId] = useState<string | null>(null);
  const [editingCombName, setEditingCombName] = useState<string>('');

  const [negativePrompt, setNegativePrompt] = useState('');

  useEffect(() => {
    const handleRestore = (e: any) => {
      const { positive, negative } = e.detail;
      const next = { ...selections };
      let remainingNeg = negative || '';
      let hasChanges = false;
      
      categories.forEach(c => {
        const items = presets[c.id] || DEFAULT_PRESETS[c.id] || [{ label: '指定なし / None', value: '' }];
        const targetStr = c.isNegative ? negative : positive;
        
        if (!targetStr) return;
        
        let bestMatchIdx = 0;
        let bestMatchLen = 0;
        let bestMatchVal = '';
        
        for (let i = 1; i < items.length; i++) {
          const val = items[i].value;
          if (val && targetStr.includes(val)) {
            if (val.length > bestMatchLen) {
              bestMatchLen = val.length;
              bestMatchIdx = i;
              bestMatchVal = val;
            }
          }
        }
        
        if (bestMatchIdx !== 0 && next[c.id] !== bestMatchIdx) {
          next[c.id] = bestMatchIdx;
          hasChanges = true;
        }
        
        if (c.isNegative && bestMatchIdx !== 0) {
          remainingNeg = remainingNeg.replace(bestMatchVal, '');
        }
      });
      
      if (hasChanges) {
        setSelections(next);
      }
      
      remainingNeg = remainingNeg.split(',').map((s: string) => s.trim()).filter((s: string) => s).join(', ');
      if (remainingNeg !== negativePrompt) {
        setNegativePrompt(remainingNeg);
      }
      
      if (hasChanges || remainingNeg !== negativePrompt) {
        setSaveSuccessMessage(lang === 'en' ? 'Restored from Image!' : '画像からプロンプトを復元しました！');
        setTimeout(() => setSaveSuccessMessage(null), 3000);
      }
    };

    window.addEventListener('restore_mixer_from_prompt', handleRestore);
    return () => window.removeEventListener('restore_mixer_from_prompt', handleRestore);
  }, [categories, presets, selections, negativePrompt, lang]);
  const [confirmDeleteCatId, setConfirmDeleteCatId] = useState<string | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<string | null>(null);
  const [confirmDeleteCombId, setConfirmDeleteCombId] = useState<string | null>(null);
  const [confirmResetState, setConfirmResetState] = useState(false);
  const [confirmResetToDefaultState, setConfirmResetToDefaultState] = useState(false);

  const saveCurrentCombination = () => {
    const defaultName = `カスタム設定 ${combinations.length + 1}`;
    
    const newComb: Combination = {
      id: `comb_${Date.now()}`,
      name: defaultName,
      selections: { ...selections },
      negativePrompt
    };
    
    setCombinations(prev => [newComb, ...prev]);
    setActiveCombinationId(newComb.id);
    
    setIsSavedListOpen(true);
    setEditingCombId(newComb.id);
    setEditingCombName(defaultName);
    
    setSaveSuccessMessage(lang === 'en' ? 'Saved as new!' : '新規保存しました！ (Saved!)');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };



  const handleCopyToParts = () => {
    if (!onCopyToParts) return;
    setShowCopyConfirm(false);

    const newParts: VariationPart[] = [];
    const newCategories: { name: string, section: number }[] = [];
    
    const targetSectionId = 5;
    const targetCategoryName = lang === 'en' ? 'Parts from Mixer' : 'プロンプトミキサーからのパーツ';
    
    newCategories.push({ name: targetCategoryName, section: targetSectionId });

    if (checkedItems.size > 0) {
      checkedItems.forEach(id => {
         const [catId, idxStr] = (id as string).split(':');
         const idx = parseInt(idxStr, 10);
         const cat = categories.find(c => c.id === catId);
         if (cat && !isNaN(idx)) {
           const items = presets[catId] || DEFAULT_PRESETS[catId] || [];
           const item = items[idx];
           if (item && item.value.trim() !== '') {
             newParts.push({
               id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
               section: targetSectionId,
               category: targetCategoryName,
               name: item.label,
               content: item.value,
               isPinned: false,
               isNegative: cat.isNegative
             });
           }
         }
      });
      setCheckedItems(new Set());
    } else {
      categories.forEach(cat => {
        const selectedIdx = selections[cat.id] ?? 0;
        if (selectedIdx === 0) return;

        const items = presets[cat.id] || DEFAULT_PRESETS[cat.id] || [];
        const selectedItem = items[selectedIdx];
        if (!selectedItem || selectedItem.value.trim() === '') return;

        newParts.push({
          id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          section: targetSectionId,
          category: targetCategoryName,
          name: selectedItem.label,
          content: selectedItem.value,
          isPinned: false,
          isNegative: cat.isNegative
        });
      });
    }

    const handlePartsCopied = (e: any) => {
      const { added, skipped } = e.detail;
      setSaveSuccessMessage(lang === 'en' ? `${added} added, ${skipped} skipped` : `${added}件追加 (${skipped}件スキップ)`);
      setTimeout(() => setSaveSuccessMessage(null), 2000);
      window.removeEventListener('PARTS_COPIED', handlePartsCopied);
    };
    window.addEventListener('PARTS_COPIED', handlePartsCopied);

    onCopyToParts(newParts, newCategories);
  };

  const loadCombination = (id: string) => {
    const comb = combinations.find(c => c.id === id);
    if (comb) {
      const safeSelections = { ...Object.fromEntries(categories.map(c => [c.id, 0])), ...comb.selections };
      setSelections(safeSelections);
      setNegativePrompt(comb.negativePrompt || '');
      setActiveCombinationId(id);
      
      setSaveSuccessMessage(lang === 'en' ? 'Loaded!' : '読み込みました！ (Loaded!)');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    }
  };

  const updateCombination = () => {
    if (!activeCombinationId) return;
    setCombinations(prev => prev.map(c => 
      c.id === activeCombinationId ? { ...c, selections: { ...selections }, negativePrompt } : c
    ));
    setSaveSuccessMessage(lang === 'en' ? 'Updated!' : '上書き保存しました！ (Updated!)');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const deleteCombination = (id: string) => {
    setCombinations(prev => prev.filter(c => c.id !== id));
    if (activeCombinationId === id) setActiveCombinationId('');
  };

  const startEditingCombination = (id: string, currentName: string) => {
    setEditingCombId(id);
    setEditingCombName(currentName);
  };

  const saveEditedCombination = (id: string) => {
    if (editingCombName.trim()) {
      setCombinations(prev => prev.map(c => 
        c.id === id ? { ...c, name: editingCombName.trim() } : c
      ));
    }
    setEditingCombId(null);
  };

  const handleApply = () => {
    const posParts: string[] = [];
    const negParts: string[] = [];
    
    categories.forEach(cat => {
      const val = (presets[cat.id] || DEFAULT_PRESETS[cat.id] || [])[selections[cat.id] || 0]?.value || '';
      if (val) {
        if (cat.isNegative) {
          negParts.push(val);
        } else {
          posParts.push(val);
        }
      }
    });

    const pos = posParts.join('');
    const neg = negParts.join('');
    onApply(pos, negativePrompt + (negativePrompt && neg ? ', ' : '') + neg, '');
  };

  const handleReset = () => {
    setConfirmResetState(true);
  };

  const updatePresetItem = (category: string, index: number, field: 'label' | 'value', newValue: string) => {
    if (index === 0) return;
    setPresets(prev => {
      const newCategory = [...(prev[category] || DEFAULT_PRESETS[category] || [{ label: '指定なし / None', value: '' }])];
      newCategory[index] = { ...newCategory[index], [field]: newValue };
      return { ...prev, [category]: newCategory };
    });
  };

  const addPresetItem = (category: string) => {
    setPresets(prev => ({
      ...prev,
      [category]: [...(prev[category] || DEFAULT_PRESETS[category] || [{ label: '指定なし / None', value: '' }]), { label: 'New Item', value: '' }]
    }));
    setEditModes(prev => ({ ...prev, [category]: true }));
  };

  const removePresetItem = (category: string, index: number) => {
    if (index === 0) return;
    setPresets(prev => {
      const newCategory = [...(prev[category] || DEFAULT_PRESETS[category] || [{ label: '指定なし / None', value: '' }])];
      newCategory.splice(index, 1);
      return { ...prev, [category]: newCategory };
    });
    
    if (selections[category] === index) {
      setSelections(prev => ({ ...prev, [category]: 0 }));
    } else if (selections[category] > index) {
      setSelections(prev => ({ ...prev, [category]: prev[category] - 1 }));
    }
    
    setCheckedItems(prev => {
      const next = new Set(prev);
      const toAdd = new Set<string>();
      for (const id of Array.from(next)) {
        const [catId, idxStr] = (id as string).split(':');
        if (catId === category) {
          const checkedIdx = parseInt(idxStr, 10);
          if (checkedIdx === index) {
            next.delete(id);
          } else if (checkedIdx > index) {
            next.delete(id);
            toAdd.add(`${category}:${checkedIdx - 1}`);
          }
        }
      }
      toAdd.forEach(id => next.add(id));
      return next;
    });
  };

  
  const moveCategory = (catId: string, direction: 'top' | 'bottom') => {
    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === catId);
      if (idx === -1) return prev;
      const newCats = [...prev];
      const [item] = newCats.splice(idx, 1);
      
      const firstNegIdx = newCats.findIndex(c => c.isNegative);
      const isNeg = item.isNegative;
      
      if (direction === 'top') {
        if (isNeg) {
           newCats.splice(firstNegIdx === -1 ? newCats.length : firstNegIdx, 0, item);
        } else {
           newCats.unshift(item);
        }
      } else {
        if (isNeg) {
           newCats.push(item);
        } else {
           if (firstNegIdx === -1) newCats.push(item);
           else newCats.splice(firstNegIdx, 0, item);
        }
      }
      return newCats;
    });
  };

  const moveCheckedItemsToCategory = (targetCatId: string) => {
    if (checkedItems.size === 0) return;
    
    setPresets(prev => {
      const newState = { ...prev };
      const itemsToMove: {catId: string, idx: number}[] = [];
      
      checkedItems.forEach(id => {
        const [catId, idxStr] = (id as string).split(':');
        const idx = parseInt(idxStr, 10);
        if (catId && !isNaN(idx) && catId !== targetCatId) {
          itemsToMove.push({ catId, idx });
        }
      });
      
      if (itemsToMove.length === 0) return prev;

      const targetList = [...(newState[targetCatId] || DEFAULT_PRESETS[targetCatId] || [{ label: '指定なし / None', value: '' }])];
      
      const catIds = Array.from(new Set(itemsToMove.map(i => i.catId)));
      catIds.forEach(catId => {
        const indicesToRemove = itemsToMove.filter(i => i.catId === catId).map(i => i.idx).sort((a, b) => b - a);
        const newList = [...(newState[catId] || DEFAULT_PRESETS[catId] || [{ label: '指定なし / None', value: '' }])];
        indicesToRemove.forEach(idx => {
          const [item] = newList.splice(idx, 1);
          targetList.push(item);
        });
        newState[catId] = newList;
      });
      
      newState[targetCatId] = targetList;
      return newState;
    });
    
    // Uncheck and reset selections if they were pointing to moved items
    setCheckedItems(new Set());
    setSelections(prev => {
      const newSel = { ...prev };
      checkedItems.forEach(id => {
         const [catId, idxStr] = (id as string).split(':');
         if (newSel[catId] === parseInt(idxStr, 10)) {
           newSel[catId] = 0;
         }
      });
      return newSel;
    });
  };
const deleteCheckedItems = () => {
    if (checkedItems.size === 0) return;
    
    setPresets(prev => {
      const newState = { ...prev };
      const itemsToDelete: {catId: string, idx: number}[] = [];
      
      checkedItems.forEach(id => {
        const [catId, idxStr] = (id as string).split(':');
        const idx = parseInt(idxStr, 10);
        if (catId && !isNaN(idx)) {
          itemsToDelete.push({ catId, idx });
        }
      });
      
      const catIds = Array.from(new Set(itemsToDelete.map(i => i.catId)));
      catIds.forEach(catId => {
        const indicesToRemove = itemsToDelete.filter(i => i.catId === catId).map(i => i.idx).sort((a, b) => b - a);
        const newList = [...(newState[catId] || DEFAULT_PRESETS[catId] || [{ label: '指定なし / None', value: '' }])];
        indicesToRemove.forEach(idx => {
          newList.splice(idx, 1);
        });
        newState[catId] = newList;
      });
      
      return newState;
    });

    setCheckedItems(new Set());
    
    // Also we need to fix selections if the selected item was deleted, but for simplicity let's just reset them to 0 if they are out of bounds, 
    // actually, let's just let them be, the UI will fall back to 0 if out of bounds or we can fix it.
    // I will just reset to 0 for deleted categories to avoid complexity right now.
    setSelections(prev => {
      const newSel = { ...prev };
      checkedItems.forEach(id => {
         const [catId, idxStr] = (id as string).split(':');
         if (newSel[catId] === parseInt(idxStr, 10)) {
           newSel[catId] = 0;
         }
      });
      return newSel;
    });
  };

  const handleItemDragStart = (e: React.DragEvent, category: string, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItemId({ category, index });
    e.dataTransfer.setData('text/plain', `item:${category}:${index}`);
  };

  const handleItemDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleItemDrop = (e: React.DragEvent, targetCategory: string, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItemId || draggedItemId.category !== targetCategory) {
      setDraggedItemId(null);
      return;
    }
    const draggedIdx = draggedItemId.index;
    if (draggedIdx === targetIndex || draggedIdx === 0 || targetIndex === 0) {
      setDraggedItemId(null);
      return;
    }

    setPresets(prev => {
      const newCategory = [...(prev[targetCategory] || DEFAULT_PRESETS[targetCategory] || [{ label: '指定なし / None', value: '' }])];
      const [item] = newCategory.splice(draggedIdx, 1);
      newCategory.splice(targetIndex, 0, item);
      return { ...prev, [targetCategory]: newCategory };
    });

    setSelections(prev => {
      const currentSel = prev[targetCategory] || 0;
      let newSel = currentSel;
      
      if (currentSel === draggedIdx) {
        newSel = targetIndex;
      } else if (currentSel > draggedIdx && currentSel <= targetIndex) {
        newSel = currentSel - 1;
      } else if (currentSel < draggedIdx && currentSel >= targetIndex) {
        newSel = currentSel + 1;
      }
      return { ...prev, [targetCategory]: newSel };
    });

    setCheckedItems(prev => {
      const newSet = new Set(prev);
      const isDraggedChecked = prev.has(`${targetCategory}:${draggedIdx}`);
      
      if (draggedIdx < targetIndex) {
        for (let i = draggedIdx; i < targetIndex; i++) {
          if (prev.has(`${targetCategory}:${i + 1}`)) newSet.add(`${targetCategory}:${i}`);
          else newSet.delete(`${targetCategory}:${i}`);
        }
      } else {
        for (let i = draggedIdx; i > targetIndex; i--) {
          if (prev.has(`${targetCategory}:${i - 1}`)) newSet.add(`${targetCategory}:${i}`);
          else newSet.delete(`${targetCategory}:${i}`);
        }
      }
      
      if (isDraggedChecked) newSet.add(`${targetCategory}:${targetIndex}`);
      else newSet.delete(`${targetCategory}:${targetIndex}`);
      
      return newSet;
    });

    setDraggedItemId(null);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedCatId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedCatId || draggedCatId === targetId) return;
    setCategories(prev => {
      const draggedIdx = prev.findIndex(c => c.id === draggedCatId);
      const targetIdx = prev.findIndex(c => c.id === targetId);
      if (draggedIdx === -1 || targetIdx === -1) return prev;
      if (!!prev[draggedIdx].isNegative !== !!prev[targetIdx].isNegative) return prev;
      const newCats = [...prev];
      const [item] = newCats.splice(draggedIdx, 1);
      newCats.splice(targetIdx, 0, item);
      return newCats;
    });
    setDraggedCatId(null);
  };

  const renderCategory = (cat: CategoryDef, index: number) => {
    const key = cat.id;
    const items = Array.isArray(presets[key]) ? presets[key] : (DEFAULT_PRESETS[key] || [{ label: '指定なし / None', value: '' }]);
    const currentIdx = selections[key] ?? 0;
    const isEditing = editModes[key] || false;
    const isRenaming = editingCatName === key;

    return (
      <div 
        className={`flex flex-col gap-1.5 p-2 rounded border border-border-main bg-bg-surface transition-colors min-w-0 ${draggedCatId === key ? 'opacity-50' : 'hover:bg-bg-panel/30'}`}
        key={key}
        
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, key)}
      >
        <div className="flex items-center justify-between group cursor-pointer" onClick={() => { if (!isRenaming) setEditModes(prev => ({ ...prev, [key]: !prev[key] })); }}>
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <div 
              className="cursor-grab active:cursor-grabbing p-1 text-text-main hover:text-blue-500 transition-opacity" 
              draggable={!isRenaming && !isEditing}
              onDragStart={(e) => {
                if (isRenaming || isEditing) { e.preventDefault(); e.stopPropagation(); return; }
                handleDragStart(e, key);
              }}
              onDragEnd={() => {
                setDraggedCatId(null);
              }}
            >
              <GripVertical className="w-3 h-3" style={{ pointerEvents: 'none' }} />
            </div>
            {isRenaming ? (
              <input 
                autoFocus
                
                
                
                className="bg-bg-input border border-border-main rounded px-2 py-0.5 text-[13px] text-text-main font-mono w-full"
                defaultValue={cat.label}
                onBlur={(e) => {
                  const newLabel = e.target.value.trim();
                  if (newLabel) setCategories(prev => prev.map(c => c.id === key ? { ...c, label: newLabel } : c));
                  setEditingCatName(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const newLabel = e.currentTarget.value.trim();
                    if (newLabel) setCategories(prev => prev.map(c => c.id === key ? { ...c, label: newLabel } : c));
                    setEditingCatName(null);
                  } else if (e.key === 'Escape') {
                    setEditingCatName(null);
                  }
                }}
              />
            ) : (
              <label 
                className={`text-[13px] font-mono cursor-pointer hover:text-blue-500 truncate flex items-center gap-1.5 ${currentIdx !== 0 ? 'text-blue-500 font-bold' : 'text-text-main'}`}
                title={lang === 'en' ? "Click to expand/collapse" : "クリックして開閉"}
              >
                {cat.isNegative && "⛔ "}
                {currentIdx !== 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shrink-0 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></span>}
                {cat.label}
              </label>
            )}
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
            <button onClick={(e) => { e.stopPropagation(); setEditingCatName(key); }} className="p-0.5 text-text-dim hover:text-blue-500 transition-colors" title={lang === 'en' ? "Rename" : "名前を変更"}>
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); moveCategory(key, 'top'); }} className="p-0.5 text-text-main hover:text-blue-500" title="一番上へ"><ChevronsUp className="w-3 h-3" /></button>
            <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); moveCategory(key, 'bottom'); }} className="p-0.5 text-text-main hover:text-blue-500" title="一番下へ"><ChevronsDown className="w-3 h-3" /></button>
            {!DEFAULT_CATEGORIES.some(c => c.id === key) && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (confirmDeleteCatId === key) {
                    setCategories(prev => prev.filter(c => c.id !== key));
                    setPresets(prev => { const n = {...prev}; delete n[key]; return n; });
                    setConfirmDeleteCatId(null);
                  } else {
                    setConfirmDeleteCatId(key);
                    setTimeout(() => setConfirmDeleteCatId(null), 3000);
                  }
                }}
                className={`p-0.5 ml-1 transition-colors ${confirmDeleteCatId === key ? 'text-red-500 bg-red-500/20 rounded' : 'text-red-500 hover:text-red-400'}`}
                title={confirmDeleteCatId === key ? "クリックして削除" : "削除"}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          
        </div>
        
        {isEditing ? (
          <div className="flex flex-col gap-2 p-2 border border-blue-500/30 rounded bg-blue-500/5">
            <div className="flex justify-end mb-1">
              <button 
                onClick={() => { setSaveSuccessMessage(lang === 'en' ? 'Saved' : '保存しました'); setTimeout(() => setSaveSuccessMessage(null), 2000); }}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-[11px] font-bold transition-colors shadow-sm"
              >
                <Check className="w-3.5 h-3.5" /> {lang === 'en' ? 'Save Edit' : '編集保存'}
              </button>
            </div>
            {items.map((item, idx) => (!item || (idx === 0 && items.length > 1)) ? null : (
              <div 
                key={idx} 
                className={`flex gap-1 items-start ${draggedItemId?.category === key && draggedItemId?.index === idx ? 'opacity-50' : ''}`}
                
                onDragOver={handleItemDragOver}
                onDrop={(e) => handleItemDrop(e, key, idx)}
              >
                {idx !== 0 ? (
                  <div className="flex flex-col gap-2 items-center pt-1.5 shrink-0 w-[18px]">
                    <input 
                      type="checkbox"
                      checked={checkedItems.has(`${key}:${idx}`)}
                      onChange={(e) => {
                        const newSet = new Set(checkedItems);
                        if (e.target.checked) {
                          newSet.add(`${key}:${idx}`);
                        } else {
                          newSet.delete(`${key}:${idx}`);
                        }
                        setCheckedItems(newSet);
                      }}
                      className="cursor-pointer w-3.5 h-3.5"
                    />
                    <div 
                      className="cursor-grab active:cursor-grabbing text-text-dim hover:text-text-main transition-opacity" 
                      draggable={idx !== 0}
                      onDragStart={(e) => {
                        if (idx !== 0) handleItemDragStart(e, key, idx);
                      }}
                      onDragEnd={() => {
                        setDraggedItemId(null);
                      }}
                    >
                      <GripVertical className="w-3.5 h-3.5" style={{ pointerEvents: 'none' }} />
                    </div>
                  </div>
                ) : (
                  <div className="w-[14px] shrink-0" />
                )}
                <div className="flex flex-col gap-1 flex-1">
                  <input 
                    value={item?.label || ''}
                    onChange={(e) => updatePresetItem(key, idx, 'label', e.target.value)}
                    
                    
                    
                    className={`w-full bg-bg-input border border-border-main rounded px-2 py-1 text-[11px] ${idx === 0 ? 'text-text-dim cursor-not-allowed opacity-70' : 'text-text-main'}`} disabled={idx === 0}
                    placeholder="項目名 (例: Russian)"
                  />
                  <textarea 
                    value={item?.value || ''}
                    onChange={(e) => updatePresetItem(key, idx, 'value', e.target.value)}
                    
                    
                    
                    className={`w-full bg-bg-surface border border-border-main rounded px-2 py-1 text-[11px] font-mono h-[40px] resize-y min-h-[40px] ${idx === 0 ? 'text-text-dim cursor-not-allowed opacity-70' : 'text-text-main'}`} disabled={idx === 0}
                    placeholder="プロンプト (例: 1russian girl, )"
                  />
                </div>
                <div className="flex flex-col gap-1 shrink-0 pt-1">
                  {onInsertText && idx !== 0 && (
                    <button 
                      onClick={() => onInsertText(item.value, cat.isNegative)}
                      className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded"
                      title={lang === 'en' ? "Insert to editor" : "エディタに挿入"}
                    >
                      <ArrowLeftToLine className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {(idx !== 0 || (cat.isNegative && items.length > 1)) && (
                    <button 
                      onClick={() => {
                        const id = `${key}:${idx}`;
                        if (confirmDeleteItem === id) {
                          removePresetItem(key, idx);
                          setConfirmDeleteItem(null);
                        } else {
                          setConfirmDeleteItem(id);
                          setTimeout(() => setConfirmDeleteItem(null), 3000);
                        }
                      }}
                      className={`p-1.5 rounded transition-colors ${confirmDeleteItem === `${key}:${idx}` ? 'text-red-500 bg-red-500/20' : 'text-red-500 hover:bg-red-500/10'}`}
                      title={confirmDeleteItem === `${key}:${idx}` ? (lang === 'en' ? "Click to confirm delete" : "クリックして削除") : (lang === 'en' ? "Delete" : "削除")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button 
              onClick={() => addPresetItem(key)}
              className="flex items-center justify-center gap-1 w-full py-1.5 mt-1 border border-dashed border-blue-500/50 text-blue-500 hover:bg-blue-500/10 rounded text-[11px] transition-colors"
            >
              <Plus className="w-3 h-3" /> 新規項目を追加
            </button>
          </div>
        ) : (
          <div className="flex gap-2 items-center pl-4 w-full min-w-0 relative">
            {currentIdx !== 0 && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" title="選択中">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
            <select 
              value={currentIdx} 
              onChange={e => setSelections(prev => ({ ...prev, [key]: Number(e.target.value) }))} 
              className={`flex-1 min-w-0 bg-bg-input border ${currentIdx !== 0 ? 'border-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.1)]' : 'border-border-main'} rounded px-2 py-1.5 text-[13px] text-text-main truncate transition-colors`}
            >
              {items.map((o, idx) => <option key={idx} value={idx}>{o.label}</option>)}
            </select>
          </div>
        )}
      </div>
    );
  };

  const handleResetToDefault = () => {
    setConfirmResetToDefaultState(true);
  };
  
  const performResetToDefault = () => {
      setCategories([...DEFAULT_CATEGORIES]);
      setPresets({ ...DEFAULT_PRESETS });
      setCombinations([]);
      setSelections(Object.fromEntries(DEFAULT_CATEGORIES.map(c => [c.id, 0])));
      setNegativePrompt('');
      localStorage.removeItem('attribute_mixer_categories_v2');
      localStorage.removeItem('attribute_mixer_categories_v1');
      localStorage.removeItem('attribute_mixer_categories');
      localStorage.removeItem('attribute_mixer_custom_presets_v7');
      localStorage.removeItem('attribute_mixer_custom_presets_v6');
      localStorage.removeItem('attribute_mixer_custom_presets_v5');
      localStorage.removeItem('attribute_mixer_custom_presets_v4');
      localStorage.removeItem('attribute_mixer_custom_presets_v3');
      localStorage.removeItem('attribute_mixer_custom_presets_v2');
      localStorage.removeItem('attribute_mixer_custom_presets_v1');
      localStorage.removeItem('attribute_mixer_custom_presets');
      localStorage.removeItem('attribute_mixer_combinations_v1');
      localStorage.removeItem('attribute_mixer_combinations');
      localStorage.removeItem('attribute_mixer_selections_v1');
      setSaveSuccessMessage(lang === 'en' ? 'Initialized' : '初期化しました');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  return (
    <div className="w-full h-full flex flex-col relative min-h-0 bg-bg-panel">
      {/* 上部固定領域 */}
      <div className="shrink-0 p-4 pb-2 flex flex-col border-b border-border-main z-10 shadow-sm">
      <ConfirmModal
        isOpen={confirmResetState}
        message={t('reset_selection_confirm', lang)}
        onConfirm={() => {
          setSelections(Object.fromEntries(categories.map(c => [c.id, 0])));
          setNegativePrompt('');
          setActiveCombinationId('');
          setConfirmResetState(false);
        }}
        onCancel={() => setConfirmResetState(false)}
        lang={lang}
      />
      <ConfirmModal
        isOpen={confirmBulkDeleteState}
        message={lang === "en" ? "Delete selected items?" : "選択した項目を削除しますか？"}
        onConfirm={deleteCheckedItems}
        onCancel={() => setConfirmBulkDeleteState(false)}
        lang={lang}
      />
      <ConfirmModal
        isOpen={confirmResetToDefaultState}
        message={t('reset_mixer_confirm', lang)}
        onConfirm={() => {
          performResetToDefault();
          setConfirmResetToDefaultState(false);
        }}
        onCancel={() => setConfirmResetToDefaultState(false)}
        lang={lang}
      />
      {/* 組み合わせ保存・ロード領域 */}
      <div className="flex flex-col gap-2 p-3 bg-bg-surface border border-border-main rounded relative shrink-0 shadow-sm">
        {saveSuccessMessage && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[999] bg-green-600 text-white shadow-lg border border-green-500 px-4 py-2 rounded text-[13px] font-bold animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            {saveSuccessMessage}
          </div>
        )}
                <div className="flex gap-2 items-center">
          <label className="text-[13px] font-bold text-text-main font-mono flex items-center gap-1.5 flex-1">
            <Save className="w-4 h-4 text-blue-500" />
            {t('save_and_load_settings', lang)}
          </label>
          <button
            onClick={handleResetToDefault}
            className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded text-[11px] font-bold transition-colors flex items-center gap-1"
          >
            {t('reset_to_default', lang)}
          </button>
          <button
            onClick={() => setShowCopyConfirm(true)}
            className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/30 rounded text-[11px] font-bold transition-colors flex items-center gap-1 shrink-0"
            title={checkedItems.size > 0 
              ? (lang === 'en' ? "Copy checked items to Parts" : "選択した項目をパーツへコピー")
              : (lang === 'en' ? "Copy current prompt selections to Parts" : "現在ドロップダウンで選択中のプロンプトをパーツへコピー")}
          >
            <Copy className="w-3 h-3" />
            {lang === 'en' ? "Copy to Parts" : "パーツへコピー"}
          </button>
          
          <ConfirmModal
            isOpen={showCopyConfirm}
            message={checkedItems.size > 0 
              ? (lang === 'en' ? 'Copy checked items to "Others > Parts from Mixer"?' : 'チェックした項目を「その他」＞「プロンプトミキサーからのパーツ」へコピーしますか？')
              : (lang === 'en' ? 'Copy current prompt selections to "Others > Parts from Mixer"?' : '現在ドロップダウンで選択中のプロンプトを「その他」＞「プロンプトミキサーからのパーツ」へコピーしますか？')}
            onConfirm={() => {
              setShowCopyConfirm(false);
              handleCopyToParts();
            }}
            onCancel={() => setShowCopyConfirm(false)}
            lang={lang}
          />
      
        </div>
        
        <div className="flex gap-2 items-center min-w-0">
          <select 
            onChange={(e) => {
              loadCombination(e.target.value);
            }}
            className="flex-1 min-w-0 bg-bg-input border border-border-main rounded px-2 py-1.5 text-[13px] text-text-main font-mono truncate"
            value={activeCombinationId || ""}
          >
            <option value="" disabled>{t('load_saved_settings', lang)}</option>
            {combinations.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {activeCombinationId && (
            <button
              onClick={() => loadCombination(activeCombinationId)}
              className="p-1.5 bg-bg-input hover:bg-border-hover border border-border-main rounded text-text-main hover:text-blue-500 transition-colors shrink-0"
              title="保存状態に戻す (Revert to saved)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 mt-1">
          <button 
            onClick={saveCurrentCombination}
            className="flex-1 py-1.5 bg-bg-input hover:bg-border-hover border border-border-main rounded text-text-main text-[11px] font-bold transition-colors"
          >{t('save_new', lang)}</button>
          {activeCombinationId && (
            <button 
              onClick={updateCombination}
              className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white border border-blue-600 rounded text-[11px] font-bold transition-colors"
            >{t('overwrite_save', lang)}</button>
          )}
        </div>
        
        {combinations.length > 0 && (
          <div className="mt-2 flex flex-col gap-1 border-t border-border-main pt-2">
            <button 
              onClick={() => setIsSavedListOpen(!isSavedListOpen)}
              className="flex items-center justify-between w-full text-[12px] text-text-main hover:text-blue-500 py-1"
            >
              <span>保存済み一覧 ({combinations.length}件)</span>
              {isSavedListOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            
            {isSavedListOpen && (
              <div className="flex flex-col gap-1.5 mt-1 max-h-[220px] overflow-y-auto pr-1">
                {combinations.map(c => (
                  <div key={c.id} className="flex flex-col gap-1.5 bg-bg-input p-2 rounded border border-border-main">
                    <div className="flex items-center justify-between">
                      {editingCombId === c.id ? (
                        <div className="flex items-center gap-1 flex-1 mr-2">
                          <input 
                            type="text" 
                            value={editingCombName}
                            onChange={(e) => setEditingCombName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEditedCombination(c.id); }}
                            className="flex-1 bg-bg-surface border border-blue-500/50 rounded px-1.5 py-0.5 text-[12px] text-text-main font-mono"
                            autoFocus
                          />
                          <button onClick={() => saveEditedCombination(c.id)} className="text-blue-500 p-1 hover:bg-blue-500/10 rounded">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[12px] text-text-main font-bold font-mono truncate flex-1">{c.name}</span>
                      )}
                      
                      <div className="flex items-center gap-1 shrink-0">
                        {editingCombId !== c.id && (
                          <button 
                            onClick={() => startEditingCombination(c.id, c.name)}
                            className="text-text-main hover:text-blue-500 p-1 rounded transition-colors"
                            title="名前を変更"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (confirmDeleteCombId === c.id) {
                              deleteCombination(c.id);
                              setConfirmDeleteCombId(null);
                            } else {
                              setConfirmDeleteCombId(c.id);
                              setTimeout(() => setConfirmDeleteCombId(null), 3000);
                            }
                          }}
                          className={`p-1 rounded transition-colors ${confirmDeleteCombId === c.id ? 'text-red-500 bg-red-500/20' : 'text-red-500/70 hover:text-red-500 hover:bg-red-500/10'}`}
                          title={confirmDeleteCombId === c.id ? "クリックして削除" : "削除"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => loadCombination(c.id)}
                      className="w-full text-center py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded text-[11px] font-bold transition-colors"
                    >
                      この設定を呼び出す
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      

      {checkedItems.size > 0 && (
        <div className="bg-bg-panel/90 py-2 mt-3 -mx-4 px-4 flex flex-wrap gap-2 justify-between items-center border-t border-border-main">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold text-blue-500 whitespace-nowrap bg-blue-500/10 px-2 py-0.5 rounded">{checkedItems.size} selected</span>
          </div>
          <div className="flex gap-2 items-center flex-1 min-w-0 justify-end">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  moveCheckedItemsToCategory(e.target.value);
                  e.target.value = "";
                }
              }}
              className="flex-1 min-w-[100px] bg-bg-input border border-border-main hover:border-border-hover rounded px-2 py-1.5 text-[13px] text-text-main truncate transition-colors appearance-none cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>Move to...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.label} へ移動</option>
              ))}
            </select>
            <button
              onClick={() => setConfirmBulkDeleteState(true)}
              className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded text-[11px] font-bold transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> DELETE
            </button>
            <button
              onClick={() => setCheckedItems(new Set())}
              className="px-3 py-1.5 bg-bg-input hover:bg-border-main border border-border-main rounded text-[11px] font-bold transition-colors text-text-dim hover:text-text-main"
            >
              選択解除
            </button>
          </div>
        </div>
      )}
      </div>

      <div className="flex justify-end px-4 pt-2 shrink-0">
        <button
          onClick={() => {
            const isAllExpanded = categories.length > 0 && categories.every(c => editModes[c.id]);
            if (isAllExpanded) {
              setEditModes({});
            } else {
              const next = {};
              categories.forEach(c => next[c.id] = true);
              setEditModes(next);
            }
          }}
          className="px-2 py-1 bg-bg-surface hover:bg-bg-input border border-border-main rounded text-[11px] font-bold flex items-center gap-1 transition-colors text-text-main shadow-sm"
        >
          {categories.length > 0 && categories.every(c => editModes[c.id]) ? <ChevronsUp className="w-3.5 h-3.5" /> : <ChevronsDown className="w-3.5 h-3.5" />}
          {categories.length > 0 && categories.every(c => editModes[c.id]) ? t('collapse_all', lang) : t('expand_all', lang)}
        </button>
      </div>

      {/* スクロール領域 */}
      <div className="flex-1 overflow-y-auto p-4 pt-3 flex flex-col">
        <div className="flex flex-col gap-2">
          {categories.map((c, i) => !c.isNegative && renderCategory(c, i))}
        </div>
      
      <div className="flex gap-2 justify-end mt-2">
        <button
          onClick={() => {
            const id = 'custom_' + Date.now();
            setCategories(prev => [...prev, { id, label: '新規カテゴリ' }]);
            setPresets(prev => ({ ...prev, [id]: [{ label: '指定なし / None', value: '' }] }));
          }}
          className="px-2 py-1 bg-bg-surface hover:bg-bg-input border border-border-main rounded text-[11px] font-bold flex items-center gap-1 transition-colors text-text-main"
        >
          <Plus className="w-3 h-3" /> カテゴリ追加
        </button>
      </div>

      <div className="flex flex-col gap-1.5 pt-2 border-t border-border-main mt-2">
        <div className="flex flex-col gap-2 mb-2">
          {categories.map((c, i) => c.isNegative && renderCategory(c, i))}
        </div>
        <label className="text-[13px] font-bold text-text-main font-mono mt-2">⛔ ネガティブプロンプト (自由入力)</label>
        <textarea 
          value={negativePrompt}
          onChange={e => setNegativePrompt(e.target.value)}
          placeholder="ネガティブプロンプトを追加..."
          className="w-full bg-bg-input border border-border-main rounded px-2 py-1.5 text-[13px] text-text-main font-mono min-h-[60px] resize-y"
        />
        <button
          onClick={() => {
            const id = 'custom_neg_' + Date.now();
            setCategories(prev => [...prev, { id, label: '新規ネガティブ', isNegative: true }]);
            setPresets(prev => ({ ...prev, [id]: [{ label: '指定なし / None', value: '' }] }));
          }}
          className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded text-[11px] font-bold flex items-center gap-1 transition-colors text-red-400 self-end mt-1"
        >
          <Plus className="w-3 h-3" /> ネガティブ追加
        </button>
      </div>

      <div className="flex gap-2 pt-2 mt-2 border-t border-border-main">
        <button 
          onClick={handleReset}
          className="flex-1 px-3 py-2 bg-gray-500 hover:bg-gray-400 text-white rounded text-[13px] font-mono font-bold transition-colors"
        >
          リセット
        </button>
        <button 
          onClick={handleApply}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-[13px] font-mono font-bold transition-colors flex items-center justify-center gap-1"
        >
          <Check className="w-4 h-4" /> 適用する
        </button>
      </div>
    </div>
    </div>
  );
};
