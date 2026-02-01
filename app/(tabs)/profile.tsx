import { icons } from "@/constants/icons";
import { createOrUpdateProfile, getUserProfile, updatePreferences } from '@/services/profile';
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { images } from "../../constants/images";

const Profile = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const userId = user?.id || 'demo-user';
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteGenre, setFavoriteGenre] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    } else {
      // If no user ID, still try with demo-user as fallback
      setTimeout(() => {
        loadProfile();
      }, 300);
    }
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log('Loading profile for userId:', userId);
      
      const userProfile = await getUserProfile(userId);
      
      if (userProfile) {
        // Use existing profile data
        setProfile(userProfile);
        setUsername(userProfile.username || user?.firstName || user?.fullName || 'User');
        setBio(userProfile.bio || '');
        setFavoriteGenre(userProfile.favoriteGenre || '');
        setNotifications(userProfile.preferences?.notifications ?? true);
        setTheme(userProfile.preferences?.theme ?? 'dark');
        console.log('Profile loaded successfully:', userProfile);
      } else {
        // Create default profile with Clerk user data
        const displayName = user?.firstName || user?.fullName || user?.username || 'User';
        const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || '';
        
        console.log('Creating new profile with Clerk data:', { displayName, userEmail, userId });
        
        const newProfile = await createOrUpdateProfile(userId, {
          userId,
          username: displayName,
          email: userEmail,
          bio: '',
          favoriteGenre: '',
        });
        
        setProfile(newProfile);
        setUsername(newProfile.username || displayName);
        setBio(newProfile.bio || '');
        setFavoriteGenre(newProfile.favoriteGenre || '');
        
        console.log('New profile created successfully:', newProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await createOrUpdateProfile(userId, {
        username,
        bio,
        favoriteGenre,
      });
      await updatePreferences(userId, {
        notifications,
        theme,
      });
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/');
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Image style={styles.image} source={images.bg}></Image>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ab8bff" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={images.bg}></Image>
      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        <Image style={styles.logo} source={icons.logo}></Image>
        
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(username || 'U')?.charAt(0)?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.profileName}>{username || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.primaryEmailAddress?.emailAddress || ''}</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setEditing(!editing)}
          >
            <Text style={styles.editButtonText}>{editing ? 'Cancel' : 'Edit Profile'}</Text>
          </TouchableOpacity>
        </View>

        {editing ? (
          <View style={styles.editContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#666"
                multiline
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Favorite Genre</Text>
              <TextInput
                style={styles.input}
                value={favoriteGenre}
                onChangeText={setFavoriteGenre}
                placeholder="e.g., Action, Comedy, Drama"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>Notifications</Text>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#3a3a3a', true: '#ab8bff' }}
                  thumbColor={notifications ? '#fff' : '#999'}
                />
              </View>

              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>Theme</Text>
                <View style={styles.themeSelector}>
                  <TouchableOpacity
                    style={[styles.themeButton, theme === 'dark' && styles.themeButtonActive]}
                    onPress={() => setTheme('dark')}
                  >
                    <Text style={styles.themeButtonText}>Dark</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.themeButton, theme === 'light' && styles.themeButtonActive]}
                    onPress={() => setTheme('light')}
                  >
                    <Text style={styles.themeButtonText}>Light</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.viewContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bio</Text>
              <Text style={styles.sectionText}>{bio || 'No bio added yet'}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Favorite Genre</Text>
              <Text style={styles.sectionText}>{favoriteGenre || 'Not set'}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingValue}>{notifications ? 'Enabled' : 'Disabled'}</Text>
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Theme</Text>
                <Text style={styles.settingValue}>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  logo: {
    width: 30,
    height: 30,
    marginTop: 40,
    marginBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ab8bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#ab8bff',
    borderRadius: 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  editContainer: {
    marginBottom: 30,
  },
  viewContainer: {
    marginBottom: 30,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: 'white',
    fontSize: 14,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  preferenceLabel: {
    fontSize: 14,
    color: 'white',
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#333',
    borderRadius: 6,
  },
  themeButtonActive: {
    backgroundColor: '#ab8bff',
  },
  themeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#ab8bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingLabel: {
    fontSize: 14,
    color: 'white',
  },
  settingValue: {
    fontSize: 14,
    color: '#ab8bff',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});