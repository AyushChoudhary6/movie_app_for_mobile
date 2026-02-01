import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILES_KEY = 'movieapp_profiles';

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  bio: string;
  favoriteGenre: string;
  watchlist: string[];
  preferences: {
    notifications: boolean;
    theme: 'dark' | 'light';
    language: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Create or update user profile
export const createOrUpdateProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
) => {
  try {
    const allProfiles = await AsyncStorage.getItem(PROFILES_KEY);
    const profiles = allProfiles ? JSON.parse(allProfiles) : [];
    
    const existingIndex = profiles.findIndex((p: any) => p.userId === userId);
    
    if (existingIndex >= 0) {
      profiles[existingIndex] = {
        ...profiles[existingIndex],
        ...profileData,
        updatedAt: new Date().toISOString(),
      };
    } else {
      profiles.push({
        userId,
        username: profileData.username || 'User',
        email: profileData.email || '',
        bio: profileData.bio || '',
        favoriteGenre: profileData.favoriteGenre || '',
        watchlist: profileData.watchlist || [],
        preferences: profileData.preferences || {
          notifications: true,
          theme: 'dark',
          language: 'en',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    
    await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    return profiles[existingIndex >= 0 ? existingIndex : profiles.length - 1];
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const allProfiles = await AsyncStorage.getItem(PROFILES_KEY);
    const profiles = allProfiles ? JSON.parse(allProfiles) : [];
    return profiles.find((p: any) => p.userId === userId) || null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

// Update user preferences
export const updatePreferences = async (
  userId: string,
  preferences: {
    notifications?: boolean;
    theme?: 'dark' | 'light';
    language?: string;
  }
) => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) {
      return await createOrUpdateProfile(userId, {
        preferences: {
          notifications: preferences.notifications ?? true,
          theme: preferences.theme ?? 'dark',
          language: preferences.language ?? 'en',
        },
      });
    }
    
    return await createOrUpdateProfile(userId, {
      preferences: {
        ...profile.preferences,
        ...preferences,
      },
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
};

// Update favorite genre
export const updateFavoriteGenre = async (userId: string, genre: string) => {
  try {
    return await createOrUpdateProfile(userId, { favoriteGenre: genre });
  } catch (error) {
    console.error('Error updating favorite genre:', error);
    throw error;
  }
};

// Add to watchlist
export const addToWatchlist = async (userId: string, movieId: number) => {
  try {
    const profile = await getUserProfile(userId);
    const watchlist = profile?.watchlist || [];
    if (!watchlist.includes(movieId.toString())) {
      watchlist.push(movieId.toString());
    }
    return await createOrUpdateProfile(userId, { watchlist });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
};

// Remove from watchlist
export const removeFromWatchlist = async (userId: string, movieId: number) => {
  try {
    const profile = await getUserProfile(userId);
    const watchlist = profile?.watchlist || [];
    const filtered = watchlist.filter((id: string) => id !== movieId.toString());
    return await createOrUpdateProfile(userId, { watchlist: filtered });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
};
