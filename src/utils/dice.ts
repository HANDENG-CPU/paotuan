export interface DiceRollResult {
  notation: string;
  result: number;
  details: DiceRollDetail[];
  rolls: number[];
}

export interface DiceRollDetail {
  dice: number;
  sides: number;
  rolls: number[];
  total: number;
}

// 解析骰子表达式，支持如 "2d6+3", "1d20", "3d6-1" 等格式
export function parseDiceNotation(notation: string): DiceRollResult {
  const cleanNotation = notation.replace(/\s/g, '').toLowerCase();
  const match = cleanNotation.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  
  if (!match) {
    throw new Error('无效的骰子表达式');
  }
  
  const [, diceCount, sides, modifier] = match;
  const numDice = parseInt(diceCount);
  const numSides = parseInt(sides);
  const modifierValue = modifier ? parseInt(modifier) : 0;
  
  if (numDice < 1 || numSides < 1) {
    throw new Error('骰子数量和面数必须大于0');
  }
  
  if (numDice > 100 || numSides > 1000) {
    throw new Error('骰子数量或面数过大');
  }
  
  const rolls: number[] = [];
  for (let i = 0; i < numDice; i++) {
    rolls.push(Math.floor(Math.random() * numSides) + 1);
  }
  
  const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifierValue;
  
  const details: DiceRollDetail = {
    dice: numDice,
    sides: numSides,
    rolls,
    total: total - modifierValue
  };
  
  return {
    notation: cleanNotation,
    result: total,
    details: [details],
    rolls
  };
}

// 生成骰子表达式
export function generateDiceNotation(dice: number, sides: number, modifier: number = 0): string {
  let notation = `${dice}d${sides}`;
  if (modifier > 0) {
    notation += `+${modifier}`;
  } else if (modifier < 0) {
    notation += `${modifier}`;
  }
  return notation;
}

// 常用骰子表达式
export const COMMON_DICE = {
  '1d4': '1d4',
  '1d6': '1d6',
  '1d8': '1d8',
  '1d10': '1d10',
  '1d12': '1d12',
  '1d20': '1d20',
  '1d100': '1d100',
  '2d6': '2d6',
  '3d6': '3d6',
  '4d6': '4d6',
  '5d6': '5d6',
  '6d6': '6d6',
  '1d20+5': '1d20+5',
  '1d20-1': '1d20-1',
  '2d6+3': '2d6+3',
  '3d6-2': '3d6-2'
};

// 检查骰子表达式是否有效
export function isValidDiceNotation(notation: string): boolean {
  try {
    parseDiceNotation(notation);
    return true;
  } catch {
    return false;
  }
}

// 获取骰子表达式的可能结果范围
export function getDiceRange(notation: string): { min: number; max: number } {
  const cleanNotation = notation.replace(/\s/g, '').toLowerCase();
  const match = cleanNotation.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  
  if (!match) {
    throw new Error('无效的骰子表达式');
  }
  
  const [, diceCount, sides, modifier] = match;
  const numDice = parseInt(diceCount);
  const numSides = parseInt(sides);
  const modifierValue = modifier ? parseInt(modifier) : 0;
  
  return {
    min: numDice + modifierValue,
    max: numDice * numSides + modifierValue
  };
} 