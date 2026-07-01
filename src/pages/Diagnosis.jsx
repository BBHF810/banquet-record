import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RefreshCcw, UserCheck } from 'lucide-react';
import './Diagnosis.css';

/* ══════════════════════════════════════════
   質問定義（4軸 × 3問 = 12問）
   
   ★ 印のついた質問は、タイプ診断と同時に
   宅飲み・新歓の買い出し準備にそのまま
   活用できる実用的な質問です。
   ══════════════════════════════════════════ */
const questions = [
  // ── 軸1: D(飲み派) vs F(食べ派) ──
  { id: 1,  text: '飲み会の主役はやっぱりお酒だと思う。',               axis: 'DF', direction: 1  },
  { id: 2,  text: '料理やおつまみが充実していないとテンションが下がる。', axis: 'DF', direction: -1, tag: 'food' },   // ★ 食事の充実度
  { id: 3,  text: 'ピザやおにぎりなどの炭水化物は飲み会に欠かせない。',   axis: 'DF', direction: -1, tag: 'carb' },   // ★ 炭水化物ニーズ

  // ── 軸2: G(ガッツリ) vs K(控えめ) ──
  { id: 4,  text: '一晩で3杯以上は確実に飲むと思う。',                   axis: 'GK', direction: 1,  tag: 'heavy' },  // ★ 飲酒量の目安
  { id: 5,  text: 'ソフトドリンクやノンアルの選択肢も欲しい。',           axis: 'GK', direction: -1, tag: 'soft' },   // ★ ノンアル・ソフドリ需要
  { id: 6,  text: '翌日に響かない程度にセーブして楽しみたい。',           axis: 'GK', direction: -1 },

  // ── 軸3: E(大人数) vs I(少人数) ──
  { id: 7,  text: '大人数でワイワイ盛り上がるのが好きだ。',               axis: 'EI', direction: 1  },
  { id: 8,  text: '途中で静かに抜けられる雰囲気だと助かる。',             axis: 'EI', direction: -1, tag: 'exit' },   // ★ 途中退出しやすさ
  { id: 9,  text: '気心知れた少人数の方が断然楽しめる。',                 axis: 'EI', direction: -1 },

  // ── 軸4: N(冒険) vs T(定番) ──
  { id: 10, text: '普段飲まないお酒やメニューにも挑戦したい。',           axis: 'NT', direction: 1  },
  { id: 11, text: 'ビール・チューハイなど定番があれば十分だ。',           axis: 'NT', direction: -1, tag: 'basic' },  // ★ 定番ドリンクで十分？
  { id: 12, text: '甘いお酒（カクテル・梅酒・果実酒）の方が好みだ。',     axis: 'NT', direction: 1,  tag: 'sweet' },  // ★ 甘いお酒の需要
];

/* ══════════════════════════════════════════
   軸の定義
   ══════════════════════════════════════════ */
const axisLabels = {
  DF: { posLabel: '飲み派', negLabel: '食べ派' },
  GK: { posLabel: 'ガッツリ', negLabel: '控えめ' },
  EI: { posLabel: '大人数', negLabel: '少人数' },
  NT: { posLabel: '冒険', negLabel: '定番' },
};

/* ══════════════════════════════════════════
   16タイプ定義 (4グループ × 4タイプ)
   ══════════════════════════════════════════ */
