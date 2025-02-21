import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Avatar, Button, List, Text } from 'react-native-paper';
import { useFirebase } from '../context/FirebaseContext';
import { useUser } from '../context/UserContext';

const ProfileScreen = () => {
  const { auth } = useFirebase();
  const { user } = useUser();

  const handleLogout = async () => {
    try {
      await auth().signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to log out');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Image
          size={80}
          source={
            user?.photoURL
              ? { uri: user.photoURL }
              : require('../assets/default-avatar.png')
          }
        />
        <Text variant="headlineSmall" style={styles.name}>
          {user?.displayName}
        </Text>
        <Text variant="bodyMedium" style={styles.email}>
          {user?.email}
        </Text>
      </View>

      <List.Section>
        <List.Item
          title="My Listings"
          left={props => <List.Icon {...props} icon="format-list-bulleted" />}
          onPress={() => {}}
        />
        <List.Item
          title="Favorites"
          left={props => <List.Icon {...props} icon="heart" />}
          onPress={() => {}}
        />
        <List.Item
          title="Settings"
          left={props => <List.Icon {...props} icon="cog" />}
          onPress={() => {}}
        />
      </List.Section>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        Log Out
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  name: {
    marginTop: 12,
  },
  email: {
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    margin: 16,
  },
});

export default ProfileScreen; 