import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Avatar,
  Chip,
  FAB,
} from 'react-native-paper';
import { Text } from 'react-native';
import { teamsAPI } from '../../services/api';

const TeamsScreen = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await teamsAPI.getAll({ isActive: true });
      setTeams(response.data.data.teams);
    } catch (error) {
      console.error('Error loading teams:', error);
      Alert.alert('Error', 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTeams().finally(() => setRefreshing(false));
  };

  const TeamCard = ({ team }) => (
    <Card style={styles.teamCard}>
      <Card.Content>
        <View style={styles.teamHeader}>
          <View style={styles.teamInfo}>
            <Title style={styles.teamName}>{team.name}</Title>
            <Paragraph style={styles.teamDescription}>
              {team.description || 'No description available'}
            </Paragraph>
          </View>
          <View style={styles.teamStats}>
            <Chip style={styles.memberChip}>
              {team.members?.length || 0} members
            </Chip>
          </View>
        </View>

        <View style={styles.managerSection}>
          <Paragraph style={styles.sectionLabel}>Team Manager</Paragraph>
          <View style={styles.managerInfo}>
            <Avatar.Text
              size={32}
              label={team.manager?.name?.charAt(0) || 'M'}
              style={styles.managerAvatar}
            />
            <Paragraph style={styles.managerName}>
              {team.manager?.name || 'Unassigned'}
            </Paragraph>
          </View>
        </View>

        {team.members && team.members.length > 0 && (
          <View style={styles.membersSection}>
            <Paragraph style={styles.sectionLabel}>Team Members</Paragraph>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {team.members.map((member, index) => (
                <View key={index} style={styles.memberItem}>
                  <Avatar.Text
                    size={28}
                    label={member.user?.name?.charAt(0) || 'U'}
                    style={styles.memberAvatar}
                  />
                  <Paragraph style={styles.memberName} numberOfLines={1}>
                    {member.user?.name || 'Unknown'}
                  </Paragraph>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.teamFooter}>
          <View style={styles.revenueSection}>
            <Paragraph style={styles.revenueLabel}>Revenue Target</Paragraph>
            <Paragraph style={styles.revenueValue}>
              ${team.targetRevenue?.toLocaleString() || '0'}
            </Paragraph>
          </View>
          <View style={styles.progressSection}>
            <Paragraph style={styles.progressLabel}>Progress</Paragraph>
            <Paragraph style={styles.progressValue}>
              {team.currentRevenue && team.targetRevenue 
                ? Math.round((team.currentRevenue / team.targetRevenue) * 100)
                : 0}%
            </Paragraph>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Paragraph style={styles.loadingText}>Loading teams...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Teams</Title>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => {
            Alert.alert('Info', 'Add new team feature coming soon!');
          }}
          style={styles.addButton}
        >
          New Team
        </Button>
      </View>

      <ScrollView
        style={styles.teamsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {teams.map((team) => (
          <TeamCard key={team._id} team={team} />
        ))}

        {teams.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="group" size={64} color="#ccc" />
            <Title style={styles.emptyTitle}>No Teams Found</Title>
            <Paragraph style={styles.emptyText}>
              Create your first team to get started
            </Paragraph>
            <Button
              mode="contained"
              onPress={() => {
                Alert.alert('Info', 'Add new team feature coming soon!');
              }}
              style={styles.emptyButton}
            >
              Create Team
            </Button>
          </View>
        )}
      </ScrollView>
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
  addButton: {
    borderRadius: 8,
  },
  teamsList: {
    flex: 1,
    padding: 16,
  },
  teamCard: {
    marginBottom: 16,
    elevation: 2,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  teamInfo: {
    flex: 1,
    marginRight: 16,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  teamDescription: {
    fontSize: 14,
    color: '#666',
  },
  teamStats: {
    alignItems: 'flex-end',
  },
  memberChip: {
    backgroundColor: '#E3F2FD',
  },
  managerSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  managerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  managerAvatar: {
    backgroundColor: '#2196F3',
    marginRight: 12,
  },
  managerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  membersSection: {
    marginBottom: 16,
  },
  memberItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
  },
  memberAvatar: {
    backgroundColor: '#4CAF50',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  teamFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  revenueSection: {
    flex: 1,
  },
  revenueLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
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
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 8,
  },
});

export default TeamsScreen;
