import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useFirebase } from '../context/FirebaseContext';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { auth, firestore } = useFirebase();

  const handleRegister = async () => {
    if (!email || !password || !displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { user } = await auth().createUserWithEmailAndPassword(email, password);
      
      await firestore().collection('users').doc(user.uid).set({
        email,
        displayName,
        createdAt: new Date(),
        lastLogin: new Date(),
      });

      await user.updateProfile({ displayName });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.form}>
        <Text variant="headlineMedium" style={styles.title}>
          Create Account
        </Text>

        <TextInput
          label="Name"
          value={displayName}
          onChangeText={setDisplayName}
          style={styles.input}
        />
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        
        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          style={styles.button}
        >
          Register
        </Button>
        
        <Button
          mode="text"
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
        >
          Already have an account? Login
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default RegisterScreen; 