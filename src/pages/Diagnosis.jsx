import { useState } from 'react';
import { ArrowRight, RefreshCcw } from 'lucide-react';
import './Diagnosis.css';

/* ── 質問定義 ── */
const questions = [
  { id: 1, text: 'お酒はかなり強い方だ。', axis: 'alcohol' },
  { id: 2, text: '飲み会では食べるより飲む・話すのがメインだ。', axis: 'food_neg' },
  { id: 3, text: '甘いお酒やカクテルより、ビールや焼酎が好きだ。', axis: 'strong_taste' },
  { id: 4, text: '大人数でワイワイ飲むのが好きだ。', axis: 'social' },
  { id: 5, text: '炭水化物（ピザやご飯もの）は絶対欲しい。', axis: 'carb' },
  { id: 6, text: 'ノンアルコールでも全然楽しめる。', axis: 'sober' },
  { id: 7, text: '体に良いもの・ヘルシーな食事を好む。', axis: 'healthy' },
  { id: 8, text: '気づいたらずっと食べ続けている。', axis: 'big_eater' },
];

/* ── タイプ定義 ── */
const typeDefinitions = {
  shugou_a: {
    name: '酒豪-A',
    tagline: '底なしの胃袋を持つ宴の特攻隊長',
    emoji: '🍻',
    colorClass: 'green',
    description: 'あなたはお酒に非常に強く、場を盛り上げるのが得意です。甘いお酒よりビールやストロング系を好み、食べ物はつまみ程度で十分。宴会には欠かせない存在です。',
    stats: { alcohol: 90, appetite: 30, social: 85 },
  },
  bakushoku_f: {
    name: '爆食-F',
    tagline: 'とにかく食べる！腹ペコファイター',
    emoji: '🍕',
    colorClass: 'yellow',
    description: '飲みよりも食べることに全力なあなた。ピザ、唐揚げ、ご飯ものが揃っていないと満足できません。宴会の「食」を支えるなくてはならない存在です。',
    stats: { alcohol: 40, appetite: 95, social: 70 },
  },
  shoshoku_a: {
    name: '小食-A',
    tagline: 'お酒は嗜む程度、少量で満たされる上品派',
    emoji: '🍷',
    colorClass: 'purple',
    description: '少量のお酒と軽いおつまみで十分満足するタイプです。上品に場の空気を楽しみ、無理に飲まされるのは苦手。質を重視するグルメな一面もあります。',
    stats: { alcohol: 55, appetite: 25, social: 50 },
  },
  kenkou_f: {
    name: '健康生命体-F',
    tagline: '体が資本！ヘルシー志向の賢者',
    emoji: '🥗',
    colorClass: 'blue',
    description: 'お酒は控えめかノンアルコール派で、食事はヘルシー志向。サラダやフルーツがあると嬉しいタイプです。翌日の体調まで考えるしっかり者です。',
    stats: { alcohol: 20, appetite: 50, social: 60 },
  },
  boin_boshoku_a: {
    name: '暴飲暴食-A',
    tagline: '飲んで食べて！全力で楽しむ宴会王',
    emoji: '🎉',
    colorClass: 'yellow',
    description: 'お酒も食事もどちらもガンガンいきたいタイプです。飲みながら食べ、食べながら飲む。テーブルの上の料理はあなたの手にかかればあっという間になくなります。',
    stats: { alcohol: 85, appetite: 90, social: 80 },
  },
  nonbiri_b: {
    name: 'のんびり-B',
    tagline: 'マイペースに楽しむ癒し系',
    emoji: '☕',
    colorClass: 'blue',
    description: 'お酒はあまり飲まず、少人数でゆったりと過ごすのが好きなタイプ。ノンアルでも全く問題なし。場の空気を和ませる癒しの存在です。',
    stats: { alcohol: 15, appetite: 45, social: 30 },
  },
};

