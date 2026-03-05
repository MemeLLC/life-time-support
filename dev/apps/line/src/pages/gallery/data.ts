export interface Category {
  label: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
  category: string;
}

export const categories: Category[] = [
  { label: "エコカラット" },
  { label: "オーダー家具" },
  { label: "フロアコーティング" },
  { label: "カーテン" },
  { label: "バルコニータイル" },
  { label: "住宅設備" },
  { label: "その他" },
];

// エコカラット画像
const ecocaratImages: GalleryImage[] = [
  {
    src: "/images/ecocarat/ストーングレースSTG3Nダークグレー.jpg",
    alt: "ストーングレース STG3N ダークグレー",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/ラフクォーツ_RTZ1Nライトグレー.jpg",
    alt: "ラフクォーツ RTZ1N ライトグレー",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/ラフクォーツ_RTZ3Nダークグレー.jpg",
    alt: "ラフクォーツ RTZ3N ダークグレー",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/ルドラ_LDN1ホワイト.jpg",
    alt: "ルドラ LDN1 ホワイト",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/ルドラ_LDN2グレー.jpg",
    alt: "ルドラ LDN2 グレー",
    category: "エコカラット",
  },
  { src: "/images/ecocarat/ルドラ_LDN3.jpg", alt: "ルドラ LDN3", category: "エコカラット" },
  {
    src: "/images/ecocarat/ネオトラバーチン_TVT1ベージュ.jpg",
    alt: "ネオトラバーチン TVT1 ベージュ",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/ネオトラバーチン_TVT2グレー.jpg",
    alt: "ネオトラバーチン TVT2 グレー",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/ビンテージオーク_OAK2Nベージュ.jpg",
    alt: "ビンテージオーク OAK2N ベージュ",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/カームウッド_CWD1Nグレー.jpg",
    alt: "カームウッド CWD1N グレー",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/ディニタ_DNT1ホワイト.jpg",
    alt: "ディニタ DNT1 ホワイト",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/サンティエ_STE1アイボリー.jpg",
    alt: "サンティエ STE1 アイボリー",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/ストーンⅡ_STN1アイボリー.jpg",
    alt: "ストーンII STN1 アイボリー",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/ストーンⅡ_STN3グレー.jpg",
    alt: "ストーンII STN3 グレー",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/スモークウッド_SMW1グレー.jpg",
    alt: "スモークウッド SMW1 グレー",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/ラフセメント_RGC2グレージュ.jpg",
    alt: "ラフセメント RGC2 グレージュ",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/ランド土もの調_PLD1アイボリー.jpg",
    alt: "ランド土もの調 PLD1 アイボリー",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/レイヤーミックス_LAY1ホワイト.jpg",
    alt: "レイヤーミックス LAY1 ホワイト",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/ヴァルスロック_VSR1Nホワイト.jpg",
    alt: "ヴァルスロック VSR1N ホワイト",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/ヴィスト_VIN2ベージュ.jpg",
    alt: "ヴィスト VIN2 ベージュ",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/ヴィーレ_WE2アイボリー.jpg",
    alt: "ヴィーレ WE2 アイボリー",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/和細工_WZK1素色.jpg",
    alt: "和細工 WZK1 素色",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/陶連子_TOR1生成り色.jpg",
    alt: "陶連子 TOR1 生成り色",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/フェミーナ_FMN6Nグレイッシュブラウン.jpg",
    alt: "フェミーナ FMN6N グレイッシュブラウン",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/マジェスティックスレート_MAJ1アイボリー.jpg",
    alt: "マジェスティックスレート MAJ1 アイボリー",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/ラグジュアリーモザイク_LUX12ブルーグレー.jpg",
    alt: "ラグジュアリーモザイク LUX12 ブルーグレー",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/アンティークマーブル_AMB1Nアイボリー.jpg",
    alt: "アンティークマーブル AMB1N アイボリー",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/シルクリーネ_SLA1Nホワイト.jpg",
    alt: "シルクリーネ SLA1N ホワイト",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/シングレースTHG3ダークグレー.jpg",
    alt: "シングレース THG3 ダークグレー",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/グランクォーツ_GRQ1ライトグレー.jpg",
    alt: "グランクォーツ GRQ1 ライトグレー",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/パールマスク_PMK12パールバニラ.jpg",
    alt: "パールマスク PMK12 パールバニラ",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/ファインベース_NN12グレー.jpg",
    alt: "ファインベース NN12 グレー",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/リブスレート RSL1アイボリー.jpg",
    alt: "リブスレート RSL1 アイボリー",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/エコカラット×インターホン.jpg",
    alt: "エコカラット×インターホン",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/エコカラット×マージンキャビネット.jpg",
    alt: "エコカラット×マージンキャビネット",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/エコカラット×外部スピーカー.jpg",
    alt: "エコカラット×外部スピーカー",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/エコカラット×棚板.jpg",
    alt: "エコカラット×棚板",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/デザインパッケージ1.jpg",
    alt: "デザインパッケージ 1",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/デザインパッケージ2.jpg",
    alt: "デザインパッケージ 2",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/デザインパネルキット1.jpg",
    alt: "デザインパネルキット 1",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/デザインパネルキット2.jpg",
    alt: "デザインパネルキット 2",
    category: "エコカラット",
  },
  { src: "/images/ecocarat/EDPK-126014.jpg", alt: "EDPK-126014", category: "エコカラット" },
  {
    src: "/images/ecocarat/NRC2セージグリーン.jpg",
    alt: "NRC2 セージグリーン",
    category: "エコカラット",
  },
  {
    src: "/images/ecocarat/PTS1Nライトグレー.jpg",
    alt: "PTS1N ライトグレー",
    category: "エコカラット",
  },
  { src: "/images/ecocarat/RAX2Aベージュ.jpg", alt: "RAX2A ベージュ", category: "エコカラット" },
  { src: "/images/ecocarat/TK1Nホワイト.jpg", alt: "TK1N ホワイト", category: "エコカラット" },
];

