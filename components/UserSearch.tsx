import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Image, Pressable, useColorScheme } from 'react-native';
import { Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { globalStyles, colors, useThemeStyles } from '@/styles/globalStyles';
import debounce from 'lodash/debounce';

export function UserSearch() {
  const router = useRouter();
  const { searchUsers } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = useThemeStyles();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; username: string; avatar_url?: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const results = await searchUsers(query);
      setSearchResults(results);
      setIsSearching(false);
    }, 300),
    []
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const handleUserPress = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const renderSearchResult = ({ item }: { item: { id: string; username: string; avatar_url?: string } }) => (
    <Pressable
      style={[styles.card, { marginBottom: 8 }]}
      onPress={() => handleUserPress(item.id)}>
      <View style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Image
          source={{
            uri: item.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop',
          }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
        <Text style={styles.cardTitle}>{item.username}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={[styles.card, { padding: 8 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Search size={20} color={isDark ? colors.text.secondary.dark : colors.text.secondary.light} />
          <TextInput
            style={[
              styles.text,
              { flex: 1, color: isDark ? colors.text.primary.dark : colors.text.primary.light },
            ]}
            placeholder="Search users..."
            placeholderTextColor={isDark ? colors.text.secondary.dark : colors.text.secondary.light}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>
      </View>

      {/* Search Results */}
      {searchQuery.length > 0 && (
        <View style={{ marginTop: 8 }}>
          {isSearching ? (
            <Text style={styles.cardContent}>Searching...</Text>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.cardContent}>No users found</Text>
          )}
        </View>
      )}
    </View>
  );
} 