import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    query,
    setDoc,
    getDoc
} from 'firebase/firestore';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// --- ICONS (Lucide-react as SVGs for simplicity) ---
const Plus = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const List = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const PieChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>;
const LogOut = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const Trash2 = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const Edit = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const GoogleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691c2.16-4.94 6.938-8.411 12.44-9.856l-5.657 5.657C11.332 11.439 8.52 12.63 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083L43.595 20L42 20H24v8h11.303c-0.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.099 34.992 44 30.01 44 24c0-1.341-0.138-2.65-0.389-3.917z"></path></svg>;
const Home = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const MoreHorizontal = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
// NEW: Icon for the description field
const MessageSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const TagIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path><path d="M7 7h.01"></path></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const RupeeIcon = () => <span className="text-slate-500 text-lg font-medium">₹</span>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.75l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.75l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const ArrowLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;


// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
};

// --- Whitelisted User IDs ---
const AUTHORIZED_UIDS = [import.meta.env.VITE_AKSHAT_AUTHORIZED_UID, import.meta.env.VITE_ABHILASHA_AUTHORIZED_UID];

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Main App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                if (AUTHORIZED_UIDS.includes(currentUser.uid)) {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                }
            } else {
                setUser(null);
                setIsAuthorized(false);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error during Google sign-in:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            {loading ? (
                <div className="flex items-center justify-center h-screen bg-slate-100">
                    <div className="text-xl font-semibold text-slate-700">Loading...</div>
                </div>
            ) : user ? (
                isAuthorized ? (
                    <WeddingExpenseTracker user={user} onLogout={handleLogout} />
                ) : (
                    <UnauthorizedAccess onLogout={handleLogout} />
                )
            ) : (
                <LoginScreen onLogin={handleGoogleLogin} />
            )}
        </div>
    );
}

// --- Login Screen Component ---
const LoginScreen = ({ onLogin }) => (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-indigo-100 p-4">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Akshat & Abhilasha's</h1>
            <h2 className="text-2xl font-light text-blue-600">Wedding Expense Tracker</h2>
        </div>
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-sm text-center w-full max-w-sm">
            <p className="mb-6 text-slate-600">Please sign in to manage your expenses.</p>
            <button
                onClick={onLogin}
                className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-blue-600 border border-transparent rounded-xl shadow-sm text-white font-semibold hover:bg-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105"
            >
                <GoogleIcon />
                Sign in with Google
            </button>
        </div>
    </div>
);

// --- Unauthorized Access Component ---
const UnauthorizedAccess = ({ onLogout }) => (
    <div className="flex flex-col items-center justify-center h-screen bg-red-50 p-4 text-center">
        <h1 className="text-3xl font-bold text-red-700 mb-4">Access Denied</h1>
        <p className="text-red-600 mb-6">You are not authorized to view this page.</p>
        <button
            onClick={onLogout}
            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 transition-colors"
        >
            Logout
        </button>
    </div>
);

// --- Confirmation Modal Component ---
const ConfirmationModal = ({ onConfirm, onCancel, title, message }) => (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 shadow-sm max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-slate-600 mb-4">{message}</p>
            <div className="flex justify-end gap-3">
                <button onClick={onCancel} className="px-4 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors">Delete</button>
            </div>
        </div>
    </div>
);


// --- More Page Component ---
const MorePage = ({ onLogout, onManageCategories }) => (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">More Options</h2>
        <div className="space-y-3">
            <button
                onClick={onManageCategories}
                className="w-full text-left bg-white p-4 rounded-lg shadow-sm flex items-center text-slate-700 hover:bg-slate-50 transition-colors"
            >
                <SettingsIcon />
                <span className="ml-3 font-medium">Manage Categories</span>
            </button>
            <button
                onClick={onLogout}
                className="w-full text-left bg-white p-4 rounded-lg shadow-sm flex items-center text-red-600 hover:bg-red-50 transition-colors"
            >
                <LogOut />
                <span className="ml-3 font-medium">Sign Out</span>
            </button>
        </div>
    </div>
);

