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
  Searchbar,
  FAB,
} from 'react-native-paper';
import { Text } from 'react-native';
import { customersAPI } from '../../services/api';

const CustomersScreen = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersAPI.getAll({ limit: 50 });
      setCustomers(response.data.data.customers);
    } catch (error) {
      console.error('Error loading customers:', error);
      Alert.alert('Error', 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCustomers().finally(() => setRefreshing(false));
  };

  const getStatusColor = (status) => {
    const colorMap = {
      active: '#4CAF50',
      inactive: '#F44336',
      prospect: '#FF9800',
      lead: '#2196F3',
    };
    return colorMap[status] || '#666';
  };

  const CustomerCard = ({ customer }) => (
    <Card style={styles.customerCard}>
      <Card.Content>
        <View style={styles.customerHeader}>
          <Avatar.Text
            size={40}
            label={customer.name.charAt(0).toUpperCase()}
            style={styles.customerAvatar}
          />
          <View style={styles.customerInfo}>
            <Title style={styles.customerName}>{customer.name}</Title>
            <Paragraph style={styles.customerCompany}>
              {customer.company || 'No company'}
            </Paragraph>
          </View>
          <Chip
            mode="outlined"
            style={[styles.statusChip, { borderColor: getStatusColor(customer.status) }]}
            textStyle={{ color: getStatusColor(customer.status) }}
          >
            {customer.status}
          </Chip>
        </View>

        <View style={styles.customerDetails}>
          <View style={styles.detailRow}>
            <Icon name="email" size={16} color="#666" />
            <Paragraph style={styles.detailText}>{customer.email}</Paragraph>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="phone" size={16} color="#666" />
            <Paragraph style={styles.detailText}>{customer.phone}</Paragraph>
          </View>

          {customer.salesperson && (
            <View style={styles.detailRow}>
              <Icon name="person" size={16} color="#666" />
              <Paragraph style={styles.detailText}>
                {customer.salesperson.name}
              </Paragraph>
            </View>
          )}

          {customer.address && (
            <View style={styles.detailRow}>
              <Icon name="location-on" size={16} color="#666" />
              <Paragraph style={styles.detailText}>
                {customer.address.city}, {customer.address.country}
              </Paragraph>
            </View>
          )}
        </View>

        {customer.tags && customer.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {customer.tags.map((tag, index) => (
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
        <Paragraph style={styles.loadingText}>Loading customers...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Customers</Title>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => {
            Alert.alert('Info', 'Add new customer feature coming soon!');
          }}
          style={styles.addButton}
        >
          New Customer
        </Button>
      </View>

      <Searchbar
        placeholder="Search customers..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView
        style={styles.customersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {customers
          .filter(customer =>
            customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.company?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((customer) => (
            <CustomerCard key={customer._id} customer={customer} />
          ))}

        {customers.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="people" size={64} color="#ccc" />
            <Title style={styles.emptyTitle}>No Customers Found</Title>
            <Paragraph style={styles.emptyText}>
              Add your first customer to get started
            </Paragraph>
          </View>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="New Customer"
        onPress={() => {
          Alert.alert('Info', 'Add new customer feature coming soon!');
        }}
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
  addButton: {
    borderRadius: 8,
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  customersList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  customerCard: {
    marginBottom: 12,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerAvatar: {
    backgroundColor: '#2196F3',
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  customerCompany: {
    fontSize: 14,
    color: '#666',
  },
  statusChip: {
    height: 24,
  },
  customerDetails: {
    gap: 8,
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
});

export default CustomersScreen;
