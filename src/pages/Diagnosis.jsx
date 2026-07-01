import { useState } from 'react';
import { ArrowRight, RefreshCcw } from 'lucide-react';
import './Diagnosis.css';

const questions = [
  { id: 1, text: 'お酒はかなり強い方だ。', type: 'alcohol' },
  { id: 2, text: '飲み会では食べるより飲む・話すのがメインだ。', type: 'food' },
  { id: 3, text: '甘いお酒やカクテルより、ビールや焼酎が好きだ。', type: 'taste' },
  { id: 4, text: '大人数でワイワイ飲むのが好きだ。', type: 'mood' },
  { id: 5, text: '炭水化物（ピザやご飯もの）は絶対欲しい。', type: 'food_heavy' },
];

export default function Diagnosis() {
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (qId, value) => {
    setAnswers({ ...answers, [qId]: value });
  };

  const isComplete = Object.keys(answers).length === questions.length;

  const handleSubmit = () => {
    setShowResult(true);
    window.scrollTo(0, 0);
  };

  const reset = () => {
    setAnswers({});
    setShowResult(false);
    window.scrollTo(0, 0);
  };

  if (showResult) {
    return (
      <div className="page-container result-page">
        <div className="result-header">
          <h2 className="result-subtitle">あなたの宴会タイプは...</h2>
          <h1 className="result-title type-color-green">「酒豪-A」</h1>
          <p className="result-tagline">底なしの胃袋を持つ宴の特攻隊長</p>
        </div>

        <div className="mbti-card character-card">
          {/* Placeholder for character illustration in a real MBTI site */}
          <div className="character-placeholder type-bg-green">
            <span>🍻</span>
          </div>
          <p className="type-description">
            あなたはお酒に非常に強く、場を盛り上げるのが得意です。甘いお酒よりビールやストロング系を好み、食べ物はつまみ程度で十分。宴会には欠かせない存在です。
          </p>
        </div>

        <div className="mbti-card stats-card">
          <h3 className="stats-title">特性パラメーター</h3>
          
          <div className="stat-row">
            <div className="stat-labels">
              <span>アルコール耐性</span>
              <span className="stat-value">90%</span>
            </div>
            <div className="stat-bar-bg"><div className="stat-bar type-bg-green" style={{width: '90%'}}></div></div>
          </div>
          
          <div className="stat-row">
            <div className="stat-labels">
              <span>食欲</span>
              <span className="stat-value">30%</span>
            </div>
            <div className="stat-bar-bg"><div className="stat-bar type-bg-purple" style={{width: '30%'}}></div></div>
          </div>

          <div className="stat-row">
            <div className="stat-labels">
              <span>ワイワイ度</span>
              <span className="stat-value">85%</span>
            </div>
            <div className="stat-bar-bg"><div className="stat-bar type-bg-yellow" style={{width: '85%'}}></div></div>
          </div>
        </div>

        <button className="btn-secondary mt-4" onClick={reset}>
          <RefreshCcw size={18} />
          もう一度診断する
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="diagnosis-header">
        <h2>宴会タイプ診断</h2>
        <p className="text-muted">あなたの好みを入力して、タイプを見つけよう</p>
      </div>

      <div className="questions-container">
        {questions.map((q, index) => (
          <div key={q.id} className="mbti-card question-card">
            <h3 className="question-text">{q.text}</h3>
            
            <div className="scale-container">
              <span className="scale-label agree">同意する</span>
              <div className="scale-options">
                {[3, 2, 1, 0, -1, -2, -3].map((val) => {
                  const isSelected = answers[q.id] === val;
                  const sizeClass = Math.abs(val) === 3 ? 'size-lg' : Math.abs(val) === 2 ? 'size-md' : Math.abs(val) === 1 ? 'size-sm' : 'size-xs';
                  const colorClass = val > 0 ? 'color-agree' : val < 0 ? 'color-disagree' : 'color-neutral';
                  
                  return (
                    <button
                      key={val}
                      className={`scale-btn ${sizeClass} ${colorClass} ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelect(q.id, val)}
                      aria-label={`選択値: ${val}`}
                    />
                  );
                })}
              </div>
              <span className="scale-label disagree">同意しない</span>
            </div>
          </div>
        ))}
      </div>

      <button 
        className="btn-primary mt-4" 
        onClick={handleSubmit}
        disabled={!isComplete}
        style={{ opacity: isComplete ? 1 : 0.5 }}
      >
        結果を見る
        <ArrowRight size={20} />
      </button>
    </div>
  );
}
