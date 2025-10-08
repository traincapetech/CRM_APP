import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Chip,
  FAB,
  Searchbar,
  Menu,
  Divider,
} from 'react-native-paper';
import { Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const ActivitiesScreen = () => {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activityTypes, setActivityTypes] = useState([
    'call', 'email', 'meeting', 'task', 'note', 'demo', 'proposal', 'follow_up'
  ]);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      
      if (!token) {
        console.log('No token available for activities');
        setActivities([]);
        return;
      }

      const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      const response = await fetch(`${baseURL}/api/activities`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        setActivities(result.data.activities || []);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadActivities().finally(() => setRefreshing(false));
  };

  const handleNewActivity = () => {
    Alert.alert(
      'Feature Coming Soon',
      'The ability to create new activities is currently under development. This feature will be available in the next update!',
      [
        {
          text: 'OK',
          style: 'default',
        }
      ],
      { cancelable: true }
    );
  };

  const getActivityIcon = (type) => {
    const iconMap = {
      call: '📞',
      email: '📧',
      meeting: '📅',
      task: '📋',
      note: '📝',
      demo: '▶️',
      proposal: '📄',
      follow_up: '🔄',
    };
    return iconMap[type] || '📋';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: '#FF9800',
      in_progress: '#2196F3',
      completed: '#4CAF50',
      cancelled: '#F44336',
    };
    return colorMap[status] || '#666';
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#F44336',
      urgent: '#9C27B0',
    };
    return colorMap[priority] || '#666';
  };

  const ActivityCard = ({ activity }) => (
    <Card style={styles.activityCard}>
      <Card.Content>
        <View style={styles.activityHeader}>
          <View style={styles.activityIconContainer}>
            <Text style={{ fontSize: 24, color: '#2196F3' }}>
              {getActivityIcon(activity.type)}
            </Text>
          </View>
          <View style={styles.activityInfo}>
            <Title style={styles.activitySubject} numberOfLines={2}>
              {activity.subject}
            </Title>
            <Paragraph style={styles.activityType}>
              {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
            </Paragraph>
          </View>
        </View>

        <View style={styles.activityDetails}>
          <View style={styles.activityRow}>
            <Paragraph style={styles.activityLabel}>Status:</Paragraph>
            <Chip
              mode="outlined"
              style={[styles.statusChip, { borderColor: getStatusColor(activity.status) }]}
              textStyle={{ color: getStatusColor(activity.status) }}
            >
              {activity.status.replace('_', ' ')}
            </Chip>
          </View>

          <View style={styles.activityRow}>
            <Paragraph style={styles.activityLabel}>Priority:</Paragraph>
            <Chip
              mode="outlined"
              style={[styles.priorityChip, { borderColor: getPriorityColor(activity.priority) }]}
              textStyle={{ color: getPriorityColor(activity.priority) }}
            >
              {activity.priority}
            </Chip>
          </View>

          {activity.dueDate && (
            <View style={styles.activityRow}>
              <Paragraph style={styles.activityLabel}>Due Date:</Paragraph>
              <Paragraph style={[
                styles.dueDate,
                new Date(activity.dueDate) < new Date() && activity.status !== 'completed' 
                  ? styles.overdue 
                  : null
              ]}>
                {new Date(activity.dueDate).toLocaleDateString()}
              </Paragraph>
            </View>
          )}

          {activity.customer && (
            <View style={styles.activityRow}>
              <Paragraph style={styles.activityLabel}>Customer:</Paragraph>
              <Paragraph style={styles.activityValue}>
                {activity.customer.name}
              </Paragraph>
            </View>
          )}

          <View style={styles.activityRow}>
            <Paragraph style={styles.activityLabel}>Assigned to:</Paragraph>
            <Paragraph style={styles.activityValue}>
              {activity.assignedTo?.name || 'Unassigned'}
            </Paragraph>
          </View>

          {activity.description && (
            <Paragraph style={styles.activityDescription} numberOfLines={3}>
              {activity.description}
            </Paragraph>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Paragraph style={styles.loadingText}>Loading activities...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Activities</Title>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              icon="filter-list"
              onPress={() => setMenuVisible(true)}
            >
              Filter
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setFilterType('all');
              setFilterStatus('all');
              setMenuVisible(false);
              loadActivities();
            }}
            title="All Activities"
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setFilterStatus('pending');
              setMenuVisible(false);
              loadActivities();
            }}
            title="Pending"
          />
          <Menu.Item
            onPress={() => {
              setFilterStatus('in_progress');
              setMenuVisible(false);
              loadActivities();
            }}
            title="In Progress"
          />
          <Menu.Item
            onPress={() => {
              setFilterStatus('completed');
              setMenuVisible(false);
              loadActivities();
            }}
            title="Completed"
          />
        </Menu>
      </View>

      <Searchbar
        placeholder="Search activities..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView
        style={styles.activitiesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activities
          .filter(activity =>
            activity.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.description?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((activity) => (
            <ActivityCard key={activity._id} activity={activity} />
          ))}

        {activities.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 64, color: '#ccc' }}>📋</Text>
            <Title style={styles.emptyTitle}>No Activities Found</Title>
            <Paragraph style={styles.emptyText}>
              Create your first activity to get started
            </Paragraph>
          </View>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="New Activity"
        onPress={handleNewActivity}
      />
    </View>
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
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  activitiesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  activityCard: {
    marginBottom: 12,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activitySubject: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  activityType: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  activityDetails: {
    gap: 8,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  activityValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusChip: {
    height: 24,
  },
  priorityChip: {
    height: 24,
  },
  dueDate: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  overdue: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});

export default ActivitiesScreen;
