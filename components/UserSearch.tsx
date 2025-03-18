import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { supabase } from '@/supabase/config';
import { colors } from '@/styles/globalStyles';
import { useDebounce } from '@/hooks/useDebounce';

interface User {
  id: string;
  username: string;
  avatar_url?: string;
}

export function UserSearch() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearch) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [debouncedSearch]);

  const searchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${debouncedSearch}%`)
        .limit(10);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <Pressable
      style={styles.userItem}
      onPress={() => router.push(`/profile/${item.id}`)}
    >
      <Image
        source={{
          uri: item.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop',
        }}
        style={styles.avatar}
      />
      <Text style={styles.username}>{item.username}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.subtext.dark} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search users..."
          placeholderTextColor={colors.subtext.dark}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {searchTerm.length > 0 && (
        <View style={styles.resultsContainer}>
          {loading ? (
            <Text style={styles.statusText}>Searching...</Text>
          ) : users.length === 0 ? (
            <Text style={styles.statusText}>No users found</Text>
          ) : (
            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.resultsList}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card.dark,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.text.dark,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  resultsContainer: {
    backgroundColor: colors.background.card.dark,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 300,
    overflow: 'hidden',
  },
  resultsList: {
    padding: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  username: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 16,
    color: colors.text.dark,
  },
  statusText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.subtext.dark,
    textAlign: 'center',
    padding: 16,
  },
}); 