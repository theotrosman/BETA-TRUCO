import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, doc, setDoc, getDoc, updateDoc } from './firebase-config.js';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.setupAuthListener();
    }

    setupAuthListener() {
        onAuthStateChanged(auth, (user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
            this.currentUser = user;
            this.updateUI();
        }, (error) => {
            console.error('Auth state change error:', error);
        });
    }

    async register(email, password, displayName) {
        try {
            console.log('Attempting to register user:', email);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('User registered successfully:', user.uid);
            
            await this.createUserProfile(user.uid, {
                displayName: displayName,
                email: email,
                createdAt: new Date().toISOString(),
                stats: this.getDefaultStats()
            });
            
            return { success: true, user };
        } catch (error) {
            console.error('Registration error:', error.code, error.message);
            return { success: false, error: error.message };
        }
    }

    async login(email, password) {
        try {
            console.log('Attempting to login user:', email);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('User logged in successfully:', userCredential.user.uid);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Login error:', error.code, error.message);
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    async createUserProfile(uid, profileData) {
        try {
            console.log('Creating user profile for:', uid);
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, profileData);
            console.log('User profile created successfully');
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    }

    async getUserProfile(uid) {
        try {
            console.log('Getting user profile for:', uid);
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                console.log('User profile found');
                return userSnap.data();
            } else {
                console.log('User profile not found');
                return null;
            }
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    }

    async updateUserProfile(uid, updates) {
        try {
            console.log('Updating user profile for:', uid);
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, updates);
            console.log('User profile updated successfully');
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    getDefaultStats() {
        return {
            gamesPlayed: 0,
            gamesWon: 0,
            chicosWon: 0,
            envidosWon: 0,
            trucosWon: 0,
            floresCantadas: 0,
            avgTimePerTurn: 0,
            comodinesUsados: 0,
            totalTimePlayed: 0,
            turnsPlayed: 0,
            cardsPlayed: {},
            cardsWon: {},
            cardsEnvido: {},
            cardsTruco: {},
            comodinesUnlocked: [],
            comodinesUsed: {},
            achievements: {},
            gameHistory: [],
            cpuStats: {
                wins: 0,
                losses: 0,
                avgTimePerTurn: 0,
                strategyChoices: {}
            }
        };
    }

    updateUI() {
        const authContainer = document.getElementById('authContainer');
        const menuContainer = document.getElementById('menuContainer');
        const userInfo = document.getElementById('userInfo');
        const logoutBtn = document.getElementById('logoutBtn');

        if (this.currentUser) {
            if (authContainer) authContainer.style.display = 'none';
            if (menuContainer) menuContainer.style.display = 'block';
            if (userInfo) {
                userInfo.textContent = `Bienvenido, ${this.currentUser.email}`;
                userInfo.style.display = 'block';
            }
            if (logoutBtn) logoutBtn.style.display = 'block';
        } else {
            if (authContainer) authContainer.style.display = 'block';
            if (menuContainer) menuContainer.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

export const authManager = new AuthManager(); 