// オーダー家具画像
const orderFurnitureImages: GalleryImage[] = [
  {
    src: "/images/order-furniture/食器棚_LIXIL_リシェル24_グレージュスタッコ.jpg",
    alt: "食器棚 LIXIL リシェル24 グレージュスタッコ",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/食器棚_LIXIL_NEシリーズTJY2603K.jpg",
    alt: "食器棚 LIXIL NEシリーズ TJY2603K",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/食器棚_LIXIL_ウォルナット_ノクト.jpg",
    alt: "食器棚 LIXIL ウォルナット ノクト",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/食器棚_LIXIL_A38ディープグレイン.jpg",
    alt: "食器棚 LIXIL A38 ディープグレイン",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/食器棚_パモウナ食器棚.jpg",
    alt: "食器棚 パモウナ",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/食器棚_綾乃食器棚.jpg",
    alt: "食器棚 綾乃",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/食器棚_フルオーダー1.jpg",
    alt: "食器棚 フルオーダー 1",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/食器棚_フルオーダー2.jpg",
    alt: "食器棚 フルオーダー 2",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/食器棚_フルオーダー3.jpg",
    alt: "食器棚 フルオーダー 3",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/食器棚_フルオーダー4.jpg",
    alt: "食器棚 フルオーダー 4",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/テレビボード_マージンキャビネット.jpg",
    alt: "テレビボード マージンキャビネット",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/テレビボード_フロートTVボード1.jpg",
    alt: "テレビボード フロートTVボード 1",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/テレビボード_フロートTVボード2.jpg",
    alt: "テレビボード フロートTVボード 2",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/テレビボード_フロートTVボード照明付き1.jpg",
    alt: "テレビボード フロートTVボード照明付き 1",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/テレビボード_フロートTVボード照明付き2.jpg",
    alt: "テレビボード フロートTVボード照明付き 2",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/壁面収納_壁面収納1.jpg",
    alt: "壁面収納 1",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/壁面収納_壁面収納2.jpg",
    alt: "壁面収納 2",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/壁面収納_壁面全面セミTVボード1.jpg",
    alt: "壁面収納 壁面全面セミTVボード 1",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/壁面収納_壁面全面セミTVボード2.jpg",
    alt: "壁面収納 壁面全面セミTVボード 2",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/壁面収納_下駄箱.jpg",
    alt: "壁面収納 下駄箱",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/カウンター下収納_フルオーダー1.jpg",
    alt: "カウンター下収納 フルオーダー 1",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/カウンター下収納_フルオーダー2.jpg",
    alt: "カウンター下収納 フルオーダー 2",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/カウンター下収納_すきまくん1.jpg",
    alt: "カウンター下収納 すきまくん 1",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/カウンター下収納_すきまくん2.jpg",
    alt: "カウンター下収納 すきまくん 2",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/洗濯機上吊戸棚_TE-SN2012.jpg",
    alt: "洗濯機上吊戸棚 TE-SN2012",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/洗濯機上吊戸棚_TJ-509K.jpg",
    alt: "洗濯機上吊戸棚 TJ-509K",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/洗濯機上吊戸棚_TX-5902G.jpg",
    alt: "洗濯機上吊戸棚 TX-5902G",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/洗濯機上吊戸棚_オープン.jpg",
    alt: "洗濯機上吊戸棚 オープン",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/洗濯機上吊戸棚_ハンガーパイプ.jpg",
    alt: "洗濯機上吊戸棚 ハンガーパイプ",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/ミラー_ブロンズミラー.jpg",
    alt: "ミラー ブロンズミラー",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/ミラー_アーチ加工.jpg",
    alt: "ミラー アーチ加工",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/ミラー_特殊加工.jpg",
    alt: "ミラー 特殊加工",
    category: "オーダー家具",
  },
  { src: "/images/order-furniture/ミラー_ドア.jpg", alt: "ミラー ドア", category: "オーダー家具" },
  { src: "/images/order-furniture/ミラー_LD柱.jpg", alt: "ミラー LD柱", category: "オーダー家具" },
  { src: "/images/order-furniture/ミラー_玄関.jpg", alt: "ミラー 玄関", category: "オーダー家具" },
  {
    src: "/images/order-furniture/ワードローブA.jpg",
    alt: "ワードローブA",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/L字キッチンボードフルオーダー.jpg",
    alt: "L字キッチンボード フルオーダー",
    category: "オーダー家具",
  },
  {
    src: "/images/order-furniture/Panasonicフレームシェルフ.jpg",
    alt: "Panasonic フレームシェルフ",
    category: "オーダー家具",
  },
];

