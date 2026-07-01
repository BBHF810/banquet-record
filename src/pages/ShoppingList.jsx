import { useState } from 'react';
import { ShoppingBag, Plus, MessageCircle, AlertTriangle } from 'lucide-react';
import './ShoppingList.css';

const initialItems = [
  { id: 1, name: 'ビール・発泡酒', qty: '12本', category: 'alcohol', checked: false },
  { id: 2, name: 'レモンサワー', qty: '6本', category: 'alcohol', checked: false },
  { id: 3, name: 'ピザ（Lサイズ）', qty: '2枚', category: 'food', checked: false },
  { id: 4, name: 'スナック菓子', qty: '4袋', category: 'food', checked: false },
  { id: 5, name: 'ウーロン茶', qty: '2L × 1本', category: 'drink', checked: false },
];

const mockRequests = [
  { id: 1, user: 'サトミ', text: 'カシスオレンジ飲みたいです！' },
];

export default function ShoppingList() {
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState('');

  const toggleCheck = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleAddRequest = () => {
    if (newItem.trim() === '') return;
    setItems([...items, { id: Date.now(), name: newItem, qty: '追加リクエスト', category: 'other', checked: false }]);
    setNewItem('');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>買い出しリスト</h2>
        <p className="text-muted">スーパーで見ながらチェック！</p>
      </div>

      {/* Allergy Alert */}
      <div className="allergy-alert fade-in">
        <AlertTriangle size={20} className="alert-icon" />
        <div className="alert-text">
          <strong>アレルギー注意:</strong> ケンジさんが「エビ・カニ」アレルギーです。
        </div>
      </div>

      <div className="mbti-card shopping-card">
        <div className="card-header">
          <ShoppingBag className="text-accent-primary" size={20} />
          <h3>購入リスト</h3>
        </div>

        <ul className="todo-list">
          {items.map(item => (
            <li key={item.id} className={`todo-item ${item.checked ? 'checked' : ''}`} onClick={() => toggleCheck(item.id)}>
              <div className="checkbox">
                {item.checked && <div className="check-mark"></div>}
              </div>
              <div className="todo-content">
                <span className="todo-name">{item.name}</span>
                <span className="todo-qty">{item.qty}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mbti-card request-card mt-4">
        <div className="card-header">
          <MessageCircle className="text-type-green" size={20} />
          <h3>参加者からのリクエスト</h3>
        </div>
        
        <ul className="request-list">
          {mockRequests.map(req => (
            <li key={req.id} className="request-item">
              <span className="request-user">{req.user}:</span>
              <span className="request-text">{req.text}</span>
            </li>
          ))}
        </ul>

        <div className="add-request-form">
          <input 
            type="text" 
            placeholder="欲しいものをリクエスト..." 
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <button className="btn-icon-primary" onClick={handleAddRequest}>
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
