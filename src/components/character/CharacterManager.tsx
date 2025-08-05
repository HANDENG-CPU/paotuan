import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Character, CharacterAttributes, CharacterSkill, Equipment } from '../../types';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import './CharacterManager.css';

interface CharacterManagerProps {
  currentUser: User;
  characters: Character[];
  onUpdateCharacters: (characters: Character[]) => void;
}

const CharacterManager: React.FC<CharacterManagerProps> = ({
  currentUser,
  characters,
  onUpdateCharacters,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    race: '',
    class: '',
    level: 1,
    background: '',
    attributes: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    } as CharacterAttributes,
    skills: [] as CharacterSkill[],
    equipment: [] as Equipment[]
  });

  const userCharacters = characters.filter(c => c.id.includes(currentUser.id));

  const createCharacter = () => {
    if (!newCharacter.name.trim()) return;

    const character: Character = {
      id: `${currentUser.id}_${Date.now()}`,
      name: newCharacter.name,
      race: newCharacter.race,
      class: newCharacter.class,
      level: newCharacter.level,
      attributes: newCharacter.attributes,
      skills: newCharacter.skills,
      equipment: newCharacter.equipment,
      background: newCharacter.background,
      ownerId: currentUser.id,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedCharacters = [...characters, character];
    onUpdateCharacters(updatedCharacters);
    setShowCreateForm(false);
    resetForm();
  };

  const updateCharacter = () => {
    if (!editingCharacter || !newCharacter.name.trim()) return;

    const updatedCharacter = {
      ...editingCharacter,
      name: newCharacter.name,
      race: newCharacter.race,
      class: newCharacter.class,
      level: newCharacter.level,
      attributes: newCharacter.attributes,
      skills: newCharacter.skills,
      equipment: newCharacter.equipment,
      background: newCharacter.background,
      updatedAt: new Date()
    };

    const updatedCharacters = characters.map(c => 
      c.id === editingCharacter.id ? updatedCharacter : c
    );
    onUpdateCharacters(updatedCharacters);
    setEditingCharacter(null);
    resetForm();
  };

  const deleteCharacter = (characterId: string) => {
    if (window.confirm('确定要删除这个角色吗？此操作不可撤销。')) {
      const updatedCharacters = characters.filter(c => c.id !== characterId);
      onUpdateCharacters(updatedCharacters);
    }
  };

  const startEditing = (character: Character) => {
    setEditingCharacter(character);
    setNewCharacter({
      name: character.name,
      race: character.race || '',
      class: character.class || '',
      level: character.level,
      background: character.background || '',
      attributes: character.attributes,
      skills: character.skills,
      equipment: character.equipment
    });
  };

  const resetForm = () => {
    setNewCharacter({
      name: '',
      race: '',
      class: '',
      level: 1,
      background: '',
      attributes: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      skills: [],
      equipment: []
    });
  };

  const getModifier = (value: number) => {
    return Math.floor((value - 10) / 2);
  };

  const getModifierString = (value: number) => {
    const modifier = getModifier(value);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <div className="character-manager">
      <header className="character-header">
        <Link to="/" className="back-btn">
          <ArrowLeft size={20} />
          返回主页
        </Link>
        <h1>👤 角色管理</h1>
        <button 
          className="create-character-btn"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus size={20} />
          创建角色
        </button>
      </header>

      <main className="character-main">
        {(showCreateForm || editingCharacter) && (
          <div className="character-form">
            <div className="form-header">
              <h2>{editingCharacter ? '编辑角色' : '创建新角色'}</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingCharacter(null);
                  resetForm();
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-content">
              <div className="form-section">
                <h3>基本信息</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>角色名称</label>
                    <input
                      type="text"
                      value={newCharacter.name}
                      onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                      placeholder="输入角色名称"
                    />
                  </div>
                  <div className="form-group">
                    <label>种族</label>
                    <input
                      type="text"
                      value={newCharacter.race}
                      onChange={(e) => setNewCharacter({...newCharacter, race: e.target.value})}
                      placeholder="例如：人类、精灵、矮人"
                    />
                  </div>
                  <div className="form-group">
                    <label>职业</label>
                    <input
                      type="text"
                      value={newCharacter.class}
                      onChange={(e) => setNewCharacter({...newCharacter, class: e.target.value})}
                      placeholder="例如：战士、法师、盗贼"
                    />
                  </div>
                  <div className="form-group">
                    <label>等级</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={newCharacter.level}
                      onChange={(e) => setNewCharacter({...newCharacter, level: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>属性值</h3>
                <div className="attributes-grid">
                  {Object.entries(newCharacter.attributes).map(([attr, value]) => (
                    <div key={attr} className="attribute-group">
                      <label>{attr.toUpperCase()}</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={value}
                        onChange={(e) => setNewCharacter({
                          ...newCharacter,
                          attributes: {
                            ...newCharacter.attributes,
                            [attr]: parseInt(e.target.value) || 1
                          }
                        })}
                      />
                      <span className="modifier">{getModifierString(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h3>背景故事</h3>
                <textarea
                  value={newCharacter.background}
                  onChange={(e) => setNewCharacter({...newCharacter, background: e.target.value})}
                  placeholder="描述角色的背景故事..."
                  rows={4}
                />
              </div>

              <div className="form-actions">
                <button 
                  onClick={editingCharacter ? updateCharacter : createCharacter}
                  className="btn-primary"
                >
                  <Save size={16} />
                  {editingCharacter ? '保存修改' : '创建角色'}
                </button>
                <button 
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingCharacter(null);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="characters-list">
          <h2>我的角色</h2>
          {userCharacters.length > 0 ? (
            <div className="characters-grid">
              {userCharacters.map(character => (
                <div key={character.id} className="character-card">
                  <div className="character-header">
                    <div className="character-avatar">
                      {character.name.charAt(0)}
                    </div>
                    <div className="character-info">
                      <h3>{character.name}</h3>
                      <p>等级 {character.level} {character.race} {character.class}</p>
                    </div>
                    <div className="character-actions">
                      <button 
                        onClick={() => startEditing(character)}
                        className="edit-btn"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => deleteCharacter(character.id)}
                        className="delete-btn"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="character-details">
                    <div className="attributes-summary">
                      <div className="attribute-item">
                        <span className="attr-label">STR</span>
                        <span className="attr-value">{character.attributes.strength}</span>
                        <span className="attr-modifier">{getModifierString(character.attributes.strength)}</span>
                      </div>
                      <div className="attribute-item">
                        <span className="attr-label">DEX</span>
                        <span className="attr-value">{character.attributes.dexterity}</span>
                        <span className="attr-modifier">{getModifierString(character.attributes.dexterity)}</span>
                      </div>
                      <div className="attribute-item">
                        <span className="attr-label">CON</span>
                        <span className="attr-value">{character.attributes.constitution}</span>
                        <span className="attr-modifier">{getModifierString(character.attributes.constitution)}</span>
                      </div>
                      <div className="attribute-item">
                        <span className="attr-label">INT</span>
                        <span className="attr-value">{character.attributes.intelligence}</span>
                        <span className="attr-modifier">{getModifierString(character.attributes.intelligence)}</span>
                      </div>
                      <div className="attribute-item">
                        <span className="attr-label">WIS</span>
                        <span className="attr-value">{character.attributes.wisdom}</span>
                        <span className="attr-modifier">{getModifierString(character.attributes.wisdom)}</span>
                      </div>
                      <div className="attribute-item">
                        <span className="attr-label">CHA</span>
                        <span className="attr-value">{character.attributes.charisma}</span>
                        <span className="attr-modifier">{getModifierString(character.attributes.charisma)}</span>
                      </div>
                    </div>

                    {character.background && (
                      <div className="character-background">
                        <h4>背景故事</h4>
                        <p>{character.background}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>还没有创建角色</p>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="create-btn"
              >
                <Plus size={16} />
                创建第一个角色
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CharacterManager; 