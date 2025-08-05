import { User, GameSession, Character, Campaign, Map, GameRule, GachaEvent, GachaRecord } from '../types';

// 用户相关存储
export const saveUsers = (users: User[]): void => {
  localStorage.setItem('rpg_users', JSON.stringify(users));
};

export const loadUsers = (): User[] => {
  const data = localStorage.getItem('rpg_users');
  if (!data) return [];
  
  const users = JSON.parse(data);
  return users.map((user: any) => ({
    ...user,
    createdAt: new Date(user.createdAt)
  }));
};

export const saveCurrentUser = (user: User): void => {
  localStorage.setItem('rpg_current_user', JSON.stringify(user));
};

export const loadCurrentUser = (): User | null => {
  const data = localStorage.getItem('rpg_current_user');
  if (!data) return null;
  
  const user = JSON.parse(data);
  return {
    ...user,
    createdAt: new Date(user.createdAt)
  };
};

// 会话相关存储
export const saveSessions = (sessions: GameSession[]): void => {
  localStorage.setItem('rpg_sessions', JSON.stringify(sessions));
};

export const loadSessions = (): GameSession[] => {
  const data = localStorage.getItem('rpg_sessions');
  if (!data) return [];
  
  const sessions = JSON.parse(data);
  return sessions.map((session: any) => ({
    ...session,
    createdAt: new Date(session.createdAt),
    updatedAt: new Date(session.updatedAt),
    players: session.players.map((player: any) => ({
      ...player,
      joinedAt: new Date(player.joinedAt)
    }))
  }));
};

// 角色相关存储
export const saveCharacters = (characters: Character[]): void => {
  localStorage.setItem('rpg_characters', JSON.stringify(characters));
};

export const loadCharacters = (): Character[] => {
  const data = localStorage.getItem('rpg_characters');
  if (!data) return [];
  
  const characters = JSON.parse(data);
  return characters.map((character: any) => ({
    ...character,
    createdAt: new Date(character.createdAt),
    updatedAt: new Date(character.updatedAt)
  }));
};

// 战役相关存储
export const saveCampaigns = (campaigns: Campaign[]): void => {
  localStorage.setItem('rpg_campaigns', JSON.stringify(campaigns));
};

export const loadCampaigns = (): Campaign[] => {
  const data = localStorage.getItem('rpg_campaigns');
  if (!data) return [];
  
  const campaigns = JSON.parse(data);
  return campaigns.map((campaign: any) => ({
    ...campaign,
    createdAt: new Date(campaign.createdAt),
    updatedAt: new Date(campaign.updatedAt),
    sessions: campaign.sessions.map((session: any) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
      players: session.players.map((player: any) => ({
        ...player,
        joinedAt: new Date(player.joinedAt)
      }))
    })),
    characters: campaign.characters.map((character: any) => ({
      ...character,
      createdAt: new Date(character.createdAt),
      updatedAt: new Date(character.updatedAt)
    })),
    notes: campaign.notes.map((note: any) => ({
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt)
    })),
    npcs: campaign.npcs.map((npc: any) => ({
      ...npc,
      files: npc.files.map((file: any) => ({
        ...file,
        uploadedAt: new Date(file.uploadedAt)
      }))
    })),
    plotPoints: campaign.plotPoints
  }));
};

// 地图相关存储
export const saveMaps = (maps: Map[]): void => {
  localStorage.setItem('rpg_maps', JSON.stringify(maps));
};

export const loadMaps = (): Map[] => {
  const data = localStorage.getItem('rpg_maps');
  if (!data) return [];
  
  const maps = JSON.parse(data);
  return maps.map((map: any) => ({
    ...map,
    createdAt: new Date(map.createdAt),
    updatedAt: new Date(map.updatedAt),
    collaborators: map.collaborators?.map((collaborator: any) => ({
      ...collaborator,
      joinedAt: new Date(collaborator.joinedAt)
    })) || []
  }));
};

// 规则相关存储
export const saveRules = (rules: GameRule[]): void => {
  localStorage.setItem('rpg_rules', JSON.stringify(rules));
};