// フロアコーティング画像
const floorCoatingImages: GalleryImage[] = [
  { src: "/images/floor-coating/ガラス1.jpg", alt: "ガラス 1", category: "フロアコーティング" },
  { src: "/images/floor-coating/ガラス2.jpg", alt: "ガラス 2", category: "フロアコーティング" },
  { src: "/images/floor-coating/ガラス3.jpg", alt: "ガラス 3", category: "フロアコーティング" },
  { src: "/images/floor-coating/シリコン1.jpg", alt: "シリコン 1", category: "フロアコーティング" },
  { src: "/images/floor-coating/シリコン2.jpg", alt: "シリコン 2", category: "フロアコーティング" },
  {
    src: "/images/floor-coating/セラミック中光沢1.jpg",
    alt: "セラミック中光沢 1",
    category: "フロアコーティング",
  },
  {
    src: "/images/floor-coating/セラミック中光沢2.jpg",
    alt: "セラミック中光沢 2",
    category: "フロアコーティング",
  },
  {
    src: "/images/floor-coating/セラミック微光沢1.jpg",
    alt: "セラミック微光沢 1",
    category: "フロアコーティング",
  },
  {
    src: "/images/floor-coating/セラミック微光沢2.jpg",
    alt: "セラミック微光沢 2",
    category: "フロアコーティング",
  },
  {
    src: "/images/floor-coating/セラミック微光沢3.jpg",
    alt: "セラミック微光沢 3",
    category: "フロアコーティング",
  },
  {
    src: "/images/floor-coating/セラミック高光沢1.jpg",
    alt: "セラミック高光沢 1",
    category: "フロアコーティング",
  },
  {
    src: "/images/floor-coating/セラミック高光沢2.jpg",
    alt: "セラミック高光沢 2",
    category: "フロアコーティング",
  },
  {
    src: "/images/floor-coating/セラミック高光沢3.jpg",
    alt: "セラミック高光沢 3",
    category: "フロアコーティング",
  },
  { src: "/images/floor-coating/大理石.jpg", alt: "大理石", category: "フロアコーティング" },
  { src: "/images/floor-coating/洗面CF.jpg", alt: "洗面CF", category: "フロアコーティング" },
];