// --- Manage Categories Component ---
const ManageCategories = ({ onBack }) => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const categoriesDocRef = useMemo(() => doc(db, 'categories', 'default'), []);

    useEffect(() => {
        const unsubscribe = onSnapshot(categoriesDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setCategories(docSnap.data().items || []);
            } else {
                setDoc(categoriesDocRef, { items: [] });
            }
        });
        return () => unsubscribe();
    }, [categoriesDocRef]);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        const trimmedCategory = newCategory.trim();
        if (trimmedCategory && !categories.includes(trimmedCategory)) {
            const updatedCategories = [...categories, trimmedCategory];
            await setDoc(categoriesDocRef, { items: updatedCategories });
            setNewCategory('');
        }
    };

    const handleDeleteClick = (category) => {
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (categoryToDelete) {
            const updatedCategories = categories.filter(c => c !== categoryToDelete);
            await setDoc(categoriesDocRef, { items: updatedCategories });
        }
        setShowDeleteModal(false);
        setCategoryToDelete(null);
    };

    return (
        <div className="space-y-6">
            {showDeleteModal && (
                <ConfirmationModal
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteModal(false)}
                    title="Confirm Deletion"
                    message={`Are you sure you want to delete the category "${categoryToDelete}"? This cannot be undone.`}
                />
            )}
            <div className="flex items-center">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-200">
                    <ArrowLeft />
                </button>
                <h2 className="text-2xl font-bold text-slate-800 ml-2">Manage Categories</h2>
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Add new category"
                    className="flex-grow p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:bg-slate-400" disabled={!newCategory.trim()}>
                    Add
                </button>
            </form>

            <div className="space-y-3">
                <h3 className="font-semibold text-slate-700">Existing Categories</h3>
                {categories.length > 0 ? (
                    categories.map(category => (
                        <div key={category} className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center">
                            <span className="text-slate-800">{category}</span>
                            <button onClick={() => handleDeleteClick(category)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors">
                                <Trash2 />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-slate-500 py-4">No categories added yet.</p>
                )}
            </div>
        </div>
    );
};

// --- Swipeable View Wrapper ---
const SwipeableView = ({ onSwipeBack, children }) => {
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const SWIPE_THRESHOLD = 50; // Min pixels for a swipe
    const EDGE_THRESHOLD = 40;  // Swipe must start within this many pixels from the left edge

    const handleTouchStart = (e) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchStartX.current < EDGE_THRESHOLD) {
            if (touchEndX.current - touchStartX.current > SWIPE_THRESHOLD) {
                onSwipeBack();
            }
        }
    };

    return (
        <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            {children}
        </div>
    );
};