export const loadRules = (): GameRule[] => {
  const data = localStorage.getItem('rpg_rules');
  if (!data) return [];
  
  const rules = JSON.parse(data);
  return rules.map((rule: any) => ({
    ...rule,
    createdAt: new Date(rule.createdAt),
    updatedAt: new Date(rule.updatedAt),
    collaborators: rule.collaborators?.map((collaborator: any) => ({
      ...collaborator,
      joinedAt: new Date(collaborator.joinedAt)
    })) || []
  }));
};

// 抽卡事件相关存储
export const saveGachaEvents = (events: GachaEvent[]): void => {
  localStorage.setItem('rpg_gacha_events', JSON.stringify(events));
};

export const loadGachaEvents = (): GachaEvent[] => {
  const data = localStorage.getItem('rpg_gacha_events');
  if (!data) return [];
  
  const events = JSON.parse(data);
  return events.map((event: any) => ({
    ...event,
    createdAt: new Date(event.createdAt),
    updatedAt: new Date(event.updatedAt),
    participants: event.participants?.map((participant: any) => ({
      ...participant,
      joinedAt: new Date(participant.joinedAt)
    })) || []
  }));
};

// 抽卡记录相关存储
export const saveGachaRecords = (records: GachaRecord[]): void => {
  localStorage.setItem('rpg_gacha_records', JSON.stringify(records));
};

export const loadGachaRecords = (): GachaRecord[] => {
  const data = localStorage.getItem('rpg_gacha_records');
  if (!data) return [];
  
  const records = JSON.parse(data);
  return records.map((record: any) => ({
    ...record,
    drawnAt: new Date(record.drawnAt)
  }));
};

// 聊天记录相关存储
export const saveChatMessages = (sessionId: string, messages: any[]): void => {
  localStorage.setItem(`rpg_chat_${sessionId}`, JSON.stringify(messages));
};

export const loadChatMessages = (sessionId: string): any[] => {
  const data = localStorage.getItem(`rpg_chat_${sessionId}`);
  if (!data) return [];
  
  const messages = JSON.parse(data);
  return messages.map((message: any) => ({
    ...message,
    timestamp: new Date(message.timestamp)
  }));
};

// 骰子记录相关存储
export const saveDiceRolls = (sessionId: string, rolls: any[]): void => {
  localStorage.setItem(`rpg_dice_${sessionId}`, JSON.stringify(rolls));
};

export const loadDiceRolls = (sessionId: string): any[] => {
  const data = localStorage.getItem(`rpg_dice_${sessionId}`);
  if (!data) return [];
  
  const rolls = JSON.parse(data);
  return rolls.map((roll: any) => ({
    ...roll,
    timestamp: new Date(roll.timestamp)
  }));
};

// 通用数据清理函数
export const clearAllData = (): void => {
  const keys = [
    'rpg_users',
    'rpg_current_user',
    'rpg_sessions',
    'rpg_characters',
    'rpg_campaigns',
    'rpg_maps',
    'rpg_rules',
    'rpg_gacha_events',
    'rpg_gacha_records'
  ];
  
  keys.forEach(key => localStorage.removeItem(key));
  
  // 清理聊天和骰子记录
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.startsWith('rpg_chat_') || key.startsWith('rpg_dice_')) {
      localStorage.removeItem(key);
    }
  });
};

// 数据导出函数
export const exportData = (): string => {
  const data = {
    users: loadUsers(),
    sessions: loadSessions(),
    characters: loadCharacters(),
    campaigns: loadCampaigns(),
    maps: loadMaps(),
    rules: loadRules(),
    gachaEvents: loadGachaEvents(),
    gachaRecords: loadGachaRecords(),
    exportDate: new Date().toISOString()
  };
  
  return JSON.stringify(data, null, 2);
};

// 数据导入函数
export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.users) saveUsers(data.users);
    if (data.sessions) saveSessions(data.sessions);
    if (data.characters) saveCharacters(data.characters);
    if (data.campaigns) saveCampaigns(data.campaigns);
    if (data.maps) saveMaps(data.maps);
    if (data.rules) saveRules(data.rules);
    if (data.gachaEvents) saveGachaEvents(data.gachaEvents);
    if (data.gachaRecords) saveGachaRecords(data.gachaRecords);
    
    return true;
  } catch (error) {
    console.error('数据导入失败:', error);
    return false;
  }
}; 