// カーテン画像
const curtainImages: GalleryImage[] = [
  { src: "/images/curtain/LDシェード2.jpg", alt: "LDシェード 2", category: "カーテン" },
  { src: "/images/curtain/LDシェード3.jpg", alt: "LDシェード 3", category: "カーテン" },
  {
    src: "/images/curtain/LDバーチカルブラインド1.jpg",
    alt: "LDバーチカルブラインド",
    category: "カーテン",
  },
  {
    src: "/images/curtain/TOSO_ウッドブラインド　TM-2504.jpg",
    alt: "TOSO ウッドブラインド TM-2504",
    category: "カーテン",
  },
  {
    src: "/images/curtain/アルペジオ_フェスタⅡ.jpg",
    alt: "アルペジオ フェスタII",
    category: "カーテン",
  },
  { src: "/images/curtain/シェード掃出し窓.jpg", alt: "シェード掃出し窓", category: "カーテン" },
  { src: "/images/curtain/シェード腰窓.jpg", alt: "シェード腰窓", category: "カーテン" },
  {
    src: "/images/curtain/タチカワ_ルミエシャリエアイボリーRS108.jpg",
    alt: "タチカワ ルミエシャリエ アイボリー RS108",
    category: "カーテン",
  },
  {
    src: "/images/curtain/ロールスクリーン2連.jpg",
    alt: "ロールスクリーン 2連",
    category: "カーテン",
  },
  { src: "/images/curtain/木製ブラインド.jpg", alt: "木製ブラインド", category: "カーテン" },
];

// バルコニータイル画像
const balconyTileImages: GalleryImage[] = [
  {
    src: "/images/balcony-tile/MUシリーズ300_ベイクベージュ.jpg",
    alt: "MUシリーズ300 ベイクベージュ",
    category: "バルコニータイル",
  },
  {
    src: "/images/balcony-tile/クレガーレ_スムーズタイル_ラスティックグレー.jpg",
    alt: "クレガーレ スムーズタイル ラスティックグレー",
    category: "バルコニータイル",
  },
  {
    src: "/images/balcony-tile/クレガーレ_リンクトーン_ダークブラウン1.jpg",
    alt: "クレガーレ リンクトーン ダークブラウン 1",
    category: "バルコニータイル",
  },
  {
    src: "/images/balcony-tile/クレガーレ_リンクトーン_ダークブラウン2.jpg",
    alt: "クレガーレ リンクトーン ダークブラウン 2",
    category: "バルコニータイル",
  },
  {
    src: "/images/balcony-tile/バーセアMB (1).jpg",
    alt: "バーセア MB",
    category: "バルコニータイル",
  },
  {
    src: "/images/balcony-tile/バーセアMU (1).jpg",
    alt: "バーセア MU",
    category: "バルコニータイル",
  },
  {
    src: "/images/balcony-tile/バーセア_ベイクベージュ150・300.jpg",
    alt: "バーセア ベイクベージュ 150・300",
    category: "バルコニータイル",
  },
];

// 住宅設備画像
const equipmentImages: GalleryImage[] = [
  { src: "/images/equipment/エアコン.jpg", alt: "エアコン", category: "住宅設備" },
  { src: "/images/equipment/コーニス証明.jpg", alt: "コーニス証明", category: "住宅設備" },
  {
    src: "/images/equipment/シーリングライト_artworkstudio.jpg",
    alt: "シーリングライト artworkstudio",
    category: "住宅設備",
  },
  {
    src: "/images/equipment/シーリングライト_オーデリック1.jpg",
    alt: "シーリングライト オーデリック 1",
    category: "住宅設備",
  },
  {
    src: "/images/equipment/シーリングライト_オーデリック2.jpg",
    alt: "シーリングライト オーデリック 2",
    category: "住宅設備",
  },
  { src: "/images/equipment/ダウンライト1.jpg", alt: "ダウンライト 1", category: "住宅設備" },
  { src: "/images/equipment/ダウンライト2.jpg", alt: "ダウンライト 2", category: "住宅設備" },
  { src: "/images/equipment/ダクトレール1.jpg", alt: "ダクトレール 1", category: "住宅設備" },
  { src: "/images/equipment/ダクトレール2.jpg", alt: "ダクトレール 2", category: "住宅設備" },
  {
    src: "/images/equipment/室外カバーブラック.jpg",
    alt: "室外カバー ブラック",
    category: "住宅設備",
  },
  { src: "/images/equipment/TVボード1.jpg", alt: "TVボード 1", category: "住宅設備" },
  { src: "/images/equipment/TVボード2.jpg", alt: "TVボード 2", category: "住宅設備" },
  { src: "/images/equipment/プロジェクター1.jpg", alt: "プロジェクター1", category: "住宅設備" },
  { src: "/images/equipment/プロジェクター2.jpg", alt: "プロジェクター2", category: "住宅設備" },
  { src: "/images/equipment/浴室テレビ.jpg", alt: "浴室テレビ", category: "住宅設備" },
  {
    src: "/images/equipment/ビルトインオーブン1.jpg",
    alt: "ビルトインオーブン 1",
    category: "住宅設備",
  },
  {
    src: "/images/equipment/ビルトインオーブン2.jpg",
    alt: "ビルトインオーブン 2",
    category: "住宅設備",
  },
  { src: "/images/equipment/人感センサー.jpg", alt: "人感センサー", category: "住宅設備" },
  { src: "/images/equipment/配線モール工事.jpg", alt: "配線モール工事", category: "住宅設備" },
  { src: "/images/equipment/食洗機.jpg", alt: "食洗機", category: "住宅設備" },
];