// --- Main Tracker Component ---
const WeddingExpenseTracker = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('home');
    const [historyStack, setHistoryStack] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [editingExpense, setEditingExpense] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);

    const expensesQuery = useMemo(() => query(collection(db, "expenses")), []);

    const basePages = useMemo(() => ['home', 'history', 'analytics', 'more'], []);

    const navigateTo = (newTab) => {
        const isNavigatingToDetailPage = !basePages.includes(newTab);
        const isCurrentlyOnBasePage = basePages.includes(activeTab);

        if (isCurrentlyOnBasePage && isNavigatingToDetailPage) {
            setHistoryStack(prev => [...prev, activeTab]);
        }
        setActiveTab(newTab);
    };

    const navigateToBasePage = (tab) => {
        setHistoryStack([]);
        setActiveTab(tab);
    }

    const handleGoBack = () => {
        setEditingExpense(null);
        if (historyStack.length > 0) {
            const lastPage = historyStack[historyStack.length - 1];
            setHistoryStack(prev => prev.slice(0, -1));
            setActiveTab(lastPage);
        } else {
            setActiveTab('home');
        }
    };

    useEffect(() => {
        const unsubscribe = onSnapshot(expensesQuery, (querySnapshot) => {
            const expensesData = [];
            querySnapshot.forEach((doc) => {
                expensesData.push({ id: doc.id, ...doc.data() });
            });
            expensesData.sort((a, b) => new Date(b.date) - new Date(a.date));
            setExpenses(expensesData);
        });
        return () => unsubscribe();
    }, [expensesQuery]);

    const handleAddExpense = async (expense) => {
        try {
            await addDoc(collection(db, "expenses"), expense);
            navigateToBasePage('history');
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    const handleUpdateExpense = async (id, updatedExpense) => {
        try {
            const expenseDoc = doc(db, "expenses", id);
            await updateDoc(expenseDoc, updatedExpense);
            setEditingExpense(null);
            navigateToBasePage('history');
        } catch (e) {
            console.error("Error updating document: ", e);
        }
    };

    const handleDeleteClick = (id) => {
        setExpenseToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (expenseToDelete) {
            try {
                await deleteDoc(doc(db, "expenses", expenseToDelete));
            } catch (e) {
                console.error("Error deleting document: ", e);
            }
        }
        setShowDeleteModal(false);
        setExpenseToDelete(null);
    };

    const handleEditClick = (expense) => {
        setEditingExpense(expense);
        navigateTo('add');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <HomeScreen user={user} expenses={expenses} onSeeAll={() => navigateToBasePage('history')} />;
            case 'history':
                return <ExpenseList expenses={expenses} onEdit={handleEditClick} onDelete={handleDeleteClick} />;
            case 'analytics':
                return <Analytics expenses={expenses} />;
            case 'add':
                return <SwipeableView onSwipeBack={handleGoBack}>
                    <ExpenseForm
                        onSave={editingExpense ? handleUpdateExpense : handleAddExpense}
                        existingExpense={editingExpense}
                        onBack={handleGoBack}
                    />
                </SwipeableView>;
            case 'more':
                return <MorePage onLogout={onLogout} onManageCategories={() => navigateTo('manage-categories')} />;
            case 'manage-categories':
                return <SwipeableView onSwipeBack={handleGoBack}>
                    <ManageCategories onBack={handleGoBack} />
                </SwipeableView>;
            default:
                return <HomeScreen user={user} expenses={expenses} onSeeAll={() => navigateToBasePage('history')} />;
        }
    };

    return (
        <div className="bg-slate-100 min-h-screen">
            {showDeleteModal &&
                <ConfirmationModal
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteModal(false)}
                    title="Confirm Deletion"
                    message="Are you sure you want to delete this expense? This action cannot be undone."
                />
            }

            <main className="p-4 pb-28 max-w-lg mx-auto">
                {renderContent()}
            </main>

            {basePages.includes(activeTab) && (
                <div className="fixed bottom-0 left-0 right-0 h-24">
                    <nav className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 flex justify-around items-center h-16 shadow-[0_-2px_5px_rgb(0,0,0,0.05)] max-w-lg mx-auto">
                        <NavButton icon={<Home />} label="Home" isActive={activeTab === 'home'} onClick={() => navigateToBasePage('home')} />
                        <NavButton icon={<List />} label="History" isActive={activeTab === 'history'} onClick={() => navigateToBasePage('history')} />
                        <div className="w-16 h-16"></div> {/* Spacer for FAB */}
                        <NavButton icon={<PieChartIcon />} label="Analytics" isActive={activeTab === 'analytics'} onClick={() => navigateToBasePage('analytics')} />
                        <NavButton icon={<MoreHorizontal />} label="More" isActive={activeTab === 'more'} onClick={() => navigateToBasePage('more')} />
                    </nav>
                    <button
                        onClick={() => { setEditingExpense(null); navigateTo('add'); }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-sm flex items-center justify-center transform transition-transform hover:scale-110"
                    >
                        <Plus />
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Navigation Button Component ---
const NavButton = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-20 h-16 rounded-xl transition-all duration-300 ${isActive ? 'text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
    >
        {icon}
        <span className="text-xs font-semibold mt-1">{label}</span>
    </button>
);

// --- Home Screen Component ---
const HomeScreen = ({ user, expenses, onSeeAll }) => {
    const [expandedCard, setExpandedCard] = useState(null);

    const stats = useMemo(() => {
        const totalSpent = expenses.reduce((acc, curr) => acc + (curr.totalExpense || 0), 0);
        const totalAkshatPaid = expenses.reduce((acc, curr) => acc + (curr.akshatPaid || 0), 0);
        const totalAbhilashaPaid = expenses.reduce((acc, curr) => acc + (curr.abhilashaPaid || 0), 0);
        const totalAkshatShare = expenses.reduce((acc, curr) => acc + (curr.akshatShare || 0), 0);
        const totalAbhilashaShare = expenses.reduce((acc, curr) => acc + (curr.abhilashaShare || 0), 0);
        const akshatBalance = totalAkshatPaid - totalAkshatShare;

        let settlementMsg = "All settled up!";
        const roundedBalance = Math.round(akshatBalance);
        if (roundedBalance >= 1) {
            settlementMsg = `Abhilasha owes Akshat ₹${roundedBalance.toLocaleString()}`;
        } else if (roundedBalance <= -1) {
            settlementMsg = `Akshat owes Abhilasha ₹${Math.abs(roundedBalance).toLocaleString()}`;
        }
        return { totalSpent, settlementMsg, totalAkshatShare, totalAbhilashaShare, totalAkshatPaid, totalAbhilashaPaid };
    }, [expenses]);

    const recentExpenses = expenses.slice(0, 5);
    const firstName = user?.displayName?.split(' ')[0] || 'User';

    const handleCardToggle = (cardName) => {
        setExpandedCard(prev => (prev === cardName ? null : cardName));
    };

    return (
        <div className="space-y-6">
            <div className="text-left">
                <h1 className="text-2xl font-semibold text-slate-800">Hello, {firstName}!</h1>
            </div>

            <div className="space-y-4">
                {/* Total Spends Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer" onClick={() => handleCardToggle('spends')}>
                    <div className="flex justify-between items-center">
                        <p className="font-medium text-slate-600">Total Spends</p>
                        <p className="text-xl font-semibold text-slate-800">₹{Math.round(stats.totalSpent).toLocaleString()}</p>
                    </div>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedCard === 'spends' ? 'max-h-40 mt-4 pt-4 border-t' : 'max-h-0'}`}>
                        <div className="flex justify-between text-sm text-slate-600">
                            <p>Akshat Paid</p>
                            <p>₹{Math.round(stats.totalAkshatPaid).toLocaleString()}</p>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600 mt-2">
                            <p>Abhilasha Paid</p>
                            <p>₹{Math.round(stats.totalAbhilashaPaid).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Settlement Status Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer" onClick={() => handleCardToggle('settlement')}>
                    <div>
                        <p className="text-sm font-medium text-slate-600">Settlement Status</p>
                        <p className="text-base font-semibold text-blue-600 mt-1">{stats.settlementMsg}</p>
                    </div>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedCard === 'settlement' ? 'max-h-40 mt-4 pt-4 border-t' : 'max-h-0'}`}>
                        <div className="flex justify-between text-sm text-slate-600">
                            <p>Akshat's Share</p>
                            <p>₹{Math.round(stats.totalAkshatShare).toLocaleString()}</p>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600 mt-2">
                            <p>Abhilasha's Share</p>
                            <p>₹{Math.round(stats.totalAbhilashaShare).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold text-slate-800">Recent Expenses</h2>
                    <button onClick={onSeeAll} className="text-sm font-medium text-blue-600 hover:text-blue-700">See All</button>
                </div>
                <div className="space-y-3">
                    {recentExpenses.length > 0 ? recentExpenses.map(exp => (
                        <div key={exp.id} className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-sm text-slate-800">{exp.description || exp.category}</p>
                                <p className="text-xs text-slate-500">
                                    {new Date(exp.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })}
                                </p>
                            </div>
                            <p className="font-semibold text-sm text-slate-700">₹{Math.round(exp.totalExpense || 0).toLocaleString()}</p>
                        </div>
                    )) : (
                        <p className="text-center text-slate-500 py-4">No recent expenses.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Modern Form Input Components ---
const ModernInput = ({ id, label, type = 'text', icon, ...props }) => (
    <div className="relative group">
        {icon && <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-500">{icon}</div>}
        <input
            type={type}
            id={id}
            {...props}
            placeholder=" "
            className={`block pt-7 pb-2 px-0 w-full text-lg text-slate-900 bg-transparent border-0 appearance-none focus:outline-none focus:ring-0 peer ${icon ? 'pl-8' : ''}`}
        />
        <label
            htmlFor={id}
            className={`absolute text-base text-slate-500 duration-300 transform -translate-y-4 scale-75 top-6 z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${icon ? 'left-8' : 'left-0'}`}
        >
            {label}
        </label>
    </div>
);

// --- Bottom Sheet Component ---
const SelectionSheet = ({ isOpen, onClose, title, items, onSelect, selectedValue }) => {
    return (
        <div className={`fixed inset-0 z-50 transition-colors duration-300 ${isOpen ? "bg-black/50" : "bg-transparent pointer-events-none"}`} onClick={onClose}>
            <div
                className={`bg-white rounded-t-2xl p-4 w-full max-w-lg absolute bottom-0 transition-transform duration-300 ease-in-out ${isOpen ? "translate-y-0" : "translate-y-full"}`}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-medium text-center mb-4">{title}</h3>
                <div className="grid gap-2 max-h-[60vh] overflow-y-auto">
                    {items.map(item => (
                        <button
                            key={item.value}
                            onClick={() => onSelect(item.value)}
                            className={`w-full text-left p-3 rounded-lg font-medium ${selectedValue === item.value ? 'bg-blue-100 text-blue-900' : 'hover:bg-slate-100'}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};


// --- Expense Form Component ---
const ExpenseForm = ({ onSave, existingExpense, onBack }) => {
    // Helper to get local time in YYYY-MM-DDTHH:mm format
    const getLocalISOString = () => {
        const date = new Date();
        const tzoffset = date.getTimezoneOffset() * 60000;
        const localISOTime = new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
        return localISOTime;
    };

    const initialState = {
        date: getLocalISOString(),
        category: '',
        description: '',
        expenseType: 'common',
        whoPaid: 'both',
        totalExpense: '',
        akshatPaid: '',
        abhilashaPaid: '',
        splitType: 'equal',
        akshatGuests: '',
        abhilashaGuests: '',
        akshatShare: '',
        abhilashaShare: '',
    };

    const [form, setForm] = useState(existingExpense || initialState);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const categoriesDocRef = doc(db, 'categories', 'default');
        const unsubscribe = onSnapshot(categoriesDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setCategories(docSnap.data().items || []);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        setForm(existingExpense || initialState);
    }, [existingExpense]);

    const handleDateTimeChange = (e) => {
        const { name, value } = e.target;
        const [currentDate, currentTime] = form.date.split('T');

        const newDateString = name === 'expense_date'
            ? `${value}T${currentTime}`
            : `${currentDate}T${value}`;

        setForm(prev => ({ ...prev, date: newDateString }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => {
            const newForm = { ...prev, [name]: value };

            if (newForm.splitType === 'custom' && (name === 'akshatShare' || name === 'abhilashaShare')) {
                const total = parseFloat(newForm.totalExpense) || 0;

                if (name === 'akshatShare') {
                    const akshatShareNum = parseFloat(value) || 0;
                    if (total > 0) {
                        newForm.abhilashaShare = (total - akshatShareNum).toFixed(2);
                    }
                } else { // name === 'abhilashaShare'
                    const abhilashaShareNum = parseFloat(value) || 0;
                    if (total > 0) {
                        newForm.akshatShare = (total - abhilashaShareNum).toFixed(2);
                    }
                }
            }
            return newForm;
        });
    };

    useEffect(() => {
        const akshatPaidNum = parseFloat(form.akshatPaid) || 0;
        const abhilashaPaidNum = parseFloat(form.abhilashaPaid) || 0;

        if (form.whoPaid === 'both') {
            const total = akshatPaidNum + abhilashaPaidNum;
            setForm(prev => ({ ...prev, totalExpense: total }));
        } else if (form.whoPaid === 'akshat') {
            setForm(prev => ({ ...prev, totalExpense: akshatPaidNum, abhilashaPaid: '' }));
        } else if (form.whoPaid === 'abhilasha') {
            setForm(prev => ({ ...prev, totalExpense: abhilashaPaidNum, akshatPaid: '' }));
        }
    }, [form.akshatPaid, form.abhilashaPaid, form.whoPaid]);

    const { akshatShare, abhilashaShare } = useMemo(() => {
        const totalExpenseNum = parseFloat(form.totalExpense) || 0;
        const akshatGuestsNum = parseFloat(form.akshatGuests) || 0;
        const abhilashaGuestsNum = parseFloat(form.abhilashaGuests) || 0;
        const customAkshatShare = parseFloat(form.akshatShare) || 0;
        const customAbhilashaShare = parseFloat(form.abhilashaShare) || 0;

        if (form.expenseType === 'akshat_personal') {
            return { akshatShare: totalExpenseNum, abhilashaShare: 0 };
        }
        if (form.expenseType === 'abhilasha_personal') {
            return { akshatShare: 0, abhilashaShare: totalExpenseNum };
        }
        switch (form.splitType) {
            case 'equal':
                return { akshatShare: totalExpenseNum / 2, abhilashaShare: totalExpenseNum / 2 };
            case 'headcount':
                const totalGuests = akshatGuestsNum + abhilashaGuestsNum;
                if (totalGuests === 0) return { akshatShare: totalExpenseNum / 2, abhilashaShare: totalExpenseNum / 2 }; // Fallback to equal
                const perHeadCost = totalExpenseNum / totalGuests;
                return {
                    akshatShare: perHeadCost * akshatGuestsNum,
                    abhilashaShare: perHeadCost * abhilashaGuestsNum
                };
            case 'custom':
                return { akshatShare: customAkshatShare, abhilashaShare: customAbhilashaShare };
            default:
                return { akshatShare: 0, abhilashaShare: 0 };
        }
    }, [form]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const expenseData = {
            ...form,
            totalExpense: parseFloat(form.totalExpense) || 0,
            akshatPaid: parseFloat(form.akshatPaid) || 0,
            abhilashaPaid: parseFloat(form.abhilashaPaid) || 0,
            akshatGuests: parseFloat(form.akshatGuests) || 0,
            abhilashaGuests: parseFloat(form.abhilashaGuests) || 0,
            akshatShare,
            abhilashaShare
        };
        if (existingExpense) {
            onSave(existingExpense.id, expenseData);
        } else {
            onSave(expenseData);
            setForm(initialState);
        }
    };

    return (
        <div className="relative">
            <style>{`
                input[type="date"]::-webkit-calendar-picker-indicator,
                input[type="time"]::-webkit-calendar-picker-indicator {
                    display: none;
                    -webkit-appearance: none;
                }
            `}</style>
            <form onSubmit={handleSubmit} className="space-y-8 pb-24">
                <div className="flex items-center">
                    <button type="button" onClick={onBack} className="p-2 -ml-2 mr-2 rounded-full hover:bg-slate-200">
                        <ArrowLeft />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-800">{existingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
                </div>

                <div className="flex items-center gap-4 py-3 cursor-pointer" onClick={() => setIsSheetOpen(true)}>
                    <TagIcon className="text-slate-500" />
                    <span className={`text-lg ${form.category ? 'text-slate-900' : 'text-slate-500'}`}>
                        {form.category || 'Select Category'}
                    </span>
                </div>

                {/* UPDATED: Added icon to description field */}
                <ModernInput id="description" name="description" value={form.description} onChange={handleChange} label="Description (Optional)" icon={<MessageSquareIcon />} />

                <div className="flex items-center gap-4 py-3">
                    <CalendarIcon />
                    <input type="date" name="expense_date" value={(form.date || '').split('T')[0]} onChange={handleDateTimeChange} className="bg-transparent w-full text-lg focus:outline-none" />
                </div>
                <div className="flex items-center gap-4 py-3">
                    <ClockIcon />
                    <input type="time" name="expense_time" value={(form.date || '').split('T')[1] || ''} onChange={handleDateTimeChange} className="bg-transparent w-full text-lg focus:outline-none" />
                </div>

                <RadioGroup label="Expense Type" name="expenseType" value={form.expenseType} onChange={handleChange} options={[
                    { label: "Common", value: "common" },
                    { label: "Akshat's Personal", value: "akshat_personal" },
                    { label: "Abhilasha's Personal", value: "abhilasha_personal" }
                ]} />

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-6">
                    <h3 className="font-semibold text-blue-600">Payment Details</h3>
                    <div className="flex justify-between items-center p-3 rounded-lg">
                        <span className="font-medium text-slate-600">Total Amount</span>
                        <span className="text-xl font-bold text-blue-600">₹{Math.round(parseFloat(form.totalExpense) || 0).toLocaleString()}</span>
                    </div>
                    <RadioGroup label="Who Paid" name="whoPaid" value={form.whoPaid} onChange={handleChange} options={[
                        { label: "Akshat", value: "akshat" },
                        { label: "Abhilasha", value: "abhilasha" },
                        { label: "Both", value: "both" }
                    ]} />

                    {form.whoPaid === 'both' ? (
                        <div className="flex flex-col sm:flex-row gap-x-4 gap-y-8">
                            <ModernInput id="akshatPaid" name="akshatPaid" type="number" step="0.01" value={form.akshatPaid} onChange={handleChange} label="Akshat Paid" icon={<RupeeIcon />} />
                            <ModernInput id="abhilashaPaid" name="abhilashaPaid" type="number" step="0.01" value={form.abhilashaPaid} onChange={handleChange} label="Abhilasha Paid" icon={<RupeeIcon />} />
                        </div>
                    ) : (
                        <ModernInput id="singlePayerAmount" name={form.whoPaid === 'akshat' ? 'akshatPaid' : 'abhilashaPaid'} type="number" step="0.01" value={form.whoPaid === 'akshat' ? form.akshatPaid : form.abhilashaPaid} onChange={handleChange} label={`${form.whoPaid.charAt(0).toUpperCase() + form.whoPaid.slice(1)} Paid`} icon={<RupeeIcon />} />
                    )}
                </div>

                {form.expenseType === 'common' && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-6">
                        <h3 className="font-semibold text-blue-600">Split Details</h3>
                        <RadioGroup label="Split Type" name="splitType" value={form.splitType} onChange={handleChange} options={[
                            { label: "Equal", value: "equal" },
                            { label: "By Headcount", value: "headcount" },
                            { label: "Custom", value: "custom" }
                        ]} />

                        {form.splitType === 'headcount' && (
                            <div className="flex flex-col sm:flex-row gap-x-4 gap-y-8">
                                <ModernInput id="akshatGuests" name="akshatGuests" type="number" value={form.akshatGuests} onChange={handleChange} label="Akshat's Guests" icon={<UsersIcon />} />
                                <ModernInput id="abhilashaGuests" name="abhilashaGuests" type="number" value={form.abhilashaGuests} onChange={handleChange} label="Abhilasha's Guests" icon={<UsersIcon />} />
                            </div>
                        )}
                        {form.splitType === 'custom' && (
                            <div className="flex flex-col sm:flex-row gap-x-4 gap-y-8">
                                <ModernInput id="akshatShare" name="akshatShare" type="number" step="0.01" value={form.akshatShare} onChange={handleChange} label="Akshat's Share" icon={<RupeeIcon />} />
                                <ModernInput id="abhilashaShare" name="abhilashaShare" type="number" step="0.01" value={form.abhilashaShare} onChange={handleChange} label="Abhilasha's Share" icon={<RupeeIcon />} />
                            </div>
                        )}
                        <div className="pt-2 border-t space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Akshat's Share</span>
                                <span className="font-medium text-gray-800">₹{Math.round(akshatShare).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Abhilasha's Share</span>
                                <span className="font-medium text-gray-800">₹{Math.round(abhilashaShare).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}

            </form>
            <button onClick={handleSubmit} className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-sm flex items-center justify-center transform transition-transform hover:scale-110 z-20">
                <SaveIcon />
            </button>
            <SelectionSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                title="Select Category"
                items={categories.map(c => ({ label: c, value: c }))}
                selectedValue={form.category}
                onSelect={(value) => {
                    handleChange({ target: { name: 'category', value } });
                    setIsSheetOpen(false);
                }}
            />
        </div>
    );
};

const RadioGroup = ({ label, name, value, onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map(opt => (
                <label key={opt.value} className={`cursor-pointer px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${value === opt.value ? 'bg-blue-100 text-blue-900 border-transparent' : 'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-100'}`}>
                    <input type="radio" name={name} value={opt.value} checked={value === opt.value} onChange={onChange} className="sr-only" />
                    {opt.label}
                </label>
            ))}
        </div>
    </div>
);

// --- Expense List Component ---
const ExpenseList = ({ expenses, onEdit, onDelete }) => {
    const [expandedId, setExpandedId] = useState(null);

    const handleToggle = (id) => {
        setExpandedId(prevId => (prevId === id ? null : id));
    };

    return (
        <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">All Expenses</h2>
            {expenses.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-slate-500">No expenses added yet.</p>
                    <p className="text-sm text-slate-400 mt-2">Click the '+' button to get started!</p>
                </div>
            ) : (
                expenses.map(exp => {
                    const isExpanded = expandedId === exp.id;
                    return (
                        <div
                            key={exp.id}
                            className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 cursor-pointer transition-all duration-300"
                            onClick={() => handleToggle(exp.id)}
                        >
                            {/* Basic Info */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-sm text-slate-800">{exp.description || 'No Description'}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {exp.category} &bull; {new Date(exp.date).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                    </p>
                                </div>
                                <p className="font-bold text-base text-blue-600">₹{Math.round(exp.totalExpense || 0).toLocaleString()}</p>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                    <div className="text-xs text-slate-600 space-y-1.5 mb-3">
                                        <div className="flex justify-between"><span className="font-medium">Paid by:</span> <span>{exp.whoPaid.charAt(0).toUpperCase() + exp.whoPaid.slice(1)}</span></div>
                                        <div className="flex justify-between"><span className="font-medium">Akshat's Share:</span> <span>₹{Math.round(exp.akshatShare || 0).toLocaleString()}</span></div>
                                        <div className="flex justify-between"><span className="font-medium">Abhilasha's Share:</span> <span>₹{Math.round(exp.abhilashaShare || 0).toLocaleString()}</span></div>
                                        {exp.splitType === 'headcount' && (
                                            <>
                                                <div className="flex justify-between"><span className="font-medium">Akshat's Guests:</span> <span>{exp.akshatGuests}</span></div>
                                                <div className="flex justify-between"><span className="font-medium">Abhilasha's Guests:</span> <span>{exp.abhilashaGuests}</span></div>
                                            </>
                                        )}
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEdit(exp); }}
                                            className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-md transition-colors"
                                            aria-label="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(exp.id); }}
                                            className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-md transition-colors"
                                            aria-label="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};


// --- Analytics Component ---
const Analytics = ({ expenses }) => {
    const stats = useMemo(() => {
        const totalSpent = expenses.reduce((acc, curr) => acc + (curr.totalExpense || 0), 0);
        const totalAkshatPaid = expenses.reduce((acc, curr) => acc + (curr.akshatPaid || 0), 0);
        const totalAbhilashaPaid = expenses.reduce((acc, curr) => acc + (curr.abhilashaPaid || 0), 0);
        const totalAkshatShare = expenses.reduce((acc, curr) => acc + (curr.akshatShare || 0), 0);
        const totalAbhilashaShare = expenses.reduce((acc, curr) => acc + (curr.abhilashaShare || 0), 0);
        const akshatBalance = totalAkshatPaid - totalAkshatShare;

        let settlementMsg = "All settled up!";
        const roundedBalance = Math.round(akshatBalance);
        if (roundedBalance >= 1) {
            settlementMsg = `Abhilasha owes Akshat ₹${roundedBalance.toLocaleString()}`;
        } else if (roundedBalance <= -1) {
            settlementMsg = `Akshat owes Abhilasha ₹${Math.abs(roundedBalance).toLocaleString()}`;
        }

        const categoryData = expenses.reduce((acc, curr) => {
            if (curr.category) {
                acc[curr.category] = (acc[curr.category] || 0) + (curr.totalExpense || 0);
            }
            return acc;
        }, {});

        const pieData = Object.keys(categoryData).map(key => ({ name: key, value: categoryData[key] }));

        return { totalSpent, totalAkshatPaid, totalAbhilashaPaid, totalAkshatShare, totalAbhilashaShare, settlementMsg, pieData };
    }, [expenses]);

    const COLORS = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#AB47BC', '#00ACC1', '#FF7043', '#9E9D24'];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Analytics</h2>

            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-2xl shadow-sm text-center">
                <p className="text-lg opacity-90">Settlement Status</p>
                <p className="text-3xl font-bold mt-2">{stats.settlementMsg}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <StatCard label="Total Spent" value={`₹${Math.round(stats.totalSpent).toLocaleString()}`} />
                <StatCard label="Akshat's Share" value={`₹${Math.round(stats.totalAkshatShare).toLocaleString()}`} />
                <StatCard label="Abhilasha's Share" value={`₹${Math.round(stats.totalAbhilashaShare).toLocaleString()}`} />
                <StatCard label="Paid by Akshat" value={`₹${Math.round(stats.totalAkshatPaid).toLocaleString()}`} />
                <StatCard label="Paid by Abhilasha" value={`₹${Math.round(stats.totalAbhilashaPaid).toLocaleString()}`} />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-semibold mb-4 text-center text-slate-700">Spending by Category</h3>
                {stats.pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={stats.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                return percent > 0.05 ? (<text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"> {`${(percent * 100).toFixed(0)}%`} </text>) : null;
                            }}>
                                {stats.pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `₹${Math.round(value).toLocaleString()}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : <p className="text-center text-slate-500 py-8">No data for chart.</p>}
            </div>
        </div>
    );
};

const StatCard = ({ label, value }) => (
    <div className="bg-white p-4 rounded-xl text-center shadow-sm border border-slate-200">
        <p className="text-sm text-slate-600 font-medium">{label}</p>
        <p className="text-xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
);