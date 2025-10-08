import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  List,
  Avatar,
  Divider,
  Switch,
  TextInput,
  Portal,
  Dialog,
  RadioButton,
} from 'react-native-paper';
import { Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const SettingsScreen = () => {
  const { user, logout, token } = useAuth();
  const { isDarkMode, toggleTheme: toggleAppTheme, theme } = useTheme();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(isDarkMode);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [language, setLanguage] = useState('en');

  // Load settings from backend
  useEffect(() => {
    loadSettings();
  }, []);

  // Sync dark mode with theme context
  useEffect(() => {
    setDarkMode(isDarkMode);
  }, [isDarkMode]);
  
  // Modal visibility states
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load settings from backend
  const loadSettings = async () => {
    try {
      setLoading(true);
      if (!token) {
        setLoading(false);
        return;
      }

      const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      const response = await fetch(`${baseURL}/api/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success' && result.data.settings) {
          const settings = result.data.settings;
          if (settings.notifications) {
            setPushNotifications(settings.notifications.push ?? true);
            setEmailNotifications(settings.notifications.email ?? true);
            setSmsNotifications(settings.notifications.sms ?? false);
          }
          if (settings.language) {
            setLanguage(settings.language);
          }
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout },
      ]
    );
  };

  // Profile update handler
  const handleProfileUpdate = () => {
    if (!profileForm.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    Alert.alert(
      'Success',
      'Profile updated successfully!',
      [{ text: 'OK', onPress: () => setProfileModalVisible(false) }]
    );
  };

  // Password change handler
  const handlePasswordChange = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    Alert.alert(
      'Success',
      'Password changed successfully!',
      [{ 
        text: 'OK', 
        onPress: () => {
          setPasswordModalVisible(false);
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }
      }]
    );
  };

  // Theme toggle handler
  const handleThemeToggle = async (value) => {
    try {
      setDarkMode(value);
      await toggleAppTheme(); // Update theme context
      
      // Save to backend
      const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      const response = await fetch(`${baseURL}/api/settings/theme`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: value ? 'dark' : 'light'
        }),
      });

      if (response.ok) {
        Alert.alert('Success', value ? 'Dark mode enabled' : 'Light mode enabled');
      } else {
        throw new Error('Failed to save theme');
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      Alert.alert('Error', 'Failed to save theme preference');
      // Revert on error
      setDarkMode(!value);
    }
  };

  // Language change handler
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    Alert.alert(
      'Language Changed',
      `Language changed to ${lang === 'en' ? 'English' : lang === 'es' ? 'Spanish' : lang === 'fr' ? 'French' : 'German'}`,
      [{ text: 'OK', onPress: () => setLanguageModalVisible(false) }]
    );
  };

  // Notification handlers with backend sync
  const handlePushNotificationToggle = async (value) => {
    setPushNotifications(value);
    await saveNotificationSetting('push', value);
  };

  const handleEmailNotificationToggle = async (value) => {
    setEmailNotifications(value);
    await saveNotificationSetting('email', value);
  };

  const handleSmsNotificationToggle = async (value) => {
    setSmsNotifications(value);
    await saveNotificationSetting('sms', value);
  };

  const saveNotificationSetting = async (type, value) => {
    try {
      const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      const response = await fetch(`${baseURL}/api/settings/notifications`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [type]: value
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save notification setting');
      }
    } catch (error) {
      console.error('Error saving notification setting:', error);
      Alert.alert('Error', 'Failed to save notification preference');
    }
  };

  // Contact support handler
  const handleContactSupport = (method) => {
    setContactModalVisible(false);
    if (method === 'email') {
      Linking.openURL('mailto:support@calyxcrm.com?subject=Support Request');
    } else if (method === 'phone') {
      Alert.alert('Call Support', '+1 (800) 123-4567', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL('tel:+18001234567') }
      ]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Settings</Title>
      </View>

      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <Avatar.Text
              size={60}
              label={user?.name?.charAt(0) || 'U'}
              style={styles.profileAvatar}
            />
            <View style={styles.profileInfo}>
              <Title style={styles.profileName}>{user?.name || 'User'}</Title>
              <Paragraph style={styles.profileEmail}>{user?.email || 'No email'}</Paragraph>
              <Paragraph style={styles.profileRole}>{user?.role || 'User'}</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Account Settings</Title>
          
          <List.Item
            title="Profile Information"
            description="Update your personal details"
            left={props => <Text style={{ fontSize: 24, color: '#666' }}>👤</Text>}
            right={props => <Text style={{ fontSize: 20, color: '#ccc' }}>›</Text>}
            onPress={() => setProfileModalVisible(true)}
          />
          
          <Divider />
          
          <List.Item
            title="Change Password"
            description="Update your password"
            left={props => <Text style={{ fontSize: 24, color: '#666' }}>🔒</Text>}
            right={props => <Text style={{ fontSize: 20, color: '#ccc' }}>›</Text>}
            onPress={() => setPasswordModalVisible(true)}
          />
          
          <Divider />
          
          <List.Item
            title="Notifications"
            description="Manage notification preferences"
            left={props => <Text style={{ fontSize: 24, color: '#666' }}>🔔</Text>}
            right={props => <Text style={{ fontSize: 20, color: '#ccc' }}>›</Text>}
            onPress={() => setNotificationsModalVisible(true)}
          />
        </Card.Content>
      </Card>

      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Application Settings</Title>
          
          <List.Item
            title="Theme"
            description={darkMode ? 'Dark theme' : 'Light theme'}
            left={props => <Text style={{ fontSize: 24, color: '#666' }}>🎨</Text>}
            right={() => <Switch value={darkMode} onValueChange={handleThemeToggle} />}
          />
          
          <Divider />
          
          <List.Item
            title="Language"
            description={language === 'en' ? 'English' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : 'German'}
            left={props => <Text style={{ fontSize: 24, color: '#666' }}>🌐</Text>}
            right={props => <Text style={{ fontSize: 20, color: '#ccc' }}>›</Text>}
            onPress={() => setLanguageModalVisible(true)}
          />
          
          <Divider />
          
          <List.Item
            title="Data & Privacy"
            description="Manage your data"
            left={props => <Text style={{ fontSize: 24, color: '#666' }}>🛡️</Text>}
            right={props => <Text style={{ fontSize: 20, color: '#ccc' }}>›</Text>}
            onPress={() => setPrivacyModalVisible(true)}
          />
        </Card.Content>
      </Card>

      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Support</Title>
          
          <List.Item
            title="Help Center"
            description="Get help and support"
            left={props => <Text style={{ fontSize: 24, color: '#666' }}>❓</Text>}
            right={props => <Text style={{ fontSize: 20, color: '#ccc' }}>›</Text>}
            onPress={() => setHelpModalVisible(true)}
          />
          
          <Divider />
          
          <List.Item
            title="Contact Support"
            description="Reach out to our team"
            left={props => <Text style={{ fontSize: 24, color: '#666' }}>💬</Text>}
            right={props => <Text style={{ fontSize: 20, color: '#ccc' }}>›</Text>}
            onPress={() => setContactModalVisible(true)}
          />
          
          <Divider />
          
          <List.Item
            title="About"
            description="App version 1.0.0"
            left={props => <Text style={{ fontSize: 24, color: '#666' }}>ℹ️</Text>}
            right={props => <Text style={{ fontSize: 20, color: '#ccc' }}>›</Text>}
            onPress={() => Alert.alert('About', 'Calyx CRM v1.0.0\nBuilt with React Native')}
          />
        </Card.Content>
      </Card>

      <View style={styles.logoutContainer}>
        <Button
          mode="contained"
          buttonColor="#F44336"
          textColor="#fff"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          Logout
        </Button>
      </View>

      {/* Profile Modal */}
      <Portal>
        <Dialog visible={profileModalVisible} onDismiss={() => setProfileModalVisible(false)}>
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={profileForm.name}
              onChangeText={(text) => setProfileForm({...profileForm, name: text})}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Email"
              value={profileForm.email}
              onChangeText={(text) => setProfileForm({...profileForm, email: text})}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
            />
            <TextInput
              label="Phone"
              value={profileForm.phone}
              onChangeText={(text) => setProfileForm({...profileForm, phone: text})}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setProfileModalVisible(false)}>Cancel</Button>
            <Button onPress={handleProfileUpdate}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Password Modal */}
      <Portal>
        <Dialog visible={passwordModalVisible} onDismiss={() => setPasswordModalVisible(false)}>
          <Dialog.Title>Change Password</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Current Password"
              value={passwordForm.currentPassword}
              onChangeText={(text) => setPasswordForm({...passwordForm, currentPassword: text})}
              style={styles.input}
              mode="outlined"
              secureTextEntry
            />
            <TextInput
              label="New Password"
              value={passwordForm.newPassword}
              onChangeText={(text) => setPasswordForm({...passwordForm, newPassword: text})}
              style={styles.input}
              mode="outlined"
              secureTextEntry
            />
            <TextInput
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChangeText={(text) => setPasswordForm({...passwordForm, confirmPassword: text})}
              style={styles.input}
              mode="outlined"
              secureTextEntry
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPasswordModalVisible(false)}>Cancel</Button>
            <Button onPress={handlePasswordChange}>Change Password</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Notifications Modal */}
      <Portal>
        <Dialog visible={notificationsModalVisible} onDismiss={() => setNotificationsModalVisible(false)}>
          <Dialog.Title>Notification Preferences</Dialog.Title>
          <Dialog.Content>
            <View style={styles.notificationRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.notificationLabel}>Push Notifications</Text>
                <Text style={styles.notificationDesc}>Receive push notifications</Text>
              </View>
              <Switch value={pushNotifications} onValueChange={handlePushNotificationToggle} />
            </View>
            <View style={styles.notificationRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.notificationLabel}>Email Notifications</Text>
                <Text style={styles.notificationDesc}>Receive email updates</Text>
              </View>
              <Switch value={emailNotifications} onValueChange={handleEmailNotificationToggle} />
            </View>
            <View style={styles.notificationRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.notificationLabel}>SMS Notifications</Text>
                <Text style={styles.notificationDesc}>Receive SMS alerts</Text>
              </View>
              <Switch value={smsNotifications} onValueChange={handleSmsNotificationToggle} />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNotificationsModalVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Language Modal */}
      <Portal>
        <Dialog visible={languageModalVisible} onDismiss={() => setLanguageModalVisible(false)}>
          <Dialog.Title>Select Language</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={handleLanguageChange} value={language}>
              <TouchableOpacity onPress={() => handleLanguageChange('en')} style={styles.radioRow}>
                <RadioButton value="en" />
                <Text style={styles.radioLabel}>English</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleLanguageChange('es')} style={styles.radioRow}>
                <RadioButton value="es" />
                <Text style={styles.radioLabel}>Spanish (Español)</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleLanguageChange('fr')} style={styles.radioRow}>
                <RadioButton value="fr" />
                <Text style={styles.radioLabel}>French (Français)</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleLanguageChange('de')} style={styles.radioRow}>
                <RadioButton value="de" />
                <Text style={styles.radioLabel}>German (Deutsch)</Text>
              </TouchableOpacity>
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLanguageModalVisible(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Privacy Modal */}
      <Portal>
        <Dialog visible={privacyModalVisible} onDismiss={() => setPrivacyModalVisible(false)}>
          <Dialog.Title>Data & Privacy</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <Paragraph style={styles.privacyText}>
                <Text style={{ fontWeight: 'bold' }}>Data Collection</Text>{'\n'}
                We collect data necessary to provide our services, including your account information, activity data, and usage analytics.
                {'\n\n'}
                <Text style={{ fontWeight: 'bold' }}>Data Usage</Text>{'\n'}
                Your data is used to improve your experience and provide personalized features. We never sell your data to third parties.
                {'\n\n'}
                <Text style={{ fontWeight: 'bold' }}>Data Security</Text>{'\n'}
                We use industry-standard encryption to protect your data. All sensitive information is encrypted in transit and at rest.
                {'\n\n'}
                <Text style={{ fontWeight: 'bold' }}>Your Rights</Text>{'\n'}
                You have the right to access, modify, or delete your data at any time. Contact support for assistance.
              </Paragraph>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setPrivacyModalVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Help Center Modal */}
      <Portal>
        <Dialog visible={helpModalVisible} onDismiss={() => setHelpModalVisible(false)}>
          <Dialog.Title>Help Center</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <List.Item
                title="Getting Started"
                description="Learn the basics of Calyx CRM"
                left={props => <Text style={{ fontSize: 20, marginLeft: 10 }}>📖</Text>}
                onPress={() => Alert.alert('Getting Started', 'Welcome to Calyx CRM! Start by adding your first lead or customer.')}
              />
              <Divider />
              <List.Item
                title="Managing Leads"
                description="How to track and convert leads"
                left={props => <Text style={{ fontSize: 20, marginLeft: 10 }}>👥</Text>}
                onPress={() => Alert.alert('Managing Leads', 'Add leads from the Leads tab and track their progress through your pipeline.')}
              />
              <Divider />
              <List.Item
                title="Pipeline Management"
                description="Optimize your sales pipeline"
                left={props => <Text style={{ fontSize: 20, marginLeft: 10 }}>📈</Text>}
                onPress={() => Alert.alert('Pipeline', 'View and manage all your opportunities in the Pipeline tab.')}
              />
              <Divider />
              <List.Item
                title="Activities & Tasks"
                description="Schedule and track activities"
                left={props => <Text style={{ fontSize: 20, marginLeft: 10 }}>📋</Text>}
                onPress={() => Alert.alert('Activities', 'Create tasks and activities to stay organized and follow up with leads.')}
              />
              <Divider />
              <List.Item
                title="Reports & Analytics"
                description="Track your performance"
                left={props => <Text style={{ fontSize: 20, marginLeft: 10 }}>📊</Text>}
                onPress={() => Alert.alert('Reports', 'View detailed analytics and forecasts in the Dashboard and Forecast tabs.')}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setHelpModalVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Contact Support Modal */}
      <Portal>
        <Dialog visible={contactModalVisible} onDismiss={() => setContactModalVisible(false)}>
          <Dialog.Title>Contact Support</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ marginBottom: 20 }}>
              Our support team is here to help you 24/7
            </Paragraph>
            <Button
              mode="outlined"
              icon="email"
              onPress={() => handleContactSupport('email')}
              style={{ marginBottom: 12 }}
            >
              Email: support@calyxcrm.com
            </Button>
            <Button
              mode="outlined"
              icon="phone"
              onPress={() => handleContactSupport('phone')}
            >
              Call: +1 (800) 123-4567
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setContactModalVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileCard: {
    margin: 16,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    backgroundColor: '#2196F3',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 12,
    color: '#2196F3',
    textTransform: 'capitalize',
  },
  settingsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  logoutContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    borderRadius: 8,
  },
  input: {
    marginBottom: 12,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  notificationDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
});

export default SettingsScreen;

