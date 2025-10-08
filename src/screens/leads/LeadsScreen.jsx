import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Avatar,
  Chip,
  Searchbar,
  FAB,
  TextInput,
  Portal,
  Modal as PaperModal,
} from 'react-native-paper';
import { Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const LeadsScreen = () => {
  const { user, token } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newLead, setNewLead] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    source: 'website',
    estimatedValue: '',
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!token) {
        console.log('No token available for leads');
        setLeads([]);
        return;
      }
      
      console.log('Loading leads with token:', token.substring(0, 20) + '...');
      
      const response = await fetch('http://192.168.1.100:3000/api/leads', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Leads API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Leads API error response:', errorText);
        throw new Error(`Failed to fetch leads: ${response.status}`);
      }

      const result = await response.json();
      console.log('Leads API success response:', result);
      
      if (result.status === 'success') {
        setLeads(result.data.leads);
      } else {
        throw new Error(result.message || 'Failed to load leads');
      }
    } catch (error) {
      console.error('Error loading leads:', error);
      Alert.alert('Error', 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = () => {
    setNewLead({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      source: 'website',
      estimatedValue: '',
    });
    setModalVisible(true);
  };

  const handleSaveLead = async () => {
    if (!newLead.firstName || !newLead.lastName || !newLead.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Please log in to create leads');
      return;
    }

    try {
      console.log('Creating lead with data:', newLead);
      
      const response = await fetch('http://192.168.1.100:3000/api/leads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newLead,
          estimatedValue: newLead.estimatedValue ? parseInt(newLead.estimatedValue) : undefined,
        }),
      });

      console.log('Create lead API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Create lead API error response:', errorText);
        throw new Error(`Failed to create lead: ${response.status}`);
      }

      const result = await response.json();
      console.log('Create lead API success response:', result);
      
      if (result.status === 'success') {
        Alert.alert('Success', 'Lead created successfully');
        setModalVisible(false);
        loadLeads(); // Reload leads
      } else {
        throw new Error(result.message || 'Failed to create lead');
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      Alert.alert('Error', 'Failed to create lead');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLeads().finally(() => setRefreshing(false));
  };

  const getStatusColor = (status) => {
    const colorMap = {
      new: '#2196F3',
      contacted: '#FF9800',
      qualified: '#4CAF50',
      unqualified: '#F44336',
      converted: '#9C27B0',
      lost: '#607D8B',
    };
    return colorMap[status] || '#666';
  };

  const getSourceIcon = (source) => {
    const iconMap = {
      website: '🌐',
      referral: '👥',
      cold_call: '📞',
      email: '📧',
      social_media: '📱',
      advertisement: '📢',
      event: '🎉',
      other: '❓',
    };
    return iconMap[source] || '❓';
  };

  const LeadCard = ({ lead }) => (
    <Card style={styles.leadCard}>
      <Card.Content>
        <View style={styles.leadHeader}>
          <Avatar.Text
            size={40}
            label={`${lead.firstName.charAt(0)}${lead.lastName.charAt(0)}`}
            style={styles.leadAvatar}
          />
          <View style={styles.leadInfo}>
            <Title style={styles.leadName}>
              {lead.firstName} {lead.lastName}
            </Title>
            <Paragraph style={styles.leadCompany}>
              {lead.company || 'No company'}
            </Paragraph>
          </View>
          <Chip
            mode="outlined"
            style={[styles.statusChip, { borderColor: getStatusColor(lead.status) }]}
            textStyle={{ color: getStatusColor(lead.status) }}
          >
            {lead.status}
          </Chip>
        </View>

        <View style={styles.leadDetails}>
          <View style={styles.detailRow}>
            <Text style={{ fontSize: 16, color: '#666' }}>📧</Text>
            <Paragraph style={styles.detailText}>{lead.email}</Paragraph>
          </View>
          
          {lead.phone && (
            <View style={styles.detailRow}>
              <Text style={{ fontSize: 16, color: '#666' }}>📞</Text>
              <Paragraph style={styles.detailText}>{lead.phone}</Paragraph>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={{ fontSize: 16, color: '#666' }}>{getSourceIcon(lead.source)}</Text>
            <Paragraph style={styles.detailText}>
              {lead.source.charAt(0).toUpperCase() + lead.source.slice(1)}
            </Paragraph>
          </View>

          {lead.assignedTo && (
            <View style={styles.detailRow}>
              <Text style={{ fontSize: 16, color: '#666' }}>👤</Text>
              <Paragraph style={styles.detailText}>
                {lead.assignedTo.name}
              </Paragraph>
            </View>
          )}
        </View>

        {lead.estimatedValue && (
          <View style={styles.valueSection}>
            <Paragraph style={styles.valueLabel}>Estimated Value:</Paragraph>
            <Paragraph style={styles.valueText}>
              ${lead.estimatedValue.toLocaleString()}
            </Paragraph>
          </View>
        )}

        {lead.nextFollowUpDate && (
          <View style={styles.followUpSection}>
            <Paragraph style={styles.followUpLabel}>Next Follow-up:</Paragraph>
            <Paragraph style={[
              styles.followUpText,
              new Date(lead.nextFollowUpDate) < new Date() && styles.overdue
            ]}>
              {new Date(lead.nextFollowUpDate).toLocaleDateString()}
            </Paragraph>
          </View>
        )}

        {lead.tags && lead.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {lead.tags.map((tag, index) => (
              <Chip key={index} style={styles.tagChip} textStyle={styles.tagText}>
                {tag}
              </Chip>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Paragraph style={styles.loadingText}>Loading leads...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Leads</Title>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => {
            Alert.alert('Info', 'Add new lead feature coming soon!');
          }}
          style={styles.addButton}
        >
          New Lead
        </Button>
      </View>

      <Searchbar
        placeholder="Search leads..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView
        style={styles.leadsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {leads
          .filter(lead =>
            lead.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.company?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((lead) => (
            <LeadCard key={lead._id} lead={lead} />
          ))}

        {leads.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 64, color: '#ccc' }}>👥</Text>
            <Title style={styles.emptyTitle}>No Leads Found</Title>
            <Paragraph style={styles.emptyText}>
              Add your first lead to get started
            </Paragraph>
          </View>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="New Lead"
        onPress={handleAddLead}
      />

      <Portal>
        <PaperModal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Add New Lead</Title>
          
          <TextInput
            label="First Name *"
            value={newLead.firstName}
            onChangeText={(text) => setNewLead({ ...newLead, firstName: text })}
            mode="outlined"
            style={styles.modalInput}
          />
          
          <TextInput
            label="Last Name *"
            value={newLead.lastName}
            onChangeText={(text) => setNewLead({ ...newLead, lastName: text })}
            mode="outlined"
            style={styles.modalInput}
          />
          
          <TextInput
            label="Email *"
            value={newLead.email}
            onChangeText={(text) => setNewLead({ ...newLead, email: text })}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.modalInput}
          />
          
          <TextInput
            label="Phone"
            value={newLead.phone}
            onChangeText={(text) => setNewLead({ ...newLead, phone: text })}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.modalInput}
          />
          
          <TextInput
            label="Company"
            value={newLead.company}
            onChangeText={(text) => setNewLead({ ...newLead, company: text })}
            mode="outlined"
            style={styles.modalInput}
          />
          
          <TextInput
            label="Estimated Value"
            value={newLead.estimatedValue}
            onChangeText={(text) => setNewLead({ ...newLead, estimatedValue: text })}
            mode="outlined"
            keyboardType="numeric"
            style={styles.modalInput}
          />
          
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveLead}
              style={styles.modalButton}
            >
              Save Lead
            </Button>
          </View>
        </PaperModal>
      </Portal>
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
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  leadsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  leadCard: {
    marginBottom: 12,
    elevation: 2,
  },
  leadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  leadAvatar: {
    backgroundColor: '#FF9800',
    marginRight: 12,
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  leadCompany: {
    fontSize: 14,
    color: '#666',
  },
  statusChip: {
    height: 24,
  },
  leadDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  valueSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  valueLabel: {
    fontSize: 14,
    color: '#666',
  },
  valueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  followUpSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  followUpLabel: {
    fontSize: 14,
    color: '#666',
  },
  followUpText: {
    fontSize: 14,
    color: '#333',
  },
  overdue: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  tagChip: {
    backgroundColor: '#E3F2FD',
    height: 24,
  },
  tagText: {
    fontSize: 12,
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
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default LeadsScreen;
