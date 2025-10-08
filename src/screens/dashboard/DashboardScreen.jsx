import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Chip,
  Surface,
} from 'react-native-paper';
import { Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { pipelineAPI, forecastAPI, activitiesAPI } from '../../services/api';

const StatCard = ({ title, value, subtitle, icon, color = '#2196F3' }) => (
  <Surface style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statCardContent}>
      <View style={styles.statCardLeft}>
        <Title style={[styles.statValue, { color }]}>{value}</Title>
        <Paragraph style={styles.statTitle}>{title}</Paragraph>
        {subtitle && (
          <Paragraph style={styles.statSubtitle}>{subtitle}</Paragraph>
        )}
      </View>
        <View style={styles.statCardRight}>
          <Text style={{ fontSize: 32, color }}>{icon}</Text>
        </View>
    </View>
  </Surface>
);

const DashboardScreen = () => {
  const { user, token } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    totalValue: 0,
    weightedValue: 0,
    upcomingClosing: 0,
    expectedClosing: 0,
    pendingActivities: 0,
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!token) {
        console.log('No token available, using default stats');
        setStats({
          totalOpportunities: 0,
          totalValue: 0,
          weightedValue: 0,
          upcomingClosing: 0,
          expectedClosing: 0,
          pendingActivities: 0,
        });
        return;
      }
      
      console.log('Loading dashboard data with token:', token.substring(0, 20) + '...');
      
      // Load real dashboard stats from API
      const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      const response = await fetch(`${baseURL}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Dashboard API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Dashboard API error response:', errorText);
        throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
      }

      const result = await response.json();
      console.log('Dashboard API success response:', result);
      
      if (result.status === 'success') {
        setStats({
          totalOpportunities: result.data.totalOpportunities || 0,
          totalValue: result.data.totalValue || 0,
          weightedValue: result.data.weightedValue || 0,
          upcomingClosing: result.data.upcomingClosing || 0,
          expectedClosing: result.data.expectedClosing || 0,
          pendingActivities: result.data.pendingActivities || 0,
        });
      } else {
        throw new Error(result.message || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default stats on error
      setStats({
        totalOpportunities: 0,
        totalValue: 0,
        weightedValue: 0,
        upcomingClosing: 0,
        expectedClosing: 0,
        pendingActivities: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Paragraph style={styles.loadingText}>Loading dashboard...</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={styles.welcomeTitle}>
          Welcome back, {user?.name || 'User'}!
        </Title>
        <Paragraph style={styles.welcomeSubtitle}>
          Here's what's happening with your CRM today
        </Paragraph>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          title="Total Opportunities"
          value={stats.totalOpportunities}
          subtitle="Active deals"
          icon="📈"
          color="#4CAF50"
        />
        
        <StatCard
          title="Pipeline Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          subtitle="Total opportunity value"
          icon="💰"
          color="#FF9800"
        />
        
        <StatCard
          title="Weighted Value"
          value={`$${stats.weightedValue.toLocaleString()}`}
          subtitle="Probability weighted"
          icon="⚖️"
          color="#9C27B0"
        />
        
        <StatCard
          title="Upcoming Closes"
          value={stats.upcomingClosing}
          subtitle="Next 30 days"
          icon="⏰"
          color="#F44336"
        />
        
        <StatCard
          title="Expected Closes"
          value={stats.expectedClosing}
          subtitle="Next 60 days"
          icon="📅"
          color="#607D8B"
        />
        
        <StatCard
          title="Pending Activities"
          value={stats.pendingActivities}
          subtitle="Tasks to complete"
          icon="📋"
          color="#795548"
        />
      </View>

      <Card style={styles.quickActionsCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Quick Actions</Title>
          <View style={styles.quickActions}>
            <Button
              mode="contained"
              icon="➕"
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Pipeline')}
            >
              New Opportunity
            </Button>
            
            <Button
              mode="outlined"
              icon="👤"
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Leads')}
            >
              Add Lead
            </Button>
            
            <Button
              mode="outlined"
              icon="📅"
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Activities')}
            >
              Schedule Activity
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.recentActivityCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Recent Activity</Title>
          <View style={styles.activityItem}>
            <Text style={{ fontSize: 20, color: '#4CAF50' }}>📊</Text>
            <View style={styles.activityContent}>
              <Paragraph style={styles.activityText}>
                Welcome to Calyx CRM! Your dashboard is ready.
              </Paragraph>
              <Paragraph style={styles.activityTime}>Just now</Paragraph>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <Text style={{ fontSize: 20, color: '#2196F3' }}>👤</Text>
            <View style={styles.activityContent}>
              <Paragraph style={styles.activityText}>
                Account created successfully
              </Paragraph>
              <Paragraph style={styles.activityTime}>Just now</Paragraph>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <Text style={{ fontSize: 20, color: '#FF9800' }}>📋</Text>
            <View style={styles.activityContent}>
              <Paragraph style={styles.activityText}>
                Ready to start managing your CRM
              </Paragraph>
              <Paragraph style={styles.activityTime}>Just now</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    padding: 16,
  },
  statCard: {
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    elevation: 2,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  statCardLeft: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  statCardRight: {
    paddingLeft: 16,
  },
  quickActionsCard: {
    margin: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: 120,
  },
  recentActivityCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default DashboardScreen;
