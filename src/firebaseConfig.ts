import * as firebaseApp from "firebase/app";
import { getDatabase } from "firebase/database";

// =========================
// === 【重要】設定してください ===
// =========================
// 1. Firebaseコンソール (https://firebase.google.com/) でプロジェクトを作成します。
// 2. プロジェクト設定 >「全般」タブを開きます。
// 3.「マイアプリ」でウェブアプリ (</>) を登録し、表示される firebaseConfig オブジェクトをコピーします。
// 4. 下のプレースホルダーの値を、コピーしたご自身の情報に置き換えてください。
//
// 詳しい手順: https://firebase.google.com/docs/web/setup
// =========================

const firebaseConfig = {
  apiKey: "AIzaSyCZ9nv9k2ukukZbX8jA4n6wWXpGS2-dZWZU",
  authDomain: "sacrament-schedule-app.firebaseapp.com",
  databaseURL: "https://sacrament-schedule-app-default-rtdb.firebaseio.com",
  projectId: "sacrament-schedule-app",
  storageBucket: "sacrament-schedule-app.appspot.com",
  messagingSenderId: "64664419211",
  appId: "1:64664419211:web:737f3ac540abfe6406cd8e"
};

// Firebaseを初期化
const app = firebaseApp.initializeApp(firebaseConfig);

// Realtime Databaseのインスタンスを取得してエクスポート
export const db = getDatabase(app);