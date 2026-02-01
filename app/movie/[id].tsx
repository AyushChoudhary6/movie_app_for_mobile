import { fetchMovieDetails } from '@/services/api';
import { addToFavorites, isFavorited, removeFromFavorites } from '@/services/favorites';
import { addToWatchlist, removeFromWatchlist } from '@/services/profile';
import { useAuth } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { images } from "../../constants/images";

interface MovieDetails {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  runtime: number;
  genres: Array<{ id: number; name: string }>;
  budget: number;
  revenue: number;
  production_companies: Array<{ name: string }>;
}

const MovieDetailsPage = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id || 'demo-user';
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    const loadMovieDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const details = await fetchMovieDetails(id as string);
        setMovie(details);
        
        // Check if movie is favorited
        const fav = await isFavorited(userId, details.id);
        setIsFav(fav);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadMovieDetails();
    }
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!movie) return;
    try {
      if (isFav) {
        await removeFromFavorites(userId, movie.id);
        setIsFav(false);
      } else {
        await addToFavorites(userId, movie.id, movie);
        setIsFav(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!movie) return;
    try {
      if (inWatchlist) {
        await removeFromWatchlist(userId, movie.id);
        setInWatchlist(false);
      } else {
        await addToWatchlist(userId, movie.id);
        setInWatchlist(true);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ab8bff" style={{ marginTop: 50 }} />
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.errorText}>{error || 'Movie not found'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image style={styles.backgroundImage} source={images.bg}></Image>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {movie.backdrop_path && (
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` }}
            style={styles.backdropImage}
          />
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, isFav && styles.actionButtonActive]}
            onPress={handleToggleFavorite}
          >
            <Text style={styles.actionButtonText}>{isFav ? '❤️' : '🤍'}</Text>
            <Text style={styles.actionButtonLabel}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, inWatchlist && styles.actionButtonActive]}
            onPress={handleToggleWatchlist}
          >
            <Text style={styles.actionButtonText}>📋</Text>
            <Text style={styles.actionButtonLabel}>Watchlist</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {movie.poster_path && (
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w342${movie.poster_path}` }}
              style={styles.posterImage}
            />
          )}

          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{movie.title}</Text>

            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>⭐ {movie.vote_average.toFixed(1)}</Text>
              <Text style={styles.releaseDate}>{movie.release_date?.split('-')[0]}</Text>
              {movie.runtime > 0 && <Text style={styles.runtime}>{movie.runtime} min</Text>}
            </View>

            {movie.genres && movie.genres.length > 0 && (
              <View style={styles.genresContainer}>
                {movie.genres.map((genre) => (
                  <View key={genre.id} style={styles.genreTag}>
                    <Text style={styles.genreText}>{genre.name}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.overview}>{movie.overview}</Text>

            {movie.budget > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Budget</Text>
                <Text style={styles.infoText}>${(movie.budget / 1000000).toFixed(1)}M</Text>
              </View>
            )}

            {movie.revenue > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Revenue</Text>
                <Text style={styles.infoText}>${(movie.revenue / 1000000).toFixed(1)}M</Text>
              </View>
            )}

            {movie.production_companies && movie.production_companies.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Production Companies</Text>
                <Text style={styles.infoText}>
                  {movie.production_companies.map((c) => c.name).join(', ')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default MovieDetailsPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  backgroundImage: {
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
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 10,
    marginTop: 20,
  },
  backButtonText: {
    color: '#ab8bff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backdropImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  actionButtonActive: {
    borderColor: '#ab8bff',
    backgroundColor: 'rgba(171, 139, 255, 0.1)',
  },
  actionButtonText: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionButtonLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  posterImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginRight: 16,
    resizeMode: 'cover',
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  rating: {
    fontSize: 16,
    color: '#ffd700',
    fontWeight: 'bold',
  },
  releaseDate: {
    fontSize: 14,
    color: '#999',
  },
  runtime: {
    fontSize: 14,
    color: '#999',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  genreTag: {
    backgroundColor: '#ab8bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  genreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  overview: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 12,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});