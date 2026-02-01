import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'movieapp_favorites';

// Add movie to favorites
export const addToFavorites = async (userId: string, movieId: number, movieData: any) => {
  try {
    const favorites = await getFavoriteMovies(userId);
    const alreadyExists = favorites.some((m: any) => m.movieId === movieId);
    
    if (alreadyExists) {
      return favorites.find((m: any) => m.movieId === movieId);
    }

    const newFavorite = {
      userId,
      movieId,
      title: movieData.title,
      poster_path: movieData.poster_path,
      backdrop_path: movieData.backdrop_path,
      overview: movieData.overview,
      vote_average: movieData.vote_average,
      release_date: movieData.release_date,
      addedAt: new Date().toISOString(),
    };

    const allFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
    const data = allFavorites ? JSON.parse(allFavorites) : [];
    data.push(newFavorite);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(data));
    
    return newFavorite;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

// Remove movie from favorites
export const removeFromFavorites = async (userId: string, movieId: number) => {
  try {
    const allFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
    const data = allFavorites ? JSON.parse(allFavorites) : [];
    const filtered = data.filter((f: any) => !(f.userId === userId && f.movieId === movieId));
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

// Get user's favorite movies
export const getFavoriteMovies = async (userId: string) => {
  try {
    const allFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
    const data = allFavorites ? JSON.parse(allFavorites) : [];
    return data.filter((f: any) => f.userId === userId);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};

// Check if movie is favorited
export const isFavorited = async (userId: string, movieId: number) => {
  try {
    const favorites = await getFavoriteMovies(userId);
    return favorites.some((f: any) => f.movieId === movieId);
  } catch (error) {
    return false;
  }
};
