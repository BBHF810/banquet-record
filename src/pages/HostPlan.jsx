import { useState } from 'react';
import { Users, Calculator, Sparkles, Plus, Receipt } from 'lucide-react';
import './HostPlan.css';

const mockParticipants = [
  { id: 1, name: 'タカシ', type: '酒豪-A' },
  { id: 2, name: 'ケンジ', type: '爆食-F' },
  { id: 3, name: 'サトミ', type: '小食-A' },
  { id: 4, name: 'ユウキ', type: '健康生命体-F' },
];

export default function HostPlan() {
  const [totalCost, setTotalCost] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState(false);

  const calculatePerPerson = () => {
    if (!totalCost || isNaN(totalCost)) return 0;
    return Math.ceil(parseInt(totalCost) / mockParticipants.length);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>幹事メニュー</h2>
        <p className="text-muted">参加者データから最適なプランを作成</p>
      </div>

      <div className="mbti-card">
        <div className="card-header">
          <Users className="text-accent-primary" size={20} />
          <h3>現在の参加者 ({mockParticipants.length}人)</h3>
        </div>
        <ul className="participant-list">
          {mockParticipants.map(p => (
            <li key={p.id} className="participant-item">
              <span className="participant-name">{p.name}</span>
              <span className="participant-type type-color-green">{p.type}</span>
            </li>
          ))}
        </ul>
        <button className="btn-secondary w-full mt-3">
          <Plus size={16} /> 参加者を追加（リンク共有）
        </button>
      </div>

      {!generatedPlan ? (
        <button className="btn-primary" onClick={() => setGeneratedPlan(true)}>
          <Sparkles size={20} />
          買い出しプランを自動生成
        </button>
      ) : (
        <div className="plan-result fade-in">
          <div className="mbti-card highlight-border">
            <h3 className="plan-title">
              <Sparkles size={18} className="text-accent-yellow" />
              AI買い出しプラン
            </h3>
            <p className="plan-summary">
              「酒豪-A」が多いため、<strong>アルコール類は多め（一人当たり3〜4杯目安）</strong>が推奨されます。また、「爆食-F」向けに<strong>お腹にたまる炭水化物（ピザ等）を2〜3人前</strong>追加すると満足度が高まります。
            </p>
            <p className="plan-hint text-muted">※詳細は「リスト」タブで確認・追加できます。</p>
          </div>

          <div className="mbti-card mt-4">
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
            <button className="btn-primary mt-3" disabled={!totalCost}>
              参加者に請求を送る
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
