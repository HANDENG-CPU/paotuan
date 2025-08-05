import * as XLSX from 'xlsx';
import { Card, ExcelCardData } from '../types';

export const parseExcelFile = (file: File): Promise<Card[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelCardData[];
        
        const cards: Card[] = jsonData.map((row, index) => ({
          id: `card_${Date.now()}_${index}`,
          name: row.name || `卡片${index + 1}`,
          rarity: row.rarity || '普通',
          probability: row.probability || 1,
          image: row.image,
          description: row.description,
        }));
        
        resolve(cards);
      } catch (error) {
        reject(new Error('Excel文件解析失败，请检查文件格式'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const downloadExcelTemplate = () => {
  const template = [
    { name: '卡片名称', rarity: '稀有度', probability: '概率', image: '图片链接', description: '描述' },
    { name: 'SSR角色', rarity: 'SSR', probability: 0.01, image: '', description: '超稀有角色' },
    { name: 'SR角色', rarity: 'SR', probability: 0.05, image: '', description: '稀有角色' },
    { name: 'R角色', rarity: 'R', probability: 0.2, image: '', description: '普通角色' },
    { name: 'N角色', rarity: 'N', probability: 0.74, image: '', description: '常见角色' },
  ];
  
  const ws = XLSX.utils.json_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '卡片数据');
  
  XLSX.writeFile(wb, '抽卡模板.xlsx');
}; 