import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, MessageCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { calculateShoppingList } from '../utils/banquetUtils';
import './ShoppingList.css';

export default function ShoppingList() {
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newRequestText, setNewRequestText] = useState('');
  const [requestUser, setRequestUser] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [toast, setToast] = useState('');

  // データの初期ロード
  useEffect(() => {
    // 1. アレルギーの抽出
    const savedParticipants = localStorage.getItem('banquetParticipants');
    if (savedParticipants) {
      try {
        const parts = JSON.parse(savedParticipants);
        const allergyList = parts
          .filter(p => p.allergies && p.allergies.trim())
          .map(p => `${p.name}さん (${p.allergies})`);
        setAllergies(allergyList);
      } catch {
        setAllergies([]);
      }
    }

    // 2. 買い出しリストのロード
    const savedItems = localStorage.getItem('shoppingListItems');
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch {
        setItems([]);
      }
    } else {
      // 登録済みの参加者があるなら初期ロード時に仮計算して表示する
      const savedParts = localStorage.getItem('banquetParticipants');
      if (savedParts) {
        try {
          const parts = JSON.parse(savedParts);
          const result = calculateShoppingList(parts);
          setItems(result.items);
          localStorage.setItem('shoppingListItems', JSON.stringify(result.items));
        } catch {
          setItems([]);
        }
      }
    }

    // 3. リクエストのロード
    const savedRequests = localStorage.getItem('banquetRequests');
    if (savedRequests) {
      try {
        setRequests(JSON.parse(savedRequests));
      } catch {
        setRequests([]);
      }
    } else {
      const defaultRequests = [{ id: 1, user: 'サトミ', text: 'カシスオレンジ飲みたいです！' }];
      setRequests(defaultRequests);
      localStorage.setItem('banquetRequests', JSON.stringify(defaultRequests));
    }
  }, []);

  // チェック切り替え
  const toggleCheck = (id) => {
    const updated = items.map(item => item.id === id ? { ...item, checked: !item.checked } : item);
    setItems(updated);
    localStorage.setItem('shoppingListItems', JSON.stringify(updated));
  };

  // 手動で買い物アイテムを追加
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem = {
      id: Date.now(),
      name: newItemName.trim(),
      qty: newItemQty.trim() || '適量',
      category: 'other',
      checked: false
    };

    const updated = [...items, newItem];
    setItems(updated);
    localStorage.setItem('shoppingListItems', JSON.stringify(updated));

    setNewItemName('');
    setNewItemQty('');
    showToast('買い物リストに追加しました');
  };

  // 買い物アイテムの削除
  const handleRemoveItem = (id, e) => {
    e.stopPropagation(); // チェック切り替えを防止
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    localStorage.setItem('shoppingListItems', JSON.stringify(updated));
  };

  // リクエスト送信 (買い物リストにも自動連動)
  const handleAddRequest = (e) => {
    e.preventDefault();
    if (!newRequestText.trim() || !requestUser.trim()) return;

    const newRequest = {
      id: Date.now(),
      user: requestUser.trim(),
      text: newRequestText.trim()
    };

    // リクエストの保存
    const updatedRequests = [...requests, newRequest];
    setRequests(updatedRequests);
    localStorage.setItem('banquetRequests', JSON.stringify(updatedRequests));

    // 買い物リストへの自動追加
    const linkedItem = {
      id: Date.now() + 1,
      name: `${newRequestText.trim()} (${requestUser.trim()}の希望)`,
      qty: 'リクエスト',
      category: 'other',
      checked: false
    };
    const updatedItems = [...items, linkedItem];
    setItems(updatedItems);
    localStorage.setItem('shoppingListItems', JSON.stringify(updatedItems));

    // フォームリセット
    setNewRequestText('');
    setRequestUser('');
    showToast('リクエストを送信し、買い物リストに反映しました！');
  };

  // リクエストの削除
  const handleRemoveRequest = (id) => {
    const updated = requests.filter(r => r.id !== id);
    setRequests(updated);
    localStorage.setItem('banquetRequests', JSON.stringify(updated));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>買い出しリスト</h2>
        <p className="text-muted">スーパーで見ながらチェック！幹事ページでリストを生成できます。</p>
      </div>

      {/* アレルギー警告（動的） */}
      {allergies.length > 0 && (
        <div className="allergy-alert fade-in">
          <AlertTriangle size={20} className="alert-icon" />
          <div className="alert-text">
            <strong>アレルギー注意:</strong> {allergies.join(', ')} があります。購入商品の原材料を確認してください。
          </div>
        </div>
      )}

      {/* 買い物リスト本体 */}
      <div className="mbti-card shopping-card">
        <div className="card-header">
          <ShoppingBag className="text-accent-primary" size={20} />
          <h3>購入リスト ({items.filter(i => i.checked).length} / {items.length})</h3>
        </div>

        <ul className="todo-list">
          {items.map(item => (
            <li 
              key={item.id} 
              className={`todo-item ${item.checked ? 'checked' : ''}`} 
              onClick={() => toggleCheck(item.id)}
            >
              <div className="checkbox">
                {item.checked && <div className="check-mark"></div>}
              </div>
              <div className="todo-content">
                <span className="todo-name">{item.name}</span>
                <span className="todo-qty">{item.qty}</span>
              </div>
              <button 
                className="btn-icon-danger" 
                onClick={(e) => handleRemoveItem(item.id, e)}
                aria-label="削除"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
          {items.length === 0 && (
            <p className="text-muted text-center py-4">リストが空です。幹事メニューで「プラン自動生成」を押すか、以下から直接追加してください。</p>
          )}
        </ul>

        {/* リスト直接追加フォーム */}
        <form onSubmit={handleAddItem} className="add-item-inline mt-3">
          <input 
            type="text" 
            placeholder="品名 (例: 割り箸)" 
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            required
          />
          <input 
            type="text" 
            placeholder="数量" 
            style={{ maxWidth: '80px' }}
            value={newItemQty}
            onChange={(e) => setNewItemQty(e.target.value)}
          />
          <button type="submit" className="btn-icon-primary">
            <Plus size={20} />
          </button>
        </form>
      </div>

      {/* 参加者のリクエストフォーム & リスト表示 */}
      <div className="mbti-card request-card mt-4">
        <div className="card-header">
          <MessageCircle className="text-type-green" size={20} />
          <h3>参加者からの追加リクエスト</h3>
        </div>
        
        <ul className="request-list">
          {requests.map(req => (
            <li key={req.id} className="request-item">
              <div className="request-body">
                <span className="request-user">{req.user}:</span>
                <span className="request-text">{req.text}</span>
              </div>
              <button 
                className="btn-icon-danger" 
                onClick={() => handleRemoveRequest(req.id)}
                aria-label="削除"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={handleAddRequest} className="add-request-form-brushed mt-3">
          <div className="request-inputs">
            <input 
              type="text" 
              placeholder="あなたの名前" 
              style={{ maxWidth: '120px' }}
              value={requestUser}
              onChange={(e) => setRequestUser(e.target.value)}
              required
            />
            <input 
              type="text" 
              placeholder="欲しいものをリクエスト..." 
              value={newRequestText}
              onChange={(e) => setNewRequestText(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary mt-2">
            <Plus size={18} /> 買い物リストへ追加
          </button>
        </form>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
