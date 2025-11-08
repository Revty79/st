// Core application types and interfaces

// User and Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: number;
  expires_at: number;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// World System Types
export interface World {
  id: number;
  name: string;
  description: string;
  lore: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface WorldFormData {
  name: string;
  description: string;
  lore: string;
}

// Race System Types
export interface Race {
  id: number;
  name: string;
  description: string;
  attributes: string; // JSON string containing attribute modifiers
  special_abilities: string; // JSON string containing abilities
  world_id: number;
  created_at: string;
  updated_at: string;
}

export interface RaceAttributes {
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
}

export interface RaceFormData {
  name: string;
  description: string;
  attributes: RaceAttributes;
  special_abilities: string[];
  world_id: number;
}

// Creature System Types
export interface Creature {
  id: number;
  name: string;
  type: string;
  description: string;
  stats: string; // JSON string containing creature stats
  abilities: string; // JSON string containing abilities
  world_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreatureStats {
  hp?: number;
  ac?: number;
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
  speed?: number;
  challenge_rating?: number;
}

export interface CreatureFormData {
  name: string;
  type: string;
  description: string;
  stats: CreatureStats;
  abilities: string[];
  world_id: number;
}

// Item System Types
export interface Item {
  id: number;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'tool' | 'treasure' | 'misc';
  description: string;
  properties: string; // JSON string containing item properties
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary' | 'artifact';
  value: number; // In gold pieces
  weight: number; // In pounds
  world_id: number;
  created_at: string;
  updated_at: string;
}

export interface ItemProperties {
  damage?: string;
  damage_type?: string;
  ac?: number;
  ac_bonus?: number;
  range?: string;
  properties?: string[];
  spell_slots?: number;
  charges?: number;
  effects?: string[];
}

export interface ItemFormData {
  name: string;
  type: Item['type'];
  description: string;
  properties: ItemProperties;
  rarity: Item['rarity'];
  value: number;
  weight: number;
  world_id: number;
}

// Weapon System Types
export interface Weapon {
  id: number;
  name: string;
  type: string;
  damage: string;
  damage_type: string;
  properties: string; // JSON string containing weapon properties
  range?: string;
  weight: number;
  cost: number;
  world_id: number;
  created_at: string;
  updated_at: string;
}

export interface WeaponFormData {
  name: string;
  type: string;
  damage: string;
  damage_type: string;
  properties: string[];
  range?: string;
  weight: number;
  cost: number;
  world_id: number;
}

// Armor System Types
export interface Armor {
  id: number;
  name: string;
  type: string;
  ac: number;
  dex_bonus: boolean;
  max_dex_bonus?: number;
  stealth_disadvantage: boolean;
  weight: number;
  cost: number;
  world_id: number;
  created_at: string;
  updated_at: string;
}

export interface ArmorFormData {
  name: string;
  type: string;
  ac: number;
  dex_bonus: boolean;
  max_dex_bonus?: number;
  stealth_disadvantage: boolean;
  weight: number;
  cost: number;
  world_id: number;
}

// Skill System Types
export interface Skill {
  id: number;
  name: string;
  description: string;
  ability_score: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  world_id: number;
  created_at: string;
  updated_at: string;
}

export interface SkillFormData {
  name: string;
  description: string;
  ability_score: Skill['ability_score'];
  world_id: number;
}

// Special Ability System Types
export interface SpecialAbility {
  id: number;
  name: string;
  description: string;
  type: 'passive' | 'active' | 'reaction' | 'bonus_action';
  cost?: string; // Action cost or resource cost
  requirements?: string;
  world_id: number;
  created_at: string;
  updated_at: string;
}

export interface SpecialAbilityFormData {
  name: string;
  description: string;
  type: SpecialAbility['type'];
  cost?: string;
  requirements?: string;
  world_id: number;
}

// Magic Build System Types
export interface MagicBuild {
  id: number;
  name: string;
  class_type: string;
  level: number;
  spells: string; // JSON string containing spell list
  abilities: string; // JSON string containing class abilities
  equipment: string; // JSON string containing starting equipment
  stats: string; // JSON string containing stat distribution
  world_id: number;
  created_at: string;
  updated_at: string;
}

export interface MagicBuildSpells {
  [level: number]: string[];
}

export interface MagicBuildFormData {
  name: string;
  class_type: string;
  level: number;
  spells: MagicBuildSpells;
  abilities: string[];
  equipment: string[];
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  world_id: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}

// Form and UI Types
export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string | number; label: string }>;
  className?: string;
  error?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

// Database Types
export interface DatabaseRow {
  [key: string]: any;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type CreateInput<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;

export type UpdateInput<T> = Partial<CreateInput<T>> & { id: number };

// Timeline Types (if used)
export interface TimelineEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  type: 'major' | 'minor' | 'battle' | 'discovery' | 'founding';
  world_id: number;
  created_at: string;
  updated_at: string;
}