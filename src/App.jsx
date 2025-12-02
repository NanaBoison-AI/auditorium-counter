import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Save, Settings, Users, LayoutGrid, RotateCcw, 
  ChevronRight, Calculator, Armchair, FolderOpen, X, Calendar, 
  Check, FileBox, Download, Lock, Unlock, LogOut, Shield, 
  KeyRound, User, UserCog, Play, Power, Building2, Loader2, Wifi,
  UserPlus
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
// Ensure you have installed: npm install firebase
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInAnonymously, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  serverTimestamp,
  orderBy,
  setDoc
} from "firebase/firestore";

// --- FIREBASE CONFIGURATION ---
// ⚠️ PASTE YOUR CONFIG FROM FIREBASE CONSOLE HERE ⚠️
const firebaseConfig = {
  apiKey: "AIzaSyCI2WUsO5X5yPu80FCx6sY0bxEM9mwhyWs",
  authDomain: "auditoriumcounter.firebaseapp.com",
  projectId: "auditoriumcounter",
  storageBucket: "auditoriumcounter.firebasestorage.app",
  messagingSenderId: "520683229850",
  appId: "1:520683229850:web:9137ecbe5df093b85e4523"
};


// Initialize Firebase (Singleton pattern to prevent re-init)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- HELPER HOOK FOR DEBOUNCING FIRESTORE WRITES ---
const useDebounceWrite = (fn, delay) => {
  const timeoutRef = useRef(null);
  return (...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

// --- LOGIN VIEW ---
const LoginView = ({ 
  emailInput, setEmailInput, 
  passwordInput, setPasswordInput,
  orgInput, setOrgInput, 
  passcodeInput, setPasscodeInput,
  handleAdminLogin, handleAdminRegister, handleCounterLogin, 
  loading, error 
}) => {
  const [activeTab, setActiveTab] = useState('counter'); 
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in">
        <div className="bg-slate-900 p-8 text-center relative">
          <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Calculator className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Auditorium Counter</h1>
          <p className="text-slate-400 text-sm">Cloud Sync Enabled <Wifi size={12} className="inline ml-1"/></p>
        </div>
        
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => { setActiveTab('counter'); }}
            className={`flex-1 py-4 text-sm font-medium transition ${activeTab === 'counter' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Counter Login
          </button>
          <button 
            onClick={() => { setActiveTab('admin'); setIsRegistering(false); }}
            className={`flex-1 py-4 text-sm font-medium transition ${activeTab === 'admin' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Admin Login
          </button>
        </div>

        <div className="p-8">
          <div className="mb-6 text-center">
            {activeTab === 'counter' ? (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <User size={32} className="text-emerald-600" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                {isRegistering ? <UserPlus size={32} className="text-slate-700" /> : <UserCog size={32} className="text-slate-700" />}
              </div>
            )}
            <h2 className="text-lg font-bold text-slate-800">
              {activeTab === 'counter' ? 'Staff Entry' : (isRegistering ? 'Create Admin Account' : 'Administrator Entry')}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'counter' ? 'Enter Event details' : (isRegistering ? 'Register to manage events' : 'Log in with your admin account')}
            </p>
          </div>

          <div className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>}
            
            {activeTab === 'counter' ? (
              <>
                <input 
                  type="text"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Organization Name"
                  value={orgInput}
                  onChange={(e) => setOrgInput(e.target.value)}
                />
                 <input 
                  type="text"
                  inputMode="numeric"
                  className="w-full text-center text-xl tracking-widest py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  placeholder="Passcode"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCounterLogin()}
                />
                 <button 
                  onClick={handleCounterLogin}
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><KeyRound size={18} /> Join Event</>}
                </button>
              </>
            ) : (
              <>
                <input 
                  type="email"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Admin Email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <input 
                  type="password"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (isRegistering ? handleAdminRegister() : handleAdminLogin())}
                />
                 <button 
                  onClick={isRegistering ? handleAdminRegister : handleAdminLogin}
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (isRegistering ? <><UserPlus size={18} /> Create Account</> : <><KeyRound size={18} /> Admin Login</>)}
                </button>
                
                <div className="text-center pt-2">
                  <button 
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                  >
                    {isRegistering ? "Already have an account? Log in" : "Need an account? Create one"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  // Auth State
  const [user, setUser] = useState(null); // Firebase User Object
  const [role, setRole] = useState(null); // 'admin' | 'counter'
  const [loading, setLoading] = useState(true);
  
  // App Data State (Synced from Firestore)
  const [adminSettings, setAdminSettings] = useState({ orgName: 'My Organization' });
  const [blocks, setBlocks] = useState([]);
  const [extras, setExtras] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  
  // Saved Lists (Firestore Collections)
  const [savedLayouts, setSavedLayouts] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]); // For review mode

  // UI State
  const [mode, setMode] = useState('setup'); 
  const [loginError, setLoginError] = useState('');
  
  // Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginOrg, setLoginOrg] = useState('');
  const [loginCode, setLoginCode] = useState('');

  // Setup Inputs
  const [newBlock, setNewBlock] = useState({ name: '', rows: '', seatsPerRow: '' });
  const [newExtra, setNewExtra] = useState({ name: '' });
  
  // Admin Start Session Inputs
  const [sessionNameInput, setSessionNameInput] = useState('');
  const [sessionPasscodeInput, setSessionPasscodeInput] = useState('');

  // Modals
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [isStartSessionModalOpen, setIsStartSessionModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [layoutNameInput, setLayoutNameInput] = useState('');
  const [newOrgName, setNewOrgName] = useState('');

  // --- AUTH LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        
        // Determine Role based on Auth Type
        if (!currentUser.isAnonymous) {
          // It's an Admin (Email/Pass)
          setRole('admin');
          setMode('setup');
          // Fetch Admin Settings
          const docRef = doc(db, 'settings', currentUser.uid);
          // Note: In a real app we'd fetch settings here, using default for now
        } else {
          // It's a Counter (Anonymous)
          setRole('counter');
          setMode('counting');
        }
      } else {
        setUser(null);
        setRole(null);
        setActiveSession(null);
        setBlocks([]);
        setExtras([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- DATA LISTENERS ---

  // 1. ADMIN: Listen to Saved Layouts
  useEffect(() => {
    if (role === 'admin' && user) {
      const q = query(collection(db, 'layouts'), where('adminId', '==', user.uid), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snapshot) => {
        const layouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSavedLayouts(layouts);
      });
      return () => unsub();
    }
  }, [role, user]);

  // 2. ADMIN: Listen to their own Settings (Org Name)
  useEffect(() => {
    if (role === 'admin' && user) {
      const unsub = onSnapshot(doc(db, 'settings', user.uid), (doc) => {
        if (doc.exists()) {
          setAdminSettings(doc.data());
        } else {
          // Initialize defaults if not exists
          setDoc(doc.ref, { orgName: 'My Organization' }, { merge: true }).catch(() => {});
        }
      });
      return () => unsub();
    }
  }, [role, user]);

  // 3. ADMIN & COUNTER: Listen to ACTIVE SESSION (Event)
  useEffect(() => {
    // If Admin, check if they have an active event running
    // If Counter, they are already linked to an event via login logic logic below
    let unsub;

    if (role === 'admin' && user) {
      // Find event where adminId == me AND status == active
      const q = query(collection(db, 'events'), where('adminId', '==', user.uid), where('status', '==', 'active'));
      unsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const docData = snapshot.docs[0];
          const event = { id: docData.id, ...docData.data() };
          setActiveSession(event);
          setBlocks(event.blocks || []);
          setExtras(event.extras || []);
        } else {
          setActiveSession(null);
          // If no active session, Admin sees their Draft setup? 
          // For simplicity in this firebase transition, Admin clears when session ends.
          // Or we could have a 'draft' collection. Leaving clean for now.
        }
      });
    } 
    else if (role === 'counter' && activeSession?.id) {
      // Counter already has the ID from the login step, just listen to it
      unsub = onSnapshot(doc(db, 'events', activeSession.id), (doc) => {
        if (doc.exists() && doc.data().status === 'active') {
          const event = { id: doc.id, ...doc.data() };
          setActiveSession(event);
          setBlocks(event.blocks || []);
          setExtras(event.extras || []);
        } else {
          // Event ended or deleted
          alert("The event has ended.");
          auth.signOut();
        }
      });
    }

    return () => { if (unsub) unsub(); };
  }, [role, user, activeSession?.id]); // Re-run if role changes or counter gets an ID


  // --- ACTIONS: AUTH ---

  const handleAdminLogin = async () => {
    setLoading(true);
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPass);
    } catch (err) {
      setLoginError("Login failed: " + err.message);
      setLoading(false);
    }
  };

  const handleAdminRegister = async () => {
    setLoading(true);
    setLoginError('');
    try {
      await createUserWithEmailAndPassword(auth, loginEmail, loginPass);
      // Auth state listener will handle the rest
    } catch (err) {
      setLoginError("Registration failed: " + err.message);
      setLoading(false);
    }
  };

  const handleCounterLogin = async () => {
    setLoading(true);
    setLoginError('');
    try {
      // 1. Query for the event
      const q = query(
        collection(db, 'events'), 
        where('orgName', '==', loginOrg), 
        where('passcode', '==', loginCode),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error("No active event found with these details.");
      }

      const eventDoc = snapshot.docs[0];
      const eventData = { id: eventDoc.id, ...eventDoc.data() };

      // 2. Sign in Anonymously
      await signInAnonymously(auth);
      
      // 3. Set local state so the Listener picks it up
      setActiveSession(eventData);

    } catch (err) {
      setLoginError(err.message);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  // --- ACTIONS: ADMIN SETUP ---

  // NOTE: In this Firebase version, "Setup" for Admin modifies a Local State 
  // until they hit "Start Event". 
  // Ideally, we'd save this to a 'drafts' collection so they don't lose it on refresh.
  // For this implementation, I will save Admin Setup to `localStorage` just like before,
  // BUT `Start Event` will push it to Firestore.

  const addBlock = () => {
    if (!newBlock.name || !newBlock.rows || !newBlock.seatsPerRow) return;
    const rows = parseInt(newBlock.rows);
    const id = Date.now();
    setBlocks([...blocks, { 
      id, name: newBlock.name, rows, seatsPerRow: parseInt(newBlock.seatsPerRow),
      counts: Array(rows).fill(0) 
    }]);
    setNewBlock({ name: '', rows: '', seatsPerRow: '' });
  };

  const removeBlock = (id) => setBlocks(blocks.filter(b => b.id !== id));
  
  const addExtra = () => {
    if (!newExtra.name) return;
    setExtras([...extras, { id: Date.now(), name: newExtra.name, count: 0 }]);
    setNewExtra({ name: '' });
  };

  const removeExtra = (id) => setExtras(extras.filter(e => e.id !== id));

  // --- ACTIONS: SESSION MANAGEMENT ---

  const handleStartSession = async () => {
    if (!sessionNameInput || !sessionPasscodeInput) return;
    
    try {
      // Create new Event Document
      const newEvent = {
        adminId: user.uid,
        orgName: adminSettings.orgName,
        name: sessionNameInput,
        passcode: sessionPasscodeInput,
        status: 'active',
        isLocked: false,
        createdAt: serverTimestamp(),
        blocks: blocks, // The current setup
        extras: extras
      };

      await addDoc(collection(db, 'events'), newEvent);
      setIsStartSessionModalOpen(false);
      setMode('counting');
      setSessionNameInput('');
      setSessionPasscodeInput('');
    } catch (e) {
      alert("Error starting event: " + e.message);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    if (window.confirm("End event? Counters will be logged out.")) {
      try {
        await updateDoc(doc(db, 'events', activeSession.id), {
          status: 'completed',
          endedAt: serverTimestamp()
        });
        setMode('setup');
        // Clear local blocks to allow new setup
        setBlocks([]);
        setExtras([]);
      } catch (e) {
        alert("Error ending session: " + e.message);
      }
    }
  };

  const toggleLock = async () => {
    if (!activeSession) return;
    try {
      await updateDoc(doc(db, 'events', activeSession.id), {
        isLocked: !activeSession.isLocked
      });
    } catch (e) {
      console.error("Lock toggle failed", e);
    }
  };

  // --- ACTIONS: COUNTING (REAL-TIME WRITES) ---

  // We debounce these updates to avoid hammering Firestore
  const debouncedUpdateBlock = useDebounceWrite(async (eventId, newBlocks) => {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, { blocks: newBlocks });
  }, 500);

  const updateBlockCount = (blockId, rowIndex, value) => {
    if (activeSession?.isLocked) return;
    
    // Optimistic Update (UI updates immediately)
    const val = value === '' ? 0 : parseInt(value);
    const newBlocks = blocks.map(b => {
      if (b.id === blockId) {
        const newCounts = [...b.counts];
        newCounts[rowIndex] = Math.max(0, val);
        return { ...b, counts: newCounts };
      }
      return b;
    });
    setBlocks(newBlocks);

    // Persist to Firestore
    if (activeSession) {
      debouncedUpdateBlock(activeSession.id, newBlocks);
    }
  };

  const debouncedUpdateExtras = useDebounceWrite(async (eventId, newExtras) => {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, { extras: newExtras });
  }, 500);

  const updateExtraCount = (extraId, value) => {
    if (activeSession?.isLocked) return;

    const val = value === '' ? 0 : parseInt(value);
    const newExtras = extras.map(e => {
      if (e.id === extraId) {
        return { ...e, count: Math.max(0, val) };
      }
      return e;
    });
    setExtras(newExtras);

    if (activeSession) {
      debouncedUpdateExtras(activeSession.id, newExtras);
    }
  };

  // --- ACTIONS: TEMPLATES ---

  const handleSaveLayout = async () => {
    if (!layoutNameInput.trim()) return;
    // Strip counts
    const cleanBlocks = blocks.map(({ id, name, rows, seatsPerRow }) => ({ id, name, rows, seatsPerRow }));
    const cleanExtras = extras.map(({ id, name }) => ({ id, name }));
    
    try {
      await addDoc(collection(db, 'layouts'), {
        adminId: user.uid,
        name: layoutNameInput,
        createdAt: serverTimestamp(),
        blocks: cleanBlocks,
        extras: cleanExtras
      });
      setLayoutNameInput('');
      alert("Template saved to cloud.");
    } catch (e) {
      alert("Error saving template: " + e.message);
    }
  };

  const handleLoadLayout = (layout) => {
    if (activeSession) {
      alert("Cannot load template while event is active.");
      return;
    }
    // Reconstitute with IDs and zero counts
    const newBlocks = layout.blocks.map(b => ({
      ...b, id: Date.now() + Math.random(), counts: Array(b.rows).fill(0)
    }));
    const newExtras = layout.extras.map(e => ({
      ...e, id: Date.now() + Math.random(), count: 0
    }));
    setBlocks(newBlocks);
    setExtras(newExtras);
    setIsLayoutModalOpen(false);
  };

  const handleDeleteLayout = async (id) => {
    if (window.confirm("Delete this template?")) {
      await deleteDoc(doc(db, 'layouts', id));
    }
  };

  const handleUpdateSecurity = async () => {
    if (newOrgName.trim()) {
      try {
        const settingsRef = doc(db, 'settings', user.uid);
        // We use setDoc with merge:true in case it doesnt exist, but here we just used updateDoc in logic
        // Let's safe bet with setDoc pattern or just updateDoc if we know it exists
        // Simplest for now:
        await updateDoc(settingsRef, { orgName: newOrgName });
        alert("Organization Name updated.");
        setIsSecurityModalOpen(false);
      } catch (e) {
        alert("Failed to update: " + e.message);
      }
    }
  };

  // --- HELPERS ---
  const getBlockTotal = (block) => block.counts?.reduce((sum, val) => sum + (parseInt(val) || 0), 0) || 0;
  const getBlockCapacity = (block) => block.rows * block.seatsPerRow;
  const getExtrasTotal = () => extras.reduce((sum, extra) => sum + (parseInt(extra.count) || 0), 0);
  const getGrandTotal = () => blocks.reduce((sum, block) => sum + getBlockTotal(block), 0) + getExtrasTotal();

  // --- VIEW RENDERING ---

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 text-indigo-600"><Loader2 className="animate-spin" size={48} /></div>;
  }

  if (!user) {
    return (
      <LoginView 
        emailInput={loginEmail} setEmailInput={setLoginEmail}
        passwordInput={loginPass} setPasswordInput={setLoginPass}
        orgInput={loginOrg} setOrgInput={setLoginOrg}
        passcodeInput={loginCode} setPasscodeInput={setLoginCode}
        handleAdminLogin={handleAdminLogin}
        handleAdminRegister={handleAdminRegister} 
        handleCounterLogin={handleCounterLogin}
        loading={loading} error={loginError}
      />
    );
  }

  // --- ADMIN SETUP VIEW ---
  const renderSetupView = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
        <div>
          <h2 className="text-lg font-bold text-indigo-900">Auditorium Layout</h2>
          <p className="text-sm text-indigo-600">Prepare your layout below.</p>
        </div>
        <button 
          onClick={() => setIsLayoutModalOpen(true)}
          className="bg-white text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-100 transition flex items-center gap-2 font-medium shadow-sm"
        >
          <FileBox size={18} /> Manage Templates
        </button>
      </div>

      {/* Block Setup Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center"><LayoutGrid className="w-5 h-5 mr-2 text-indigo-600" /> Define Seating Blocks</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input type="text" placeholder="Block Name" className="border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={newBlock.name} onChange={(e) => setNewBlock({...newBlock, name: e.target.value})} />
          <input type="number" placeholder="Rows" className="border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={newBlock.rows} onChange={(e) => setNewBlock({...newBlock, rows: e.target.value})} />
          <input type="number" placeholder="Seats per Row" className="border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={newBlock.seatsPerRow} onChange={(e) => setNewBlock({...newBlock, seatsPerRow: e.target.value})} />
          <button onClick={addBlock} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"><Plus size={18} /> Add</button>
        </div>
        {blocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{blocks.map(b => (
            <div key={b.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between">
              <div><h3 className="font-bold text-slate-700">{b.name}</h3><p className="text-sm text-slate-500">{b.rows}x{b.seatsPerRow}</p></div>
              <button onClick={() => removeBlock(b.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
            </div>
          ))}</div>
        ) : <div className="text-center py-8 text-slate-400 border border-dashed rounded-lg">No blocks defined.</div>}
      </div>

      {/* Extras Setup Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center"><Users className="w-5 h-5 mr-2 text-emerald-600" /> Define Other Areas</h2>
        <div className="flex gap-4 mb-6">
          <input type="text" placeholder="Area Name" className="flex-1 border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500" value={newExtra.name} onChange={(e) => setNewExtra({...newExtra, name: e.target.value})} />
          <button onClick={addExtra} className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"><Plus size={18} /> Add</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{extras.map(e => (
          <div key={e.id} className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex justify-between"><span className="font-medium text-emerald-900">{e.name}</span><button onClick={() => removeExtra(e.id)} className="text-emerald-400 hover:text-red-500"><Trash2 size={18} /></button></div>
        ))}</div>
      </div>
    </div>
  );

  // --- COUNTING VIEW ---
  const renderCountingView = () => {
    const totalCount = getGrandTotal();
    const capacity = getTotalCapacity();
    const percentage = capacity > 0 ? Math.round((totalCount / capacity) * 100) : 0;
    const isLocked = activeSession?.isLocked;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1 flex items-center gap-2">Total Attendance {isLocked && <Lock size={14} className="text-red-400" />}</h2>
            <div className="text-5xl font-bold font-mono tracking-tight">{totalCount.toLocaleString()}</div>
            {capacity > 0 && <div className="text-slate-400 text-sm mt-2">Capacity: {capacity.toLocaleString()} ({percentage}% full)</div>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {blocks.map(block => (
            <div key={block.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div><h3 className="font-bold text-slate-800 flex items-center gap-2"><Armchair size={18} className="text-indigo-600" />{block.name}</h3></div>
                <div className="text-xl font-mono font-bold text-slate-700">{getBlockTotal(block)} <span className="text-xs text-slate-400">/ {getBlockCapacity(block)}</span></div>
              </div>
              <div className="p-4 overflow-y-auto max-h-[400px] flex-1">
                <div className="space-y-3">
                  {block.counts && block.counts.map((count, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="w-16 text-xs font-bold text-slate-400 uppercase">Row {idx + 1}</span>
                      <input 
                        type="number" min="0" disabled={isLocked}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        value={count || ''} placeholder="0"
                        onChange={(e) => updateBlockCount(block.id, idx, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {extras.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
              <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between"><h3 className="font-bold text-emerald-900 flex gap-2"><Users size={18}/>Other Areas</h3><div className="text-xl font-mono font-bold text-emerald-800">{getExtrasTotal()}</div></div>
              <div className="p-6 space-y-4">{extras.map(e => (
                <div key={e.id} className="flex justify-between gap-4 items-center">
                  <label className="text-sm font-medium text-slate-600 flex-1">{e.name}</label>
                  <input type="number" min="0" disabled={isLocked} className="w-24 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 font-mono text-right outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50" value={e.count || ''} placeholder="0" onChange={(evt) => updateExtraCount(e.id, evt.target.value)} />
                </div>
              ))}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- HEADER & NAVIGATION ---
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white"><Calculator size={20} /></div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 hidden sm:block">Auditorium Counter</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-500 font-medium">{role === 'admin' ? 'Administrator' : 'Counter Staff'}</p>
                {activeSession && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>{activeSession.name} ({activeSession.orgName})</span>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {role === 'admin' && !activeSession && (
              <button onClick={() => setIsStartSessionModalOpen(true)} className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 text-sm font-medium shadow-sm animate-pulse"><Play size={18} fill="currentColor" /><span className="hidden sm:inline">Start Event</span></button>
            )}
            
            {role === 'admin' && activeSession && (
               <button onClick={handleEndSession} className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition flex items-center gap-2 text-sm font-medium shadow-sm"><Power size={18} /><span className="hidden sm:inline">End Event</span></button>
            )}

            {role === 'admin' && activeSession && (
              <button onClick={toggleLock} className={`px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm font-medium shadow-sm border ${activeSession.isLocked ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-300 text-slate-700'}`}>
                {activeSession.isLocked ? <Unlock size={18} /> : <Lock size={18} />}<span className="hidden sm:inline">{activeSession.isLocked ? "Unlock" : "Lock"}</span>
              </button>
            )}

            {role === 'admin' && (
              <button onClick={() => setIsSecurityModalOpen(true)} className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition flex items-center gap-2 text-sm font-medium shadow-sm"><Shield size={18} /></button>
            )}
            
            <button onClick={handleLogout} className="ml-2 text-slate-400 hover:text-red-500 transition"><LogOut size={20} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {role === 'admin' && !activeSession ? renderSetupView() : renderCountingView()}
      </main>

      {/* --- MODALS --- */}
      
      {/* Start Session Modal */}
      {isStartSessionModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50"><h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2"><Play size={20}/> Start Live Event</h3><button onClick={() => setIsStartSessionModalOpen(false)}><X size={20}/></button></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Event Name</label><input type="text" className="w-full border rounded-lg px-4 py-2" value={sessionNameInput} onChange={(e) => setSessionNameInput(e.target.value)} /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Passcode</label><input type="text" className="w-full border rounded-lg px-4 py-2 font-mono" value={sessionPasscodeInput} onChange={(e) => setSessionPasscodeInput(e.target.value)} /></div>
              <button onClick={handleStartSession} className="w-full py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700">Start Counting</button>
            </div>
          </div>
        </div>
      )}

      {/* Security/Org Settings Modal */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Shield size={20} /> Settings</h3><button onClick={() => setIsSecurityModalOpen(false)}><X size={20} /></button></div>
             <div className="p-6 space-y-4">
               <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Organization Name</label><input type="text" className="w-full border rounded-lg px-4 py-2" placeholder={adminSettings.orgName} value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} /></div>
               <button onClick={handleUpdateSecurity} className="w-full py-3 rounded-lg bg-slate-900 text-white font-medium">Update</button>
             </div>
          </div>
        </div>
      )}

       {/* Layouts Modal */}
       {isLayoutModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-in">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
              <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2"><FileBox size={20} /> Templates</h3><button onClick={() => setIsLayoutModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="p-6 border-b border-slate-100 bg-white">
              <div className="flex gap-2"><input type="text" placeholder="Template Name" className="flex-1 border rounded-lg px-4 py-2" value={layoutNameInput} onChange={(e) => setLayoutNameInput(e.target.value)} /><button onClick={handleSaveLayout} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Save Current</button></div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-3">
               {savedLayouts.length === 0 ? <div className="text-center py-8 text-slate-400">No templates found.</div> : savedLayouts.map(l => (
                 <div key={l.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                   <div><h5 className="font-bold">{l.name}</h5><p className="text-xs text-slate-500">{l.blocks.length} Blocks</p></div>
                   <div className="flex gap-2">
                     <button onClick={() => handleLoadLayout(l)} className="text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-medium flex gap-1"><Download size={14}/> Load</button>
                     <button onClick={() => handleDeleteLayout(l.id)} className="text-red-400 p-2"><Trash2 size={16}/></button>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}