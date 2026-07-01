import { useState, useEffect } from 'react';
import { Users, Calculator, Sparkles, Plus, Trash2, Receipt, AlertCircle } from 'lucide-react';
import { typeDefinitions, initialParticipants, calculateShoppingList } from '../utils/banquetUtils';
import './HostPlan.css';

export default function HostPlan() {
  const [participants, setParticipants] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('FKIT');
  const [allergies, setAllergies] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [planSummary, setPlanSummary] = useState(null);
  const [toast, setToast] = useState('');

  // 参加者データのロード
  useEffect(() => {
    let currentParticipants = [];
    const saved = localStorage.getItem('banquetParticipants');
    if (saved) {
      try {
        currentParticipants = JSON.parse(saved);
      } catch {
        currentParticipants = initialParticipants;
      }
    } else {
      currentParticipants = initialParticipants;
    }

    // URLからのインポート確認
    const params = new URLSearchParams(window.location.search);
    const importData = params.get('import');
    if (importData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(importData))));
        if (decoded && decoded.name) {
          const exists = currentParticipants.some(p => p.name === decoded.name);
          if (!exists) {
            const newParticipant = {
              id: Date.now(),
              name: decoded.name,
              type: decoded.type || 'FKIT',
              allergies: decoded.allergies || ''
            };
            currentParticipants = [...currentParticipants, newParticipant];
            localStorage.setItem('banquetParticipants', JSON.stringify(currentParticipants));
            
            // トースト表示
            setToast(`${decoded.name}さんを自動追加しました！`);
            setTimeout(() => setToast(''), 2000);
          } else {
            setToast(`${decoded.name}さんはすでに追加されています`);
            setTimeout(() => setToast(''), 2000);
          }
        }
      } catch (e) {
        console.error('Import failed', e);
      }
      // クエリ文字列を消去してクリーンにする
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    setParticipants(currentParticipants);
    if (!saved) {
      localStorage.setItem('banquetParticipants', JSON.stringify(currentParticipants));
    }
  }, []);

  // 参加者の追加
  const handleAddParticipant = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newParticipant = {
      id: Date.now(),
      name: name.trim(),
      type,
      allergies: allergies.trim()
    };

    const updated = [...participants, newParticipant];
    setParticipants(updated);
    localStorage.setItem('banquetParticipants', JSON.stringify(updated));

    // フォームリセット
    setName('');
    setType('FKIT');
    setAllergies('');
    setShowAddForm(false);

    showToast('参加者を追加しました');
  };

  // 参加者の削除
  const handleRemoveParticipant = (id) => {
    const updated = participants.filter(p => p.id !== id);
    setParticipants(updated);
    localStorage.setItem('banquetParticipants', JSON.stringify(updated));
    showToast('参加者を削除しました');
  };

  // 買い出しプラン生成
  const handleGeneratePlan = () => {
    const result = calculateShoppingList(participants);
    localStorage.setItem('shoppingListItems', JSON.stringify(result.items));
    setPlanSummary(result.summary);
    showToast('買い出しリストを生成・更新しました！');
  };

  // 割り勘請求を送信
  const handleSendBill = async () => {
    if (!totalCost || isNaN(totalCost)) return;
    const perPerson = Math.ceil(parseInt(totalCost) / participants.length);
    const text = `【幹事より割り勘の請求】\n宅飲みお疲れ様でした！今回の精算連絡です。\n\n総額: ¥${parseInt(totalCost).toLocaleString()}\n人数: ${participants.length}人\n一人当たり: ¥${perPerson.toLocaleString()}\n\n支払いをよろしくお願いします！`;

    if (navigator.share) {
      try {
        await navigator.share({ title: '割り勘精算請求', text });
      } catch {
        // キャンセル時は何もしない
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        showToast('請求メッセージをクリップボードにコピーしました！');
      } catch {
        showToast('コピーに失敗しました');
      }
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const calculatePerPerson = () => {
    if (!totalCost || isNaN(totalCost) || participants.length === 0) return 0;
    return Math.ceil(parseInt(totalCost) / participants.length);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>幹事メニュー</h2>
        <p className="text-muted">参加者のタイプを合わせて自動で準備をサポート</p>
      </div>

      {/* 参加者管理 */}
      <div className="mbti-card">
        <div className="card-header justify-between">
          <div className="flex items-center gap-2">
            <Users className="text-accent-primary" size={20} />
            <h3>参加者リスト ({participants.length}人)</h3>
          </div>
          <button 
            className="btn-add-toggle" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '閉じる' : '追加'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddParticipant} className="add-participant-form fade-in">
            <div className="form-group">
              <label>名前</label>
              <input 
                type="text" 
                placeholder="例: サトミ" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>宴会タイプ</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {Object.entries(typeDefinitions).map(([code, def]) => (
                  <option key={code} value={code}>
                    {def.emoji} {def.name} ({code})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>アレルギー (任意)</label>
              <input 
                type="text" 
                placeholder="例: エビ・カニ、そば" 
                value={allergies} 
                onChange={(e) => setAllergies(e.target.value)} 
              />
            </div>
            <button type="submit" className="btn-primary mt-2">
              <Plus size={18} /> 追加する
            </button>
          </form>
        )}

        <ul className="participant-list mt-3">
          {participants.map(p => {
            const def = typeDefinitions[p.type] || { emoji: '👤', name: '未設定', colorClass: 'blue' };
            return (
              <li key={p.id} className="participant-item">
                <div className="participant-info">
                  <span className="participant-name">{p.name}</span>
                  <span className={`participant-type type-bg-${def.colorClass}`}>
                    {def.emoji} {def.name}
                  </span>
                  {p.allergies && (
                    <span className="participant-allergy-tag" title={p.allergies}>
                      ⚠️ {p.allergies}
                    </span>
                  )}
                </div>
                <button 
                  className="btn-icon-danger" 
                  onClick={() => handleRemoveParticipant(p.id)}
                  aria-label="削除"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })}
          {participants.length === 0 && (
            <p className="text-muted text-center py-4">参加者が登録されていません</p>
          )}
        </ul>
      </div>

      {/* 買い出しプラン生成ボタン */}
      <button className="btn-primary" onClick={handleGeneratePlan} disabled={participants.length === 0}>
        <Sparkles size={20} />
        買い出しプランを自動生成 / 更新
      </button>

      {/* 生成後のサマリー ＆ 割り勘計算 */}
      {planSummary && (
        <div className="plan-result fade-in">
          <div className="mbti-card highlight-border">
            <h3 className="plan-title">
              <Sparkles size={18} className="text-accent-yellow" />
              AI買い出しプラン分析
            </h3>
            <p className="plan-summary">
              {planSummary.peopleCount}名分の診断を元に分析しました。
              {planSummary.hasHeavyDrinkers ? ' お酒に強いメンバーが多いので、アルコールはしっかりめがおすすめです。' : ' お酒は控えめな傾向なので、ソフトドリンクの品揃えを重視しましょう。'}
              {planSummary.hasHeavyEaters ? ' 食べ盛りのメンバーがいるため、炭水化物（ピザ等）をしっかり用意すると喜ばれます。' : ' 食事は軽め・ヘルシーなつまみを好む傾向です。'}
            </p>
            <div className="alert-box mt-2">
              <AlertCircle size={16} />
              <span>「リスト」タブに具体的な数量の買い物リストを反映しました！</span>
            </div>
          </div>

          <div className="mbti-card">
            <div className="card-header">
              <Calculator className="text-accent-purple" size={20} />
              <h3>費用計算（割り勘）</h3>
            </div>
            <div className="calculator-form">
              <label className="input-label">買い出し総額 (円)</label>
              <div className="input-with-icon">
                <Receipt className="input-icon" size={18} />
                <input 
                  type="number" 
                  placeholder="例: 15000"
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                />
              </div>
              
              <div className="calc-result">
                <span>一人当たりの支払い額:</span>
                <span className="calc-amount">¥{calculatePerPerson().toLocaleString()}</span>
              </div>
            </div>
            <button className="btn-primary mt-3" onClick={handleSendBill} disabled={!totalCost || participants.length === 0}>
              請求メッセージを送る / コピー
            </button>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
