export type SectionType = 1 | 2 | 3 | 4 | 5;

export interface MasterPrompt {
  id: string;
  name: string;
  content: string;
  negativeContent?: string;
  mark?: string;
}

export interface VariationPart {
  id: string;
  section: SectionType;
  category: string;
  name: string;
  content: string;
  isPinned: boolean;
  isNegative?: boolean;
}

export interface AppData {
  memos?: MasterPrompt[];
  masters: MasterPrompt[];
  negatives?: MasterPrompt[];
  parts: VariationPart[];
  customCategories?: { name: string, section: SectionType }[];
  customSectionNames?: Record<number, string>;
}
