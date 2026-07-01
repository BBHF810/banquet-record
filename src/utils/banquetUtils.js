// 16タイプのコードと名前の定義
export const typeDefinitions = {
  DGEN: { name: '宴会キング', emoji: '👑', colorClass: 'green' },
  DGET: { name: '飲み会番長', emoji: '🍺', colorClass: 'green' },
  DGIN: { name: '探求の酒豪', emoji: '🥃', colorClass: 'green' },
  DGIT: { name: '酒場の哲学者', emoji: '🫗', colorClass: 'green' },
  DKEN: { name: 'カクテル外交官', emoji: '🍸', colorClass: 'purple' },
  DKET: { name: '乾杯マスター', emoji: '🥂', colorClass: 'purple' },
  DKIN: { name: 'ワイン通の隠者', emoji: '🍷', colorClass: 'purple' },
  DKIT: { name: '晩酌の達人', emoji: '🍶', colorClass: 'purple' },
  FGEN: { name: 'グルメ冒険家', emoji: '🌮', colorClass: 'yellow' },
  FGET: { name: '爆食ファイター', emoji: '🍕', colorClass: 'yellow' },
  FGIN: { name: '美食探検家', emoji: '🍣', colorClass: 'yellow' },
  FGIT: { name: '大食いの守護者', emoji: '🍖', colorClass: 'yellow' },
  FKEN: { name: 'ヘルシー社交家', emoji: '🥗', colorClass: 'blue' },
  FKET: { name: 'おつまみ奉行', emoji: '🥜', colorClass: 'blue' },
  FKIN: { name: '隠れ家グルメ', emoji: '☕', colorClass: 'blue' },
  FKIT: { name: 'おうち居酒屋派', emoji: '🏠', colorClass: 'blue' },
};

// 初期ダミー参加者
export const initialParticipants = [
  { id: 1, name: 'タカシ', type: 'DGET', allergies: '' },
  { id: 2, name: 'ケンジ', type: 'FGET', allergies: 'エビ・カニ' },
  { id: 3, name: 'サトミ', type: 'FKIN', allergies: '' },
  { id: 4, name: 'ユウキ', type: 'FKEN', allergies: '' },
];

/**
 * 参加者リストに基づいて、買い出しリストを動的に計算・生成する
 * @param {Array} participants 
 * @returns {Array} generatedItems
 */
export function calculateShoppingList(participants) {
  if (!participants || participants.length === 0) return [];

  let totalAlcoholCans = 0;
  let sweetAlcoholCans = 0;
  let traditionalAlcoholCans = 0;
  let softDrinkLiters = 0;
  let mainFoodPortions = 0;
  let snackBags = 0;

  let hasHeavyDrinkers = false;
  let hasHeavyEaters = false;

  participants.forEach(p => {
    const code = p.type || 'FKIT';
    const isDrink = code.startsWith('D');
    const isHeavy = code.includes('G');
    const isNovel = code.endsWith('N');
    const isExtrovert = code.includes('E');

    // 1. お酒の計算
    let pAlcohol = 0;
    if (isDrink && isHeavy) {
      pAlcohol = 4.5;
      hasHeavyDrinkers = true;
    } else if (isDrink && !isHeavy) {
      pAlcohol = 2.5;
    } else if (!isDrink && isHeavy) {
      pAlcohol = 1.0;
    } else {
      pAlcohol = 0.5;
    }
    totalAlcoholCans += pAlcohol;

    // お酒の内訳 (冒険Nならカクテル/サワー系、定番Tならビール/ハイボール系)
    if (isNovel) {
      sweetAlcoholCans += pAlcohol;
    } else {
      traditionalAlcoholCans += pAlcohol;
    }

    // 2. ソフトドリンクの計算 (お酒控えめ・食べ派は多め)
    let pSoft = 0;
    if (isDrink && isHeavy) {
      pSoft = 0.3; // ほとんど酒
    } else if (!isDrink && isHeavy) {
      pSoft = 1.0; // ガッツリ食べるので水分必要
    } else {
      pSoft = 0.7;
    }
    softDrinkLiters += pSoft;

    // 3. メインフード（主食）の計算
    let pFood = 0;
    if (isHeavy) {
      pFood = 1.5; // ガッツリ
      hasHeavyEaters = true;
    } else {
      pFood = 0.8; // 控えめ
    }
    mainFoodPortions += pFood;

    // 4. おつまみ・スナック
    let pSnack = isExtrovert ? 0.8 : 0.4;
    snackBags += pSnack;
  });

  // 整形してアイテムリストを作成
  const items = [];

  // ビール・ハイボール（缶数）
  const tradCans = Math.ceil(traditionalAlcoholCans);
  if (tradCans > 0) {
    items.push({
      id: 1,
      name: '定番ビール・ハイボール缶',
      qty: `${tradCans}本`,
      category: 'alcohol',
      checked: false
    });
  }

  // レモンサワー・カクテル（缶数）
  const sweetCans = Math.ceil(sweetAlcoholCans);
  if (sweetCans > 0) {
    items.push({
      id: 2,
      name: 'レモンサワー・カクテル缶',
      qty: `${sweetCans}本`,
      category: 'alcohol',
      checked: false
    });
  }

  // メインフード (ピザ換算など)
  // 1枚＝約3人前（3 portions）とする
  const pizzaCount = Math.ceil(mainFoodPortions / 3);
  if (pizzaCount > 0) {
    items.push({
      id: 3,
      name: 'メインの主食 (ピザ Lサイズやオードブル等)',
      qty: `${pizzaCount}枚 (約${Math.ceil(mainFoodPortions)}人前)`,
      category: 'food',
      checked: false
    });
  }

  // スナック
  const snacks = Math.ceil(snackBags);
  if (snacks > 0) {
    items.push({
      id: 4,
      name: 'スナック菓子・乾き物おつまみ',
      qty: `${snacks}袋`,
      category: 'food',
      checked: false
    });
  }

  // ソフトドリンク (2Lペットボトル換算)
  const softBottles = Math.ceil(softDrinkLiters / 2);
  if (softBottles > 0) {
    items.push({
      id: 5,
      name: 'ソフトドリンク (ウーロン茶・緑茶・コーラ等)',
      qty: `2L瓶 × ${softBottles}本 (計${softDrinkLiters.toFixed(1)}L)`,
      category: 'drink',
      checked: false
    });
  }

  return {
    items,
    summary: {
      hasHeavyDrinkers,
      hasHeavyEaters,
      peopleCount: participants.length
    }
  };
}
