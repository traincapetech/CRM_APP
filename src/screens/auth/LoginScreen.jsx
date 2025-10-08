import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Text,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { testApiConnection } from '../../utils/testApi';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Title style={styles.title}>Calyx CRM</Title>
          <Paragraph style={styles.subtitle}>
            Manage your customer relationships effectively
          </Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Welcome Back</Title>
            <Paragraph style={styles.cardSubtitle}>
              Sign in to continue to your CRM dashboard
            </Paragraph>

            {/* Test Credentials - Remove in production */}
            <View style={styles.testCredentials}>
              <Text style={styles.testText}>Test Credentials:</Text>
              <Text style={styles.testText}>Email: test2@example.com</Text>
              <Text style={styles.testText}>Password: password123</Text>
            </View>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              disabled={isLoading}
              contentStyle={styles.buttonContent}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                'Sign In'
              )}
            </Button>

            <Button
              mode="outlined"
              onPress={() => {
                setEmail('test2@example.com');
                setPassword('password123');
              }}
              style={styles.fillButton}
            >
              Fill Test Credentials
            </Button>

            <Button
              mode="outlined"
              onPress={async () => {
                console.log('Testing API connection...');
                const result = await testApiConnection();
                Alert.alert('API Test', result.success ? 'API Connected!' : `API Error: ${result.error}`);
              }}
              style={styles.testButton}
            >
              Test API Connection
            </Button>

            <Button
              mode="text"
              onPress={() => {
                navigation.navigate('Register');
              }}
              style={styles.registerButton}
            >
              Don't have an account? Sign Up
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 10,
    borderRadius: 8,
  },
  fillButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  testButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  registerButton: {
    marginTop: 16,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  testCredentials: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  testText: {
    fontSize: 12,
    color: '#1976D2',
    marginBottom: 2,
  },
});

export default LoginScreen;