const typeDefinitions = {
  // ── DG グループ（飲み × ガッツリ）── 🟢 green
  DGEN: {
    name: '宴会キング', code: 'DGEN', group: 'DG', colorClass: 'green',
    emoji: '👑', tagline: '圧倒的カリスマで宴を支配する王',
    description: '大人数の場で新しいお酒にも果敢に挑戦する、宴会の中心人物。飲む量もテンションも桁違い。あなたがいれば場は必ず盛り上がります。',
    stats: { alcohol: 95, appetite: 30, social: 95, adventure: 90 },
  },
  DGET: {
    name: '飲み会番長', code: 'DGET', group: 'DG', colorClass: 'green',
    emoji: '🍺', tagline: 'いつもの店で底なしに飲む鉄人',
    description: '行きつけの居酒屋でビールを浴びるように飲む、ザ・飲兵衛。大人数の宴会を仕切るのも得意で、定番メニューへの信頼は絶大です。',
    stats: { alcohol: 95, appetite: 35, social: 85, adventure: 25 },
  },
  DGIN: {
    name: '探求の酒豪', code: 'DGIN', group: 'DG', colorClass: 'green',
    emoji: '🥃', tagline: '未知の銘酒を求めるストイックな求道者',
    description: '少人数でじっくりと、珍しいお酒を探求するタイプ。クラフトビールや日本酒の飲み比べが至福のとき。知識も舌も一級品です。',
    stats: { alcohol: 90, appetite: 25, social: 30, adventure: 95 },
  },
  DGIT: {
    name: '酒場の哲学者', code: 'DGIT', group: 'DG', colorClass: 'green',
    emoji: '🫗', tagline: 'カウンターで語り明かす夜の賢者',
    description: '馴染みのバーや居酒屋のカウンターで、少人数でしっぽり飲むのが好き。お気に入りの一杯を片手に、深い話をするのが至福です。',
    stats: { alcohol: 90, appetite: 20, social: 20, adventure: 20 },
  },

  // ── DK グループ（飲み × 控えめ）── 🟣 purple
  DKEN: {
    name: 'カクテル外交官', code: 'DKEN', group: 'DK', colorClass: 'purple',
    emoji: '🍸', tagline: '華やかな一杯で場を彩る社交の達人',
    description: 'お酒は好きだけど量より質。華やかなカクテルやワインを片手に、大人数の場をスマートに楽しむ社交上手なタイプです。',
    stats: { alcohol: 60, appetite: 30, social: 90, adventure: 85 },
  },
  DKET: {
    name: '乾杯マスター', code: 'DKET', group: 'DK', colorClass: 'purple',
    emoji: '🥂', tagline: '乾杯の音頭で宴をスタートさせる名司会',
    description: '飲みすぎず、でもお酒の場は大好き。いつもの仲間と定番のお店で、ほどよく楽しむバランス感覚の持ち主です。',
    stats: { alcohol: 55, appetite: 35, social: 80, adventure: 25 },
  },
  DKIN: {
    name: 'ワイン通の隠者', code: 'DKIN', group: 'DK', colorClass: 'purple',
    emoji: '🍷', tagline: '知られざる名店を巡る大人の嗜み',
    description: '少人数で隠れ家的なバーを開拓するのが好き。お酒の知識が豊富で、一杯一杯をじっくり味わう上品なタイプです。',
    stats: { alcohol: 55, appetite: 25, social: 25, adventure: 90 },
  },
  DKIT: {
    name: '晩酌の達人', code: 'DKIT', group: 'DK', colorClass: 'purple',
    emoji: '🍶', tagline: '静かに一杯を楽しむ至福のひととき',
    description: '少人数で、いつものお酒をゆっくり楽しむのが好き。宅飲みや馴染みの小料理屋が定位置。穏やかで安定感のある存在です。',
    stats: { alcohol: 50, appetite: 30, social: 15, adventure: 15 },
  },

  // ── FG グループ（食べ × ガッツリ）── 🟡 yellow
  FGEN: {
    name: 'グルメ冒険家', code: 'FGEN', group: 'FG', colorClass: 'yellow',
    emoji: '🌮', tagline: '食の新大陸を開拓する勇敢な探検家',
    description: '大人数で新しいお店やエスニック料理に挑戦するのが大好き。食べる量も半端なく、SNS映えするメニューにも目がありません。',
    stats: { alcohol: 30, appetite: 95, social: 90, adventure: 95 },
  },
  FGET: {
    name: '爆食ファイター', code: 'FGET', group: 'FG', colorClass: 'yellow',
    emoji: '🍕', tagline: 'ピザもから揚げも全部食べ尽くす大食漢',
    description: '大人数の宴会で、ピザ・唐揚げ・ご飯ものをひたすら食べまくるタイプ。定番メニューへの愛は誰にも負けません。',
    stats: { alcohol: 25, appetite: 95, social: 85, adventure: 20 },
  },
  FGIN: {
    name: '美食探検家', code: 'FGIN', group: 'FG', colorClass: 'yellow',
    emoji: '🍣', tagline: '隠れた名店を巡る食のソムリエ',
    description: '少人数で、まだ知られていない美味しいお店を探し歩くタイプ。食に対するこだわりは人一倍で、質も量も妥協しません。',
    stats: { alcohol: 20, appetite: 90, social: 30, adventure: 90 },
  },
  FGIT: {
    name: '大食いの守護者', code: 'FGIT', group: 'FG', colorClass: 'yellow',
    emoji: '🍖', tagline: 'いつもの店の裏メニューまで制覇した猛者',
    description: 'お気に入りのお店で、メニューを端から端まで食べ尽くすタイプ。少人数で黙々と食べるのが至福。安定の定番こそ正義。',
    stats: { alcohol: 20, appetite: 95, social: 20, adventure: 15 },
  },

  // ── FK グループ（食べ × 控えめ）── 🔵 blue
  FKEN: {
    name: 'ヘルシー社交家', code: 'FKEN', group: 'FK', colorClass: 'blue',
    emoji: '🥗', tagline: '体に優しい食事で場を和ませる癒し系',
    description: '大人数の場でも、ヘルシーで体にいいものを選ぶ意識高い系。新しいオーガニックレストランの開拓も好きで、みんなを健康に導きます。',
    stats: { alcohol: 15, appetite: 50, social: 85, adventure: 85 },
  },
  FKET: {
    name: 'おつまみ奉行', code: 'FKET', group: 'FK', colorClass: 'blue',
    emoji: '🥜', tagline: '定番おつまみの采配で宴を支える名脇役',
    description: '大人数の場で、枝豆やポテトなど定番おつまみを的確にオーダーする縁の下の力持ち。食べすぎず飲みすぎず、バランス感覚が光ります。',
    stats: { alcohol: 25, appetite: 45, social: 80, adventure: 20 },
  },
  FKIN: {
    name: '隠れ家グルメ', code: 'FKIN', group: 'FK', colorClass: 'blue',
    emoji: '☕', tagline: 'こだわりのカフェでまったり過ごす美食家',
    description: '少人数で、おしゃれなカフェや新しいスイーツを開拓するのが好き。飲み会よりお茶会派。食へのこだわりは繊細で上品です。',
    stats: { alcohol: 10, appetite: 45, social: 25, adventure: 85 },
  },
  FKIT: {
    name: 'おうち居酒屋派', code: 'FKIT', group: 'FK', colorClass: 'blue',
    emoji: '🏠', tagline: '自宅でまったり楽しむインドア派の極み',
    description: '少人数で宅飲み、いつもの手料理やデリバリーでのんびり過ごすのが理想。外の喧騒より、安心できる空間が一番。究極の癒し系です。',
    stats: { alcohol: 15, appetite: 40, social: 10, adventure: 10 },
  },
};

