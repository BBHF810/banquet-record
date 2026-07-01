import { useState, useEffect } from 'react';
import { Share2, Trash2, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const STAT_CONFIG = [
  { key: 'alcohol', label: 'アルコール耐性', colorClass: 'type-bg-green' },
  { key: 'appetite', label: '食欲', colorClass: 'type-bg-yellow' },
  { key: 'social', label: '社交性', colorClass: 'type-bg-purple' },
  { key: 'adventure', label: '冒険度', colorClass: 'type-bg-blue' },
];

export default function Profile() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('banquetTypeResult');
    if (saved) {
      try {
        setResult(JSON.parse(saved));
      } catch {
        setResult(null);
      }
    }
  }, []);

  const handleShare = async () => {
    const { name, tagline } = result;
    const shareData = {
      title: `私の宴会タイプは「${name}」！`,
      text: `${tagline}\n\n宴会タイプ診断で自分のタイプを調べよう！`,
      url: window.location.origin + '/diagnosis',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // ユーザーがキャンセルした場合は何もしない
      }
    } else {
      try {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        setToast('クリップボードにコピーしました！');
        setTimeout(() => setToast(''), 2000);
      } catch {
        setToast('コピーに失敗しました');
        setTimeout(() => setToast(''), 2000);
      }
    }
  };

  const handleReset = () => {
    localStorage.removeItem('banquetTypeResult');
    navigate('/diagnosis');
  };

  if (!result) {
    return (
      <div className="page-container">
        <div className="profile-empty">
          <UserCircle size={80} className="empty-icon" />
          <h2>まだ診断していません</h2>
          <button className="btn-share" onClick={() => navigate('/diagnosis')}>
            診断をはじめる
          </button>
        </div>
      </div>
    );
  }

  const { code, name, emoji, tagline, colorClass, stats } = result;

  return (
    <div className="page-container">
      <div className="mbti-card">
        <div className="profile-hero">
          <div className={`profile-avatar type-bg-${colorClass}`}>
            {emoji}
          </div>
          <div className={`profile-name type-color-${colorClass}`}>{name}</div>
          <div className={`profile-code type-color-${colorClass}`}>{code}</div>
          <div className="profile-tagline">{tagline}</div>
        </div>
      </div>

      <div className="mbti-card">
        <div className="profile-stats">
          <h3>ステータス</h3>
          {STAT_CONFIG.map(({ key, label, colorClass: barColor }) => (
            <div className="profile-stat-row" key={key}>
              <div className="profile-stat-labels">
                <span>{label}</span>
                <span>{stats[key]}</span>
              </div>
              <div className="profile-bar-bg">
                <div
                  className={`profile-bar ${barColor}`}
                  style={{ width: `${stats[key]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="profile-actions">
        <button className="btn-share" onClick={handleShare}>
          <Share2 size={18} />
          共有する
        </button>
        <button className="btn-reset" onClick={handleReset}>
          <Trash2 size={18} />
          もう一度診断する
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
