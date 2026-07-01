import { useState, useEffect } from 'react';
import { Share2, Calendar, Heart, Award, AlertTriangle, RefreshCcw, Camera, Smile } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { typeDefinitions } from '../utils/banquetUtils';
import './MyPage.css';

export default function MyPage() {
  const navigate = useNavigate();
  
  // ── プロフィール基本情報 ──
  const [profileName, setProfileName] = useState('');
  const [allergies, setAllergies] = useState('');
  
  // ── 診断された宴会タイプ ──
  const [diagnosedType, setDiagnosedType] = useState(null);

  // ── お気に入りのお酒 ──
  const [favDrinkName, setFavDrinkName] = useState('');
  const [favDrinkComment, setFavDrinkComment] = useState('');
  const [favDrinkPhoto, setFavDrinkPhoto] = useState('');

  // ── 飲み会きろく (カレンダー) ──
  const [stamps, setStamps] = useState({});
  const stampOptions = ['🍻', '🍷', '🤢', '❌']; // トグルするスタンプの候補
  
  const [toast, setToast] = useState('');

  // 現在の年月 (2026年7月固定または動的)
  const year = 2026;
  const month = 7; // 7月
  const daysInMonth = 31; // 7月は31日まで

  useEffect(() => {
    // 基本情報のロード
    setProfileName(localStorage.getItem('banquetProfileName') || 'ゲストユーザー');
    setAllergies(localStorage.getItem('banquetAllergies') || '');

    // 宴会タイプのロード
    const savedType = localStorage.getItem('banquetTypeResult');
    if (savedType) {
      try {
        setDiagnosedType(JSON.parse(savedType));
      } catch {
        setDiagnosedType(null);
      }
    }

    // お気に入りのお酒のロード
    const savedFav = localStorage.getItem('banquetFavoriteDrink');
    if (savedFav) {
      try {
        const parsed = JSON.parse(savedFav);
        setFavDrinkName(parsed.name || '');
        setFavDrinkComment(parsed.comment || '');
        setFavDrinkPhoto(parsed.photo || '');
      } catch {}
    }

    // カレンダースタンプのロード
    const savedStamps = localStorage.getItem('banquetCalendarStamps');
    if (savedStamps) {
      try {
        setStamps(JSON.parse(savedStamps));
      } catch {}
    }
  }, []);

  // 基本情報の保存
  const saveBasicInfo = (key, value) => {
    localStorage.setItem(key, value);
  };

  // お気に入りのお酒の保存
  const saveFavoriteDrink = (updated) => {
    localStorage.setItem('banquetFavoriteDrink', JSON.stringify(updated));
  };

  // 写真アップロード (Base64)
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ファイルサイズ制限 (ローカルストレージの上限に達しないよう1MB以下を推奨)
    if (file.size > 1024 * 1024) {
      showToast('画像は1MB未満にしてください');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFavDrinkPhoto(reader.result);
      saveFavoriteDrink({
        name: favDrinkName,
        comment: favDrinkComment,
        photo: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  // カレンダースタンプのトグル
  const handleDayClick = (day) => {
    const currentStamp = stamps[day];
    let nextStamp = '';

    if (!currentStamp) {
      nextStamp = stampOptions[0];
    } else {
      const currentIndex = stampOptions.indexOf(currentStamp);
      if (currentIndex === stampOptions.length - 1) {
        nextStamp = ''; // 一周したらクリア
      } else {
        nextStamp = stampOptions[currentIndex + 1];
      }
    }

    const updatedStamps = { ...stamps, [day]: nextStamp };
    // 空のスタンプはキーごと削除してすっきりさせる
    if (!nextStamp) {
      delete updatedStamps[day];
    }

    setStamps(updatedStamps);
    localStorage.setItem('banquetCalendarStamps', JSON.stringify(updatedStamps));
  };

  // プロフィール共有 (幹事に送る用URLの生成)
  const handleShare = async () => {
    if (!profileName.trim()) {
      showToast('名前を入力してください');
      return;
    }

    // 共有用のパラメータを作成（写真はデータ量が大きいため省き、基本情報とタイプのみを共有）
    const sharePayload = {
      name: profileName,
      type: diagnosedType ? diagnosedType.code : 'FKIT',
      allergies: allergies
    };

    const base64Payload = btoa(unescape(encodeURIComponent(JSON.stringify(sharePayload))));
    const shareUrl = `${window.location.origin}/host?import=${base64Payload}`;

    const shareData = {
      title: `${profileName}の宴会プロフィール`,
      text: `幹事さん用：私の宴会タイプは「${diagnosedType ? diagnosedType.name : '未診断'}」です。アレルギー情報: ${allergies || 'なし'}。以下のリンクから幹事リストに追加してください！`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // キャンセル時は何もしない
      }
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

  // カレンダー描画用グリッド
  const renderCalendar = () => {
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return (
      <div className="calendar-grid">
        {days.map(day => {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const stamp = stamps[dateStr];
          return (
            <div 
              key={day} 
              className={`calendar-day ${stamp ? 'has-stamp' : ''}`}
              onClick={() => handleDayClick(dateStr)}
            >
              <span className="day-number">{day}</span>
              {stamp && <span className="day-stamp">{stamp}</span>}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>マイページ</h2>
        <p className="text-muted">自分の宴会プロフィールを登録し、幹事と共有しよう！</p>
      </div>

      {/* 基本情報設定 */}
      <div className="mbti-card">
        <div className="card-header">
          <Smile className="text-accent-primary" size={20} />
          <h3>プロフィール設定</h3>
        </div>
        <div className="profile-inputs-container">
          <div className="form-group">
            <label>ニックネーム</label>
            <input 
              type="text" 
              value={profileName}
              onChange={(e) => {
                setProfileName(e.target.value);
                saveBasicInfo('banquetProfileName', e.target.value);
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
                saveBasicInfo('banquetAllergies', e.target.value);
              }}
              placeholder="例: エビ、そば (なければ空欄)"
            />
          </div>
        </div>
      </div>

      {/* 幹事への共有アクション */}
      <button className="btn-primary" onClick={handleShare}>
        <Share2 size={20} />
        このマイページを幹事に共有
      </button>
      <p className="share-hint text-muted text-center">
        ※共有リンクを幹事に送ると、幹事の買い出し計画リストにあなたのタイプとアレルギーが自動登録されます。
      </p>

      {/* マイタイプ（診断結果） */}
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

      {/* 飲み会きろく (カレンダー) */}
      <div className="mbti-card">
        <div className="card-header">
          <Calendar className="text-accent-purple" size={20} />
          <h3>飲み会きろく ({month}月)</h3>
        </div>
        <p className="text-muted text-xs mb-3">日付をタップするとスタンプ（ 🍻 / 🍷 / 🤢 / ❌ ）をトグルできます。</p>
        {renderCalendar()}
      </div>

      {/* お気に入りのお酒 (写真＋コメント) */}
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
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
              </div>
            ) : (
              <label className="drink-photo-placeholder">
                <Camera size={32} className="text-muted" />
                <span className="text-muted text-xs">写真を登録</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>
          <div className="fav-drink-inputs">
            <input 
              type="text" 
              placeholder="お酒の名前 (例: レモンサワー)" 
              value={favDrinkName}
              onChange={(e) => {
                setFavDrinkName(e.target.value);
                saveFavoriteDrink({ name: e.target.value, comment: favDrinkComment, photo: favDrinkPhoto });
              }}
            />
            <textarea 
              placeholder="おすすめの飲み方やコメントなど" 
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

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
