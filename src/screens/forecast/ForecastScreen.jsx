import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { Text } from 'react-native';
import { forecastAPI } from '../../services/api';

const ForecastScreen = () => {
  const [forecastData, setForecastData] = useState({
    upcomingClosing: [],
    expectedClosing: [],
    totalValue: 0,
    weightedValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadForecastData();
  }, []);

  const loadForecastData = async () => {
    try {
      setLoading(true);
      const response = await forecastAPI.getOverview();
      setForecastData(response.data.data);
    } catch (error) {
      console.error('Error loading forecast data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadForecastData().finally(() => setRefreshing(false));
  };

  const ForecastCard = ({ title, data, icon, color }) => (
    <Card style={styles.forecastCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Icon name={icon} size={24} color={color} />
          </View>
          <View style={styles.cardInfo}>
            <Title style={styles.cardTitle}>{title}</Title>
            <Paragraph style={styles.cardSubtitle}>
              {data.length} opportunities
            </Paragraph>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          {data.map((item, index) => (
            <View key={index} style={styles.opportunityItem}>
              <View style={styles.opportunityInfo}>
                <Paragraph style={styles.opportunityTitle}>
                  {item.title}
                </Paragraph>
                <Paragraph style={styles.opportunityCustomer}>
                  {item.customer?.name || 'No customer'}
                </Paragraph>
              </View>
              <View style={styles.opportunityValue}>
                <Paragraph style={styles.valueText}>
                  ${item.value?.toLocaleString() || '0'}
                </Paragraph>
                <Paragraph style={styles.dateText}>
                  {item.expectedCloseDate 
                    ? new Date(item.expectedCloseDate).toLocaleDateString()
                    : 'No date'
                  }
                </Paragraph>
              </View>
            </View>
          ))}
          
          {data.length === 0 && (
            <Paragraph style={styles.emptyText}>
              No opportunities in this category
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
        <Paragraph style={styles.loadingText}>Loading forecast...</Paragraph>
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
        <Title style={styles.headerTitle}>Sales Forecast</Title>
        <Paragraph style={styles.headerSubtitle}>
          Track your sales pipeline and revenue projections
        </Paragraph>
      </View>

      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.summaryTitle}>Pipeline Summary</Title>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Paragraph style={styles.summaryLabel}>Total Value</Paragraph>
                <Paragraph style={styles.summaryValue}>
                  ${forecastData.totalValue?.toLocaleString() || '0'}
                </Paragraph>
              </View>
              <View style={styles.summaryItem}>
                <Paragraph style={styles.summaryLabel}>Weighted Value</Paragraph>
                <Paragraph style={[styles.summaryValue, { color: '#4CAF50' }]}>
                  ${forecastData.weightedValue?.toLocaleString() || '0'}
                </Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      <ForecastCard
        title="Upcoming Closing"
        data={forecastData.upcomingClosing}
        icon="schedule"
        color="#F44336"
      />

      <ForecastCard
        title="Expected Closing"
        data={forecastData.expectedClosing}
        icon="event"
        color="#2196F3"
      />
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  summaryContainer: {
    padding: 16,
  },
  summaryCard: {
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  forecastCard: {
    margin: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  cardContent: {
    gap: 12,
  },
  opportunityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  opportunityInfo: {
    flex: 1,
    marginRight: 12,
  },
  opportunityTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  opportunityCustomer: {
    fontSize: 12,
    color: '#666',
  },
  opportunityValue: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
});

export default ForecastScreen;
