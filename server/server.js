const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 中间件
app.use(cors());
app.use(express.json());

// 数据库初始化
const db = new sqlite3.Database('./rpg_platform.db');

// 创建表
db.serialize(() => {
  // 用户表
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  )`);

  // 游戏会话表
  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    game_system TEXT,
    gm_id TEXT,
    status TEXT DEFAULT 'preparing',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gm_id) REFERENCES users (id)
  )`);

  // 会话玩家表
  db.run(`CREATE TABLE IF NOT EXISTS session_players (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    user_id TEXT,
    is_gm BOOLEAN DEFAULT 0,
    is_online BOOLEAN DEFAULT 1,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // 聊天消息表
  db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    user_id TEXT,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // 骰子记录表
  db.run(`CREATE TABLE IF NOT EXISTS dice_rolls (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    user_id TEXT,
    notation TEXT NOT NULL,
    result INTEGER NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

// 认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// 路由

// 用户注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // 检查用户是否已存在
    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (row) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      // 创建新用户
      const userId = uuidv4();
      const passwordHash = await bcrypt.hash(password, 10);

      db.run(
        'INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)',
        [userId, username, passwordHash],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }

          // 生成JWT token
          const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '7d' });

          res.json({
            user: { id: userId, username },
            token
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 用户登录
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, row.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 更新最后登录时间
    db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [row.id]);

    // 生成JWT token
    const token = jwt.sign({ id: row.id, username: row.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: { id: row.id, username: row.username },
      token
    });
  });
});

// 获取用户信息
app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get('SELECT id, username, created_at, last_login FROM users WHERE id = ?', [req.user.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: row });
  });
});

// 获取游戏会话
app.get('/api/sessions', authenticateToken, (req, res) => {
  db.all(`
    SELECT s.*, 
           COUNT(sp.user_id) as player_count,
           u.username as gm_name
    FROM sessions s
    LEFT JOIN session_players sp ON s.id = sp.session_id
    LEFT JOIN users u ON s.gm_id = u.id
    GROUP BY s.id
    ORDER BY s.updated_at DESC
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ sessions: rows });
  });
});

// 创建游戏会话
app.post('/api/sessions', authenticateToken, (req, res) => {
  const { name, description, gameSystem } = req.body;
  const sessionId = uuidv4();

  db.run(
    'INSERT INTO sessions (id, name, description, game_system, gm_id) VALUES (?, ?, ?, ?, ?)',
    [sessionId, name, description, gameSystem, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create session' });
      }

      // 添加GM为玩家
      db.run(
        'INSERT INTO session_players (id, session_id, user_id, is_gm) VALUES (?, ?, ?, ?)',
        [uuidv4(), sessionId, req.user.id, 1]
      );

      res.json({ 
        session: { 
          id: sessionId, 
          name, 
          description, 
          gameSystem,
          gmId: req.user.id 
        } 
      });
    }
  );
});

// 加入游戏会话
app.post('/api/sessions/:sessionId/join', authenticateToken, (req, res) => {
  const { sessionId } = req.params;

  db.get('SELECT id FROM sessions WHERE id = ?', [sessionId], (err, session) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // 检查是否已经是玩家
    db.get('SELECT id FROM session_players WHERE session_id = ? AND user_id = ?', 
      [sessionId, req.user.id], (err, player) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (player) {
        return res.json({ message: 'Already in session' });
      }

      // 添加玩家
      db.run(
        'INSERT INTO session_players (id, session_id, user_id) VALUES (?, ?, ?)',
        [uuidv4(), sessionId, req.user.id],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to join session' });
          }

          res.json({ message: 'Joined session successfully' });
        }
      );
    });
  });
});

// 获取会话聊天消息
app.get('/api/sessions/:sessionId/messages', authenticateToken, (req, res) => {
  const { sessionId } = req.params;

  db.all(`
    SELECT cm.*, u.username
    FROM chat_messages cm
    JOIN users u ON cm.user_id = u.id
    WHERE cm.session_id = ?
    ORDER BY cm.created_at ASC
  `, [sessionId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ messages: rows });
  });
});

// 发送聊天消息
app.post('/api/sessions/:sessionId/messages', authenticateToken, (req, res) => {
  const { sessionId } = req.params;
  const { message, messageType = 'user' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  db.run(
    'INSERT INTO chat_messages (id, session_id, user_id, message, message_type) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), sessionId, req.user.id, message, messageType],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to send message' });
      }

      res.json({ message: 'Message sent successfully' });
    }
  );
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 