// その他画像
const otherImages: GalleryImage[] = [
  { src: "/images/others/アクセントクロス1.jpg", alt: "アクセントクロス 1", category: "その他" },
  { src: "/images/others/アクセントクロス2.jpg", alt: "アクセントクロス 2", category: "その他" },
  { src: "/images/others/アクセントクロス3.jpg", alt: "アクセントクロス 3", category: "その他" },
  { src: "/images/others/アクセントクロス4.jpg", alt: "アクセントクロス 4", category: "その他" },
  {
    src: "/images/others/アクセントクロス×ミラー.jpg",
    alt: "アクセントクロス×ミラー",
    category: "その他",
  },
  {
    src: "/images/others/アクセントクロス天井1.jpg",
    alt: "アクセントクロス天井 1",
    category: "その他",
  },
  {
    src: "/images/others/アクセントクロス天井2.jpg",
    alt: "アクセントクロス天井 2",
    category: "その他",
  },
  {
    src: "/images/others/アクセントクロス天井3.jpg",
    alt: "アクセントクロス天井 3",
    category: "その他",
  },
  { src: "/images/others/ガラスシェルフ.jpg", alt: "ガラスシェルフ", category: "その他" },
  { src: "/images/others/キャットウォーク.jpg", alt: "キャットウォーク", category: "その他" },
  { src: "/images/others/コート掛け.jpg", alt: "コート掛け", category: "その他" },
  { src: "/images/others/ハンギングバー1.jpg", alt: "ハンギングバー 1", category: "その他" },
  { src: "/images/others/ハンギングバー2.jpg", alt: "ハンギングバー 2", category: "その他" },
  { src: "/images/others/パネル1.jpg", alt: "パネル 1", category: "その他" },
  { src: "/images/others/パネル2.jpg", alt: "パネル 2", category: "その他" },
  { src: "/images/others/パネル3.jpg", alt: "パネル 3", category: "その他" },
  { src: "/images/others/ピクチャーレール.jpg", alt: "ピクチャーレール", category: "その他" },
  { src: "/images/others/モザイクタイル1.jpg", alt: "モザイクタイル 1", category: "その他" },
  { src: "/images/others/モザイクタイル2.jpg", alt: "モザイクタイル 2", category: "その他" },
  { src: "/images/others/モザイクタイル3.jpg", alt: "モザイクタイル 3", category: "その他" },
  { src: "/images/others/モザイクタイル4.jpg", alt: "モザイクタイル 4", category: "その他" },
  { src: "/images/others/ヴィータス棚板1.jpg", alt: "ヴィータス棚板 1", category: "その他" },
  { src: "/images/others/ヴィータス棚板2.jpg", alt: "ヴィータス棚板 2", category: "その他" },
  { src: "/images/others/可変棚1.jpg", alt: "可変棚 1", category: "その他" },
  { src: "/images/others/可変棚2.jpg", alt: "可変棚 2", category: "その他" },
  { src: "/images/others/可変棚3.jpg", alt: "可変棚 3", category: "その他" },
  { src: "/images/others/固定棚.jpg", alt: "固定棚", category: "その他" },
  { src: "/images/others/手すり1.jpg", alt: "手すり 1", category: "その他" },
  { src: "/images/others/手すり2.jpg", alt: "手すり 2", category: "その他" },
  { src: "/images/others/手すり3.jpg", alt: "手すり 3", category: "その他" },
  { src: "/images/others/浴室扉タオル掛け.jpg", alt: "浴室扉タオル掛け", category: "その他" },
  { src: "/images/others/窓ガラスフィルム.jpg", alt: "窓ガラスフィルム", category: "その他" },
  { src: "/images/others/紙巻き1.jpg", alt: "紙巻き 1", category: "その他" },
  { src: "/images/others/紙巻き2.jpg", alt: "紙巻き 2", category: "その他" },
];

export const images: GalleryImage[] = [
  ...ecocaratImages,
  ...orderFurnitureImages,
  ...floorCoatingImages,
  ...curtainImages,
  ...balconyTileImages,
  ...equipmentImages,
  ...otherImages,
];
