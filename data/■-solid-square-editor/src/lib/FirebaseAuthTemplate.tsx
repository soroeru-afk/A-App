import React, { useState, useEffect } from 'react';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// ==========================================
// 1. Firebase 初期化設定
// ==========================================
// 💡 configはプロジェクトの環境に合わせて適宜書き換えてください。
// 例: import firebaseConfig from '../firebase-applet-config.json';
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "",
  firestoreDatabaseId: import.meta.env?.VITE_FIREBASE_FIRESTORE_DB_ID || "(default)"
};

// 2重初期化防止
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// ==========================================
// 2. OFUSE ポップアップ起動用ヘルパー関数
// ==========================================
/**
 * 指定したOFUSEのURLを別窓のポップアップで開きます。
 * @param url OFUSEの支援ページURL
 */
export const openOfusePopup = (url: string = "https://ofuse.me/984c8ae2") => {
  window.open(url, 'payment', 'width=500,height=750,scrollbars=yes');
};

// ==========================================
// 3. Firebase Auth カスタムフック (状態管理用)
// ==========================================
export interface UserProfile {
  displayName: string;
  email: string;
}

export function useFirebaseAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            const initialData = {
              email: user.email || "",
              displayName: user.displayName || 'Creator',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            await setDoc(userRef, initialData);
            setUserProfile({ displayName: initialData.displayName, email: initialData.email });
          } else {
            const data = userSnap.data();
            setUserProfile({ 
              displayName: data.displayName || "", 
              email: data.email || "" 
            });
          }
        } catch (e) {
          console.error("Error setting up user profile", e);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Auth error", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  const updateDisplayName = async (newDisplayName: string) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: newDisplayName,
        updatedAt: serverTimestamp()
      });
      setUserProfile(prev => prev ? { ...prev, displayName: newDisplayName } : null);
    } catch (e) {
      console.error("Failed to update profile", e);
      throw e;
    }
  };

  return {
    currentUser,
    userProfile,
    loading,
    handleSignIn,
    handleSignOut,
    updateDisplayName
  };
}

// ==========================================
// 4. 右上の認証UI・DONATEボタンコンポーネント
// ==========================================
interface FirebaseAuthUIProps {
  donateUrl?: string;
  onOpenProfile?: () => void; // ユーザー名クリック時のイベント（任意）
}

export const FirebaseAuthUI: React.FC<FirebaseAuthUIProps> = ({ 
  donateUrl = "https://ofuse.me/984c8ae2",
  onOpenProfile
}) => {
  const { currentUser, userProfile, handleSignIn, handleSignOut } = useFirebaseAuth();
  const [showBillingPopup, setShowBillingPopup] = useState(false);

  return (
    <div className="auth-ui">
      {currentUser ? (
        <>
          <div 
            className="auth-user-name" 
            title="PROFILE & SETTINGS" 
            onClick={onOpenProfile} 
            style={{ cursor: onOpenProfile ? 'pointer' : 'default' }}
          >
            {userProfile?.displayName || currentUser.displayName || 'USER'}
          </div>
          <div 
            className="sign-up-wrap"
            onMouseEnter={() => setShowBillingPopup(true)}
            onMouseLeave={() => setShowBillingPopup(false)}
          >
            <button 
              className="auth-btn sign-up" 
              onClick={(e) => {
                openOfusePopup(donateUrl);
                e.preventDefault();
              }}
            >
              DONATE
            </button>
            <div className={`auth-popup ${showBillingPopup ? 'show' : ''}`}>
              OFUSEで開発者を支援・応援します
            </div>
          </div>
          <button className="auth-btn" onClick={handleSignOut}>SIGN OUT</button>
        </>
      ) : (
        <>
          <div 
            className="sign-up-wrap"
            onMouseEnter={() => setShowBillingPopup(true)}
            onMouseLeave={() => setShowBillingPopup(false)}
          >
            <button className="auth-btn sign-up" onClick={handleSignIn}>SIGN UP</button>
            <div className={`auth-popup ${showBillingPopup ? 'show' : ''}`}>Googleアカウントで登録・ログインします</div>
          </div>
          <button className="auth-btn sign-in" onClick={handleSignIn}>SIGN IN</button>
        </>
      )}
    </div>
  );
};
