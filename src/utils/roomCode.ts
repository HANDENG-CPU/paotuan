// 房间码生成和管理工具
export class RoomCodeManager {
  private static readonly ROOM_CODE_LENGTH = 6;
  private static readonly ROOM_CODE_CHARS = '0123456789';

  // 生成随机房间码
  static generateRoomCode(): string {
    let code = '';
    for (let i = 0; i < this.ROOM_CODE_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * this.ROOM_CODE_CHARS.length);
      code += this.ROOM_CODE_CHARS[randomIndex];
    }
    return code;
  }

  // 验证房间码格式
  static isValidRoomCode(code: string): boolean {
    if (!code || code.length !== this.ROOM_CODE_LENGTH) {
      return false;
    }
    return /^\d+$/.test(code);
  }

  // 格式化房间码显示 (每3位添加空格)
  static formatRoomCode(code: string): string {
    if (!code) return '';
    return code.replace(/(\d{3})(?=\d)/g, '$1 ');
  }

  // 生成带前缀的房间码
  static generatePrefixedRoomCode(prefix: 'S' | 'C'): string {
    const code = this.generateRoomCode();
    return `${prefix}${code}`;
  }

  // 解析房间码
  static parseRoomCode(fullCode: string): { type: 'session' | 'campaign', code: string } | null {
    if (!fullCode || fullCode.length !== 7) {
      return null;
    }

    const prefix = fullCode.charAt(0);
    const code = fullCode.substring(1);

    if (prefix === 'S' && this.isValidRoomCode(code)) {
      return { type: 'session', code };
    } else if (prefix === 'C' && this.isValidRoomCode(code)) {
      return { type: 'campaign', code };
    }

    return null;
  }

  // 检查房间码是否已存在
  static isRoomCodeExists(code: string, existingCodes: string[]): boolean {
    return existingCodes.includes(code);
  }

  // 生成唯一房间码
  static generateUniqueRoomCode(prefix: 'S' | 'C', existingCodes: string[]): string {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const code = this.generatePrefixedRoomCode(prefix);
      if (!this.isRoomCodeExists(code, existingCodes)) {
        return code;
      }
      attempts++;
    }

    // 如果生成失败，返回带时间戳的代码
    const timestamp = Date.now().toString().slice(-3);
    return `${prefix}${timestamp}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }
} 