/* ══════════════════════════════════════════
   グループ定義
   ══════════════════════════════════════════ */
const groupInfo = {
  DG: { name: '酒豪グループ', color: 'green', label: '飲み派 × ガッツリ' },
  DK: { name: '嗜み派グループ', color: 'purple', label: '飲み派 × 控えめ' },
  FG: { name: '大食いグループ', color: 'yellow', label: '食べ派 × ガッツリ' },
  FK: { name: 'まったりグループ', color: 'blue', label: '食べ派 × 控えめ' },
};

/* ══════════════════════════════════════════
   診断ロジック
   ══════════════════════════════════════════ */
function diagnose(answers) {
  const axisScores = { DF: 0, GK: 0, EI: 0, NT: 0 };

  questions.forEach((q) => {
    const val = answers[q.id] || 0;
    axisScores[q.axis] += val * q.direction;
  });

  const letter1 = axisScores.DF >= 0 ? 'D' : 'F';
  const letter2 = axisScores.GK >= 0 ? 'G' : 'K';
  const letter3 = axisScores.EI >= 0 ? 'E' : 'I';
  const letter4 = axisScores.NT >= 0 ? 'N' : 'T';

  const code = letter1 + letter2 + letter3 + letter4;

  // 各軸のパーセンテージ（0〜100、50が中央）
  const maxPerAxis = 9; // 3問 × 最大3pt
  const pct = (axis) => Math.min(100, Math.max(0, Math.round(50 + (axisScores[axis] / maxPerAxis) * 50)));

  // 実用タグの集計（買い出しヒント用）
  const tagScores = {};
  questions.forEach((q) => {
    if (q.tag) {
      tagScores[q.tag] = answers[q.id] || 0;
    }
  });

  return {
    type: typeDefinitions[code],
    axisScores,
    percentages: { DF: pct('DF'), GK: pct('GK'), EI: pct('EI'), NT: pct('NT') },
    tagScores,
  };
}

