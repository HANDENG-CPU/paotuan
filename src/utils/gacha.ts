import { Card } from '../types';

export const drawCard = (cards: Card[]): Card => {
  const totalProbability = cards.reduce((sum, card) => sum + card.probability, 0);
  const random = Math.random() * totalProbability;
  
  let cumulativeProbability = 0;
  for (const card of cards) {
    cumulativeProbability += card.probability;
    if (random <= cumulativeProbability) {
      return card;
    }
  }
  
  // 如果出现意外情况，返回最后一张卡
  return cards[cards.length - 1];
};

export const drawMultipleCards = (cards: Card[], count: number): Card[] => {
  const results: Card[] = [];
  for (let i = 0; i < count; i++) {
    results.push(drawCard(cards));
  }
  return results;
}; 