/* ── 診断ロジック ── */
function diagnose(answers) {
  // スコアの算出（各質問の回答は -3 ~ +3）
  const score = {
    alcohol: (answers[1] || 0) + (answers[3] || 0) - (answers[6] || 0),
    appetite: -(answers[2] || 0) + (answers[5] || 0) + (answers[8] || 0),
    social: (answers[4] || 0),
    healthy: (answers[7] || 0) + (answers[6] || 0),
  };

  const drinkStrong = score.alcohol > 2;
  const drinkWeak = score.alcohol < -2;
  const eatBig = score.appetite > 2;
  const eatSmall = score.appetite < -2;
  const isHealthy = score.healthy > 2;

  if (drinkStrong && eatBig) return typeDefinitions.boin_boshoku_a;
  if (drinkStrong && !eatBig) return typeDefinitions.shugou_a;
  if (eatBig && !drinkStrong) return typeDefinitions.bakushoku_f;
  if (isHealthy) return typeDefinitions.kenkou_f;
  if (drinkWeak && eatSmall) return typeDefinitions.nonbiri_b;
  if (eatSmall || drinkWeak) return typeDefinitions.shoshoku_a;

  // デフォルト：中間はバランス型として健康生命体に
  return typeDefinitions.kenkou_f;
}

/* ── コンポーネント ── */
export default function Diagnosis() {
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [resultType, setResultType] = useState(null);

  const handleSelect = (qId, value) => {
    setAnswers({ ...answers, [qId]: value });
  };

  const isComplete = Object.keys(answers).length === questions.length;

  const handleSubmit = () => {
    const type = diagnose(answers);
    setResultType(type);
    setShowResult(true);
    window.scrollTo(0, 0);
  };

  const reset = () => {
    setAnswers({});
    setShowResult(false);
    setResultType(null);
    window.scrollTo(0, 0);
  };

  if (showResult && resultType) {
    const colorVar = `var(--type-${resultType.colorClass})`;
    return (
      <div className="page-container result-page">
        <div className="result-header">
          <h2 className="result-subtitle">あなたの宴会タイプは...</h2>
          <h1 className="result-title" style={{ color: colorVar }}>
            「{resultType.name}」
          </h1>
          <p className="result-tagline">{resultType.tagline}</p>
        </div>

        <div className="mbti-card character-card">
          <div
            className="character-placeholder"
            style={{ backgroundColor: colorVar, boxShadow: `0 10px 25px ${colorVar}40` }}
          >
            <span>{resultType.emoji}</span>
          </div>
          <p className="type-description">{resultType.description}</p>
        </div>

        <div className="mbti-card stats-card">
          <h3 className="stats-title">特性パラメーター</h3>

          <div className="stat-row">
            <div className="stat-labels">
              <span>アルコール耐性</span>
              <span className="stat-value">{resultType.stats.alcohol}%</span>
            </div>
            <div className="stat-bar-bg">
              <div className="stat-bar type-bg-green" style={{ width: `${resultType.stats.alcohol}%` }}></div>
            </div>
          </div>

          <div className="stat-row">
            <div className="stat-labels">
              <span>食欲</span>
              <span className="stat-value">{resultType.stats.appetite}%</span>
            </div>
            <div className="stat-bar-bg">
              <div className="stat-bar type-bg-yellow" style={{ width: `${resultType.stats.appetite}%` }}></div>
            </div>
          </div>

          <div className="stat-row">
            <div className="stat-labels">
              <span>ワイワイ度</span>
              <span className="stat-value">{resultType.stats.social}%</span>
            </div>
            <div className="stat-bar-bg">
              <div className="stat-bar type-bg-purple" style={{ width: `${resultType.stats.social}%` }}></div>
            </div>
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
        {questions.map((q) => (
          <div key={q.id} className="mbti-card question-card">
            <h3 className="question-text">{q.text}</h3>

            <div className="scale-container">
              <span className="scale-label agree">同意する</span>
              <div className="scale-options">
                {[3, 2, 1, 0, -1, -2, -3].map((val) => {
                  const isSelected = answers[q.id] === val;
                  const sizeClass =
                    Math.abs(val) === 3 ? 'size-lg' : Math.abs(val) === 2 ? 'size-md' : Math.abs(val) === 1 ? 'size-sm' : 'size-xs';
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
