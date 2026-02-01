import { icons } from "@/constants/icons";
import { fetchMovies, fetchMoviesByGenre } from "@/services/api";
import useFetch from "@/services/useFetch";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { images } from "../../constants/images";

interface MovieCategory {
  id: number;
  name: string;
  genreId: number;
}

const MOVIE_CATEGORIES: MovieCategory[] = [
  { id: 1, name: 'Action', genreId: 28 },
  { id: 2, name: 'Comedy', genreId: 35 },
  { id: 3, name: 'Science Fiction', genreId: 878 },
  { id: 4, name: 'Thriller', genreId: 53 },
  { id: 5, name: 'Drama', genreId: 18 },
  { id: 6, name: 'Horror', genreId: 27 },
];

const Search = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryMovies, setCategoryMovies] = useState<{ [key: number]: any[] }>({});
  const [loadingCategories, setLoadingCategories] = useState(true);

  const { data: searchMovies,
    loading: searchLoading,
    error: searchError,
    refetch } = useFetch(() => fetchMovies({
      query: searchQuery
    }), false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.length >= 2) {
      refetch();
    } else if (text.length === 0) {
      setSearchQuery('');
      refetch();
    }
  };

  // Load movies for each category on mount
  useEffect(() => {
    const loadCategoryMovies = async () => {
      setLoadingCategories(true);
      try {
        const moviesData: { [key: number]: any[] } = {};
        for (const category of MOVIE_CATEGORIES) {
          const movies = await fetchMoviesByGenre(category.genreId);
          moviesData[category.genreId] = movies;
        }
        setCategoryMovies(moviesData);
      } catch (error) {
        console.error('Error loading category movies:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategoryMovies();
  }, []);

  const isSearching = searchQuery.length > 0;
  const displayMovies = isSearching ? searchMovies : null;

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={images.bg}></Image>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Image style={styles.logo} source={icons.logo}></Image>
        <View style={styles.searchContainer}>
          <Image source={icons.search} resizeMode="contain" style={styles.searchIcon} tintColor="#ab8bff"></Image>
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies, TV shows..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
        </View>

        {isSearching ? (
          <View style={styles.searchResultsContainer}>
            <Text style={styles.categoryTitle}>Search Results</Text>
            {searchLoading && (
              <ActivityIndicator size="large" color="#ab8bff" style={{ marginTop: 20 }} />
            )}
            {searchError && (
              <Text style={styles.errorText}>Error: {searchError?.message}</Text>
            )}
            <FlatList
              scrollEnabled={false}
              data={displayMovies || []}
              keyExtractor={(item) => item.id.toString()}
              numColumns={3}
              columnWrapperStyle={styles.columnWrapper}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.movieCard}
                  onPress={() => router.push(`../movie/${item.id}`)}
                >
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w342${item.poster_path}` }}
                    style={styles.moviePoster}
                  />
                  <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        ) : (
          <View>
            {loadingCategories ? (
              <ActivityIndicator size="large" color="#ab8bff" style={{ marginTop: 50 }} />
            ) : (
              MOVIE_CATEGORIES.map((category) => (
                <View key={category.id} style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>{category.name}</Text>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={categoryMovies[category.genreId] || []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={styles.horizontalMovieCard}
                        onPress={() => router.push(`../movie/${item.id}`)}
                      >
                        <Image
                          source={{ uri: `https://image.tmdb.org/t/p/w342${item.poster_path}` }}
                          style={styles.horizontalMoviePoster}
                        />
                        <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
                      </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.horizontalListContent}
                  />
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default Search

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
    backgroundColor: "black"
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
    padding: 10,
  },
  logo: {
    width: 30,
    height: 30,
    marginTop: 40,
    marginBottom: 15,
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    marginBottom: 12,
    marginLeft: 5,
  },
  horizontalListContent: {
    paddingHorizontal: 5,
  },
  horizontalMovieCard: {
    marginRight: 12,
    width: 140,
  },
  horizontalMoviePoster: {
    width: 140,
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  movieTitle: {
    color: "white",
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  movieCard: {
    width: '32%',
    alignItems: 'center',
  },
  moviePoster: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  searchResultsContainer: {
    marginTop: 10,
  },
});