/* ══════════════════════════════════════════
   コンポーネント
   ══════════════════════════════════════════ */
export default function Diagnosis() {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleSelect = (qId, value) => {
    setAnswers({ ...answers, [qId]: value });
  };

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === questions.length;
  const progress = Math.round((answeredCount / questions.length) * 100);

  const handleSubmit = () => {
    const r = diagnose(answers);
    setResult(r);
    // プロフィールに保存
    localStorage.setItem('banquetTypeResult', JSON.stringify(r.type));
    window.scrollTo(0, 0);
  };

  const reset = () => {
    setAnswers({});
    setResult(null);
    window.scrollTo(0, 0);
  };

  /* ── 結果画面 ── */
  if (result) {
    const { type, percentages } = result;
    const colorVar = `var(--type-${type.colorClass})`;
    const group = groupInfo[type.group];

    return (
      <div className="page-container result-page">
        {/* グループバッジ */}
        <div className="group-badge" style={{ background: `var(--type-${group.color})` }}>
          {group.label}
        </div>

        <div className="result-header">
          <h2 className="result-subtitle">あなたの宴会タイプは...</h2>
          <h1 className="result-title" style={{ color: colorVar }}>
            「{type.name}」
          </h1>
          <p className="result-code" style={{ color: colorVar }}>{type.code}</p>
          <p className="result-tagline">{type.tagline}</p>
        </div>

        <div className="mbti-card character-card">
          <div
            className="character-placeholder"
            style={{ backgroundColor: colorVar, boxShadow: `0 10px 25px ${colorVar}40` }}
          >
            <span>{type.emoji}</span>
          </div>
          <p className="type-description">{type.description}</p>
        </div>

        {/* 4軸バーチャート */}
        <div className="mbti-card stats-card">
          <h3 className="stats-title">性格マップ</h3>

          {Object.entries(axisLabels).map(([key, axis]) => {
            const pct = percentages[key];
            const isPos = pct >= 50;
            return (
              <div key={key} className="axis-row">
                <div className="axis-labels">
                  <span className={`axis-label ${isPos ? 'active' : ''}`}>{axis.posLabel}</span>
                  <span className="axis-pct">{isPos ? pct : 100 - pct}%</span>
                  <span className={`axis-label ${!isPos ? 'active' : ''}`}>{axis.negLabel}</span>
                </div>
                <div className="axis-bar-track">
                  <div
                    className="axis-bar-fill"
                    style={{
                      width: `${Math.abs(pct - 50) * 2}%`,
                      marginLeft: pct >= 50 ? '0' : 'auto',
                      marginRight: pct < 50 ? '0' : 'auto',
                      background: colorVar,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ステータス */}
        <div className="mbti-card stats-card">
          <h3 className="stats-title">特性パラメーター</h3>

          {[
            { label: 'アルコール耐性', value: type.stats.alcohol, color: 'green' },
            { label: '食欲', value: type.stats.appetite, color: 'yellow' },
            { label: '社交性', value: type.stats.social, color: 'purple' },
            { label: '冒険度', value: type.stats.adventure, color: 'blue' },
          ].map((stat) => (
            <div key={stat.label} className="stat-row">
              <div className="stat-labels">
                <span>{stat.label}</span>
                <span className="stat-value">{stat.value}%</span>
              </div>
              <div className="stat-bar-bg">
                <div className={`stat-bar type-bg-${stat.color}`} style={{ width: `${stat.value}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-primary mt-4" onClick={() => navigate('/profile')}>
          <UserCheck size={18} />
          マイタイプを見る
        </button>

        <button className="btn-secondary mt-2" onClick={reset}>
          <RefreshCcw size={18} />
          もう一度診断する
        </button>
      </div>
    );
  }

  /* ── 質問画面 ── */
  return (
    <div className="page-container">
      <div className="diagnosis-header">
        <h2>宴会タイプ診断</h2>
        <p className="text-muted">12の質問に答えて、16タイプから自分を見つけよう</p>
      </div>

      {/* プログレスバー */}
      <div className="progress-section">
        <div className="progress-text">
          <span>{answeredCount} / {questions.length}</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="questions-container">
        {questions.map((q) => (
          <div key={q.id} className={`mbti-card question-card ${answers[q.id] !== undefined ? 'answered' : ''}`}>
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
