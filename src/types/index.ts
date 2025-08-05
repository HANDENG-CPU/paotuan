export interface Card {
  id: string;
  name: string;
  rarity: string;
  image?: string;
  description?: string;
  probability: number;
}

export interface GachaEvent {
  id: string;
  name: string;
  description?: string;
  cards: Card[];
  roomCode: string;
  participants: GachaParticipant[];
  isPublic: boolean;
  maxParticipants: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GachaParticipant {
  id: string;
  userId: string;
  username: string;
  joinedAt: Date;
  isActive: boolean;
}

export interface GachaRecord {
  id: string;
  eventId: string;
  eventName: string;
  cardId: string;
  cardName: string;
  cardRarity: string;
  userId: string;
  username: string;
  drawnAt: Date;
}

export interface ExcelCardData {
  name: string;
  rarity: string;
  probability: number;
  image?: string;
  description?: string;
}

// 跑团平台相关类型
export interface User {
  id: string;
  username: string;
  avatar?: string;
  email?: string;
  createdAt: Date;
}

export interface GameSession {
  id: string;
  name: string;
  description?: string;
  gameSystem: GameSystem;
  gmId: string;
  maxPlayers: number;
  isPublic: boolean;
  roomCode: string;
  players: Player[];
  status: 'preparing' | 'active' | 'paused' | 'ended';
  createdAt: Date;
  updatedAt: Date;
}

export interface Player {
  id: string;
  userId: string;
  username: string;
  character?: Character;
  isGM: boolean;
  isOnline: boolean;
  joinedAt: Date;
}

export interface Character {
  id: string;
  name: string;
  race?: string;
  class?: string;
  level: number;
  attributes: CharacterAttributes;
  skills: CharacterSkill[];
  equipment: Equipment[];
  background?: string;
  portrait?: string;
  campaignId?: string;
  sessionId?: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterAttributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface CharacterSkill {
  name: string;
  value: number;
  modifier: number;
  description?: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'item' | 'magic';
  description?: string;
  quantity: number;
  weight?: number;
  value?: number;
}

export interface GameSystem {
  id: string;
  name: string;
  version: string;
  description?: string;
  diceNotation: string;
  attributes: string[];
  skills: string[];
}

export interface DiceRoll {
  id: string;
  userId: string;
  username: string;
  notation: string;
  result: number;
  details: DiceRollDetail[];
  timestamp: Date;
}

export interface DiceRollDetail {
  dice: number;
  sides: number;
  rolls: number[];
  total: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  type: 'text' | 'system' | 'roll' | 'whisper';
  content: string;
  targetId?: string;
  timestamp: Date;
}

export interface Map {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  width: number;
  height: number;
  gridSize: number;
  tokens: MapToken[];
  roomCode: string;
  collaborators: MapCollaborator[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MapCollaborator {
  id: string;
  userId: string;
  username: string;
  permission: 'view' | 'edit' | 'admin';
  joinedAt: Date;
}

export interface MapToken {
  id: string;
  name: string;
  x: number;
  y: number;
  size: number;
  imageUrl?: string;
  isVisible: boolean;
  isPlayer: boolean;
  characterId?: string;
}

export interface GameRule {
  id: string;
  name: string;
  content: string;
  category: string;
  tags: string[];
  roomCode: string;
  version: string;
  collaborators: RuleCollaborator[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleCollaborator {
  id: string;
  userId: string;
  username: string;
  permission: 'view' | 'edit' | 'admin';
  joinedAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  gameSystem: GameSystem;
  gmId: string;
  maxPlayers: number;
  isPublic: boolean;
  roomCode: string;
  sessions: GameSession[];
  characters: Character[];
  notes: CampaignNote[];
  npcs: NPC[];
  plotPoints: PlotPoint[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignNote {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NPC {
  id: string;
  name: string;
  description: string;
  role: string;
  location: string;
  isAlive: boolean;
  files: NPCFile[];
}

export interface NPCFile {
  id: string;
  name: string;
  type: 'image' | 'document' | 'audio' | 'other';
  url: string;
  size: number;
  uploadedAt: Date;
}

export interface PlotPoint {
  id: string;
  title: string;
  description: string;
  chapter: number;
  isCompleted: boolean;
} 