import { useState, useEffect } from 'react';
import { Share2, Calendar as CalendarIcon, Heart, Award, Smile, Camera, Plus, Trash2, X, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { typeDefinitions } from '../utils/banquetUtils';
import './MyPage.css';

// 画像圧縮用のユーティリティ
const compressImage = (base64Str, maxWidth = 300, maxHeight = 300) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7)); // JPEG形式、品質70%で圧縮
    };
  });
};

export default function MyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'calendar'

  // ── プロフィール基本情報 ──
  const [profileName, setProfileName] = useState('');
  const [allergies, setAllergies] = useState('');
  const [favFood, setFavFood] = useState('');
  const [dislikedFood, setDislikedFood] = useState('');
  
  // ── 診断された宴会タイプ ──
  const [diagnosedType, setDiagnosedType] = useState(null);

  // ── お気に入りのお酒 ──
  const [favDrinkName, setFavDrinkName] = useState('');
  const [favDrinkComment, setFavDrinkComment] = useState('');
  const [favDrinkPhoto, setFavDrinkPhoto] = useState('');

  // ── 飲み会きろく (カレンダー) ──
  const [stamps, setStamps] = useState({}); // キー: YYYY-MM-DD, 値: { stamp: '🍻', mvpPhoto: '...', mvpText: '...' }
  const [selectedDate, setSelectedDate] = useState(null); // 現在選択されている日付 (YYYY-MM-DD)
  const [tempStamp, setTempStamp] = useState('');
  const [tempMvpText, setTempMvpText] = useState('');
  const [tempMvpPhoto, setTempMvpPhoto] = useState('');

  const [toast, setToast] = useState('');

  // カレンダー設定
  const year = 2026;
  const month = 7;
  const daysInMonth = 31;

  useEffect(() => {
    // データロード
    setProfileName(localStorage.getItem('banquetProfileName') || 'ゲストユーザー');
    setAllergies(localStorage.getItem('banquetAllergies') || '');
    setFavFood(localStorage.getItem('banquetFavFood') || '');
    setDislikedFood(localStorage.getItem('banquetDislikedFood') || '');

    const savedType = localStorage.getItem('banquetTypeResult');
    if (savedType) {
      try {
        setDiagnosedType(JSON.parse(savedType));
      } catch {
        setDiagnosedType(null);
      }
    }

    const savedFav = localStorage.getItem('banquetFavoriteDrink');
    if (savedFav) {
      try {
        const parsed = JSON.parse(savedFav);
        setFavDrinkName(parsed.name || '');
        setFavDrinkComment(parsed.comment || '');
        setFavDrinkPhoto(parsed.photo || '');
      } catch {}
    }

    const savedStamps = localStorage.getItem('banquetCalendarStamps');
    if (savedStamps) {
      try {
        setStamps(JSON.parse(savedStamps));
      } catch {}
    }
  }, []);

  // 保存ヘルパー
  const saveInfo = (key, value) => {
    localStorage.setItem(key, value);
  };

  const saveFavoriteDrink = (updated) => {
    localStorage.setItem('banquetFavoriteDrink', JSON.stringify(updated));
  };

  // お気に入りのお酒の写真アップロード
  const handleFavDrinkPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result);
      setFavDrinkPhoto(compressed);
      saveFavoriteDrink({
        name: favDrinkName,
        comment: favDrinkComment,
        photo: compressed
      });
    };
    reader.readAsDataURL(file);
  };

  // 日付の選択＆エディタ表示
  const handleDaySelect = (dateStr) => {
    setSelectedDate(dateStr);
    const dayRecord = stamps[dateStr] || {};
    // 旧バージョンの文字列スタンプとの互換性確保
    if (typeof dayRecord === 'string') {
      setTempStamp(dayRecord);
      setTempMvpText('');
      setTempMvpPhoto('');
    } else {
      setTempStamp(dayRecord.stamp || '');
      setTempMvpText(dayRecord.mvpText || '');
      setTempMvpPhoto(dayRecord.mvpPhoto || '');
    }
  };

  // MVP写真アップロード
  const handleMvpPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result, 400, 400); // カレンダー表示用に少し大きめに圧縮可能
      setTempMvpPhoto(compressed);
    };
    reader.readAsDataURL(file);
  };

  // 日付のきろくを保存
  const handleSaveDayRecord = () => {
    if (!selectedDate) return;

    const updatedStamps = { ...stamps };
    if (!tempStamp && !tempMvpText && !tempMvpPhoto) {
      delete updatedStamps[selectedDate];
    } else {
      updatedStamps[selectedDate] = {
        stamp: tempStamp,
        mvpText: tempMvpText,
        mvpPhoto: tempMvpPhoto
      };
    }

    setStamps(updatedStamps);
    localStorage.setItem('banquetCalendarStamps', JSON.stringify(updatedStamps));
    setSelectedDate(null);
    showToast('きろくを保存しました');
  };

  // プロフィール共有
  const handleShare = async () => {
    if (!profileName.trim()) {
      showToast('ニックネームを入力してください');
      return;
    }

    const sharePayload = {
      name: profileName,
      type: diagnosedType ? diagnosedType.code : 'FKIT',
      allergies,
      favFood,
      dislikedFood,
      favDrinkName
    };

    const base64Payload = btoa(unescape(encodeURIComponent(JSON.stringify(sharePayload))));
    const shareUrl = `${window.location.origin}/host?import=${base64Payload}`;

    const shareData = {
      title: `${profileName}の宴会プロフィール`,
      text: `幹事さん用：私の宴会タイプは「${diagnosedType ? diagnosedType.name : '未診断'}」です。アレルギー情報: ${allergies || 'なし'}。好きな食べ物: ${favFood || 'なし'}。以下のリンクから幹事リストに追加してください！`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        showToast('幹事用共有リンクをクリップボードにコピーしました！');
      } catch {
        showToast('リンクのコピーに失敗しました');
      }
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>マイページ</h2>
        <p className="text-muted">自分の宴会カルテを作成して幹事と共有しよう</p>
      </div>

      {/* タブナビゲーション */}
      <div className="mypage-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          プロフィール
        </button>
        <button 
          className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          カレンダー
        </button>
      </div>

      {/* ──────────────── プロフィールタブ ──────────────── */}
      {activeTab === 'profile' && (
        <div className="tab-content fade-in">
          {/* 基本プロフィール */}
          <div className="mbti-card">
            <div className="card-header">
              <Smile className="text-accent-primary" size={20} />
              <h3>基本情報</h3>
            </div>
            <div className="profile-inputs-container">
              <div className="form-group">
                <label>ニックネーム</label>
                <input 
                  type="text" 
                  value={profileName}
                  onChange={(e) => {
                    setProfileName(e.target.value);
                    saveInfo('banquetProfileName', e.target.value);
                  }}
                  placeholder="例: はるひ"
                />
              </div>
              <div className="form-group">
                <label>アレルギー</label>
                <input 
                  type="text" 
                  value={allergies}
                  onChange={(e) => {
                    setAllergies(e.target.value);
                    saveInfo('banquetAllergies', e.target.value);
                  }}
                  placeholder="例: エビ、カニ (なければ空欄)"
                />
              </div>
            </div>
          </div>

          {/* 食の好み */}
          <div className="mbti-card">
            <div className="card-header">
              <Heart className="text-accent-primary" size={20} />
              <h3>食の好み</h3>
            </div>
            <div className="profile-inputs-container">
              <div className="form-group">
                <label>好きな食べもの</label>
                <input 
                  type="text" 
                  value={favFood}
                  onChange={(e) => {
                    setFavFood(e.target.value);
                    saveInfo('banquetFavFood', e.target.value);
                  }}
                  placeholder="例: ピザ、お寿司、焼き鳥"
                />
              </div>
              <div className="form-group">
                <label>嫌いな食べもの / 苦手なもの</label>
                <input 
                  type="text" 
                  value={dislikedFood}
                  onChange={(e) => {
                    setDislikedFood(e.target.value);
                    saveInfo('banquetDislikedFood', e.target.value);
                  }}
                  placeholder="例: パセリ、辛いもの"
                />
              </div>
            </div>
          </div>

          {/* お気に入りのお酒 */}
          <div className="mbti-card">
            <div className="card-header">
              <Heart className="text-accent-danger" size={20} style={{ color: 'var(--danger)' }} />
              <h3>お気に入りのお酒</h3>
            </div>
            <div className="fav-drink-form">
              <div className="fav-drink-photo-section">
                {favDrinkPhoto ? (
                  <div className="drink-photo-preview" style={{ backgroundImage: `url(${favDrinkPhoto})` }}>
                    <label className="photo-change-btn">
                      <Camera size={16} />
                      <input type="file" accept="image/*" onChange={handleFavDrinkPhoto} style={{ display: 'none' }} />
                    </label>
                  </div>
                ) : (
                  <label className="drink-photo-placeholder">
                    <Camera size={32} className="text-muted" />
                    <span className="text-muted text-xs">写真を登録</span>
                    <input type="file" accept="image/*" onChange={handleFavDrinkPhoto} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
              <div className="fav-drink-inputs">
                <input 
                  type="text" 
                  placeholder="お酒の名前 (例: ビール)" 
                  value={favDrinkName}
                  onChange={(e) => {
                    setFavDrinkName(e.target.value);
                    saveFavoriteDrink({ name: e.target.value, comment: favDrinkComment, photo: favDrinkPhoto });
                  }}
                />
                <textarea 
                  placeholder="好きな銘柄やこだわりなど" 
                  rows="3"
                  value={favDrinkComment}
                  onChange={(e) => {
                    setFavDrinkComment(e.target.value);
                    saveFavoriteDrink({ name: favDrinkName, comment: e.target.value, photo: favDrinkPhoto });
                  }}
                />
              </div>
            </div>
          </div>

          {/* マイタイプ */}
          <div className="mbti-card">
            <div className="card-header">
              <Award className="text-accent-yellow" size={20} />
              <h3>マイ宴会タイプ</h3>
            </div>
            {diagnosedType ? (
              <div className="mypage-type-info">
                <div className={`mypage-avatar type-bg-${diagnosedType.colorClass}`}>
                  {diagnosedType.emoji}
                </div>
                <div className="mypage-type-texts">
                  <span className={`mypage-type-name type-color-${diagnosedType.colorClass}`}>
                    {diagnosedType.name} ({diagnosedType.code})
                  </span>
                  <p className="text-muted text-sm">{diagnosedType.tagline}</p>
                </div>
                <button className="btn-icon-secondary" onClick={() => navigate('/diagnosis')} title="再診断">
                  <RefreshCcw size={16} />
                </button>
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-muted mb-2">まだタイプ診断を行っていません</p>
                <button className="btn-secondary w-full" onClick={() => navigate('/diagnosis')}>
                  タイプ診断を始める
                </button>
              </div>
            )}
          </div>

          {/* 共有アクション */}
          <div className="share-section">
            <button className="btn-primary" onClick={handleShare}>
              <Share2 size={20} />
              このプロフィールを幹事に共有
            </button>
            <p className="share-hint text-muted text-center">
              ※共有リンクを幹事に送ることで、幹事の買い出し計画リストにあなたのタイプ・食の好み・アレルギーが自動登録されます。
            </p>
          </div>
        </div>
      )}

      {/* ──────────────── カレンダータブ ──────────────── */}
      {activeTab === 'calendar' && (
        <div className="tab-content fade-in">
          <div className="mbti-card">
            <div className="card-header">
              <CalendarIcon className="text-accent-purple" size={20} />
              <h3>飲み会カレンダー ({month}月)</h3>
            </div>
            <p className="text-muted text-xs mb-3">日付をタップすると、スタンプの記録とMVP写真の添付ができます。</p>
            
            <div className="calendar-grid">
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const record = stamps[dateStr] || {};
                
                const hasPhoto = typeof record !== 'string' && record.mvpPhoto;
                const stamp = typeof record === 'string' ? record : record.stamp;

                return (
                  <div 
                    key={day} 
                    className={`calendar-day ${stamp || hasPhoto ? 'has-stamp' : ''} ${selectedDate === dateStr ? 'selected-day' : ''}`}
                    onClick={() => handleDaySelect(dateStr)}
                    style={hasPhoto ? { backgroundImage: `url(${record.mvpPhoto})` } : null}
                  >
                    <span className="day-number">{day}</span>
                    {stamp && <span className="day-stamp">{stamp}</span>}
                    {hasPhoto && <div className="photo-indicator">🖼️</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 選択日のきろく編集フォーム */}
          {selectedDate && (
            <div className="mbti-card edit-day-card fade-in">
              <div className="edit-day-header">
                <h4>7月 {parseInt(selectedDate.split('-')[2])}日のきろく</h4>
                <button className="btn-close" onClick={() => setSelectedDate(null)}><X size={16} /></button>
              </div>

              {/* スタンプセレクト */}
              <div className="form-group mt-2">
                <label>スタンプ</label>
                <div className="stamp-selectors">
                  {['🍻', '🍷', '🤢', '❌'].map(emoji => (
                    <button 
                      key={emoji}
                      className={`stamp-select-btn ${tempStamp === emoji ? 'selected' : ''}`}
                      onClick={() => setTempStamp(tempStamp === emoji ? '' : emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* MVP写真アップロード */}
              <div className="form-group mt-3">
                <label>この日のMVP（人・飯・酒の写真）</label>
                <div className="mvp-upload-container">
                  {tempMvpPhoto ? (
                    <div className="mvp-preview-wrapper">
                      <img src={tempMvpPhoto} alt="MVP" className="mvp-photo-preview" />
                      <button className="btn-remove-photo" onClick={() => setTempMvpPhoto('')}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="mvp-upload-placeholder">
                      <Camera size={28} className="text-muted" />
                      <span className="text-muted text-xs">写真を添付</span>
                      <input type="file" accept="image/*" onChange={handleMvpPhotoUpload} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>

              {/* MVPメモ */}
              <div className="form-group mt-3">
                <label>MVPのメモ / コメント</label>
                <input 
                  type="text" 
                  value={tempMvpText}
                  onChange={(e) => setTempMvpText(e.target.value)}
                  placeholder="例: 特製ピザ、タカシの熱唱など"
                />
              </div>

              <div className="edit-day-actions mt-3">
                <button className="btn-primary" onClick={handleSaveDayRecord}>
                  きろくを保存する
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
