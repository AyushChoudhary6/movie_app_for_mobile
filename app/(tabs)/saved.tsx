import { icons } from "@/constants/icons";
import { getFavoriteMovies, removeFromFavorites } from '@/services/favorites';
import { useAuth } from "@clerk/clerk-expo";
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { images } from "../../constants/images";

const SavedMovies = () => {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id || 'demo-user';
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const movies = await getFavoriteMovies(userId);
      setFavorites(movies);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Reload favorites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const handleRemove = async (movieId: number) => {
    try {
      await removeFromFavorites(userId, movieId);
      setFavorites(favorites.filter(m => m.movieId !== movieId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ab8bff" />
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.container}>
        <Image style={styles.image} source={images.bg}></Image>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Saved Movies</Text>
          <Text style={styles.emptyText}>Add movies to your favorites to see them here</Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.exploreButtonText}>Explore Movies</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={images.bg}></Image>
      <FlatList
        style={styles.scroll}
        data={favorites}
        keyExtractor={(item) => item.movieId.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Image style={styles.logo} source={icons.logo}></Image>
            <Text style={styles.title}>Saved Movies</Text>
            <Text style={styles.count}>{favorites.length} movies</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.movieCard}>
            <TouchableOpacity 
              onPress={() => router.push(`../movie/${item.movieId}`)}
              style={styles.posterContainer}
            >
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w342${item.poster_path}` }}
                style={styles.moviePoster}
              />
            </TouchableOpacity>
            <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => handleRemove(item.movieId)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default SavedMovies;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  image: {
    position: 'absolute',
    width: '150%',
    height: '50%',
    resizeMode: 'cover',
    zIndex: 0,
  },
  scroll: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 30,
    height: 30,
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  count: {
    fontSize: 14,
    color: '#999',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  movieCard: {
    width: '48%',
    alignItems: 'center',
  },
  posterContainer: {
    width: '100%',
  },
  moviePoster: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  movieTitle: {
    color: 'white',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  removeButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ab8bff',
    borderRadius: 6,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#ab8bff',
    borderRadius: 8,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});