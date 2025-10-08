import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  TextInput,
  Chip,
  Portal,
  Modal as PaperModal,
  Provider,
} from 'react-native-paper';
import { Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const PipelineScreen = () => {
  const { token } = useAuth();
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [stageData, setStageData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    value: '',
    expectedCloseDate: '',
    stage: '',
  });

  useEffect(() => {
    loadPipelines();
  }, []);

  const loadPipelines = async () => {
    try {
      setLoading(true);
      
      if (!token) {
        console.log('No token available for pipelines');
        setPipelines([]);
        return;
      }

      const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      const response = await fetch(`${baseURL}/api/pipeline`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch pipelines: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        let pipelineList = result.data.pipelines || [];
        
        // If no pipelines exist, create a default one
        if (pipelineList.length === 0) {
          pipelineList = await createDefaultPipeline();
        }
        
        setPipelines(pipelineList);
        
        // Select first pipeline by default
        if (pipelineList.length > 0) {
          setSelectedPipeline(pipelineList[0]);
          loadPipelineData(pipelineList[0]._id);
        }
      }
    } catch (error) {
      console.error('Error loading pipelines:', error);
      // Fallback to mock data
      const mockPipelines = [{
        _id: '1',
        name: 'Sales Pipeline',
        stages: [
          { name: 'Lead', probability: 10, color: '#FF9800' },
          { name: 'Qualified', probability: 25, color: '#2196F3' },
          { name: 'Proposal', probability: 50, color: '#9C27B0' },
          { name: 'Negotiation', probability: 75, color: '#FF5722' },
          { name: 'Closed Won', probability: 100, color: '#4CAF50' },
        ]
      }];
      setPipelines(mockPipelines);
      setSelectedPipeline(mockPipelines[0]);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPipeline = async () => {
    try {
      const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      const response = await fetch(`${baseURL}/api/pipeline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Sales Pipeline',
          description: 'Default sales pipeline',
          isDefault: true,
          stages: [
            { name: 'Lead', probability: 10, color: '#FF9800', order: 1 },
            { name: 'Qualified', probability: 25, color: '#2196F3', order: 2 },
            { name: 'Proposal', probability: 50, color: '#9C27B0', order: 3 },
            { name: 'Negotiation', probability: 75, color: '#FF5722', order: 4 },
            { name: 'Closed Won', probability: 100, color: '#4CAF50', order: 5 },
          ]
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return [result.data.pipeline];
      }
    } catch (error) {
      console.error('Error creating default pipeline:', error);
    }
    return [];
  };

  const loadPipelineData = async (pipelineId) => {
    try {
      if (!token || !pipelineId) return;

      const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      const response = await fetch(`${baseURL}/api/pipeline/${pipelineId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          setStageData(result.data.stageData || {});
        }
      }
    } catch (error) {
      console.error('Error loading pipeline data:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPipelines().finally(() => setRefreshing(false));
  };

  const handlePipelineSelect = (pipeline) => {
    setSelectedPipeline(pipeline);
    loadPipelineData(pipeline._id);
  };

  const handleAddOpportunity = () => {
    if (!selectedPipeline) {
      Alert.alert('Error', 'Please select a pipeline first');
      return;
    }
    setNewOpportunity({
      title: '',
      value: '',
      expectedCloseDate: '',
      stage: selectedPipeline.stages[0]?.name || '',
    });
    setModalVisible(true);
  };

  const handleSaveOpportunity = async () => {
    if (!newOpportunity.title || !newOpportunity.value) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      const response = await fetch(`${baseURL}/api/opportunities`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newOpportunity.title,
          value: parseFloat(newOpportunity.value),
          expectedCloseDate: newOpportunity.expectedCloseDate || null,
          stage: newOpportunity.stage,
          pipeline: selectedPipeline._id,
          customer: '507f1f77bcf86cd799439011', // Mock customer ID
          salesperson: '507f1f77bcf86cd799439012', // Mock salesperson ID
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Opportunity created successfully');
        setModalVisible(false);
        setNewOpportunity({ title: '', value: '', expectedCloseDate: '', stage: '' });
        loadPipelineData(selectedPipeline._id);
      } else {
        throw new Error('Failed to create opportunity');
      }
    } catch (error) {
      console.error('Error creating opportunity:', error);
      Alert.alert('Error', 'Failed to create opportunity');
    }
  };

  const getStageColor = (stageName) => {
    if (!selectedPipeline) return '#2196F3';
    const stage = selectedPipeline.stages.find(s => s.name === stageName);
    return stage?.color || '#2196F3';
  };

  const OpportunityCard = ({ opportunity }) => (
    <Card style={styles.opportunityCard}>
      <Card.Content>
        <View style={styles.opportunityHeader}>
          <Title style={styles.opportunityTitle} numberOfLines={1}>
            {opportunity.title}
          </Title>
          <Chip
            mode="outlined"
            style={[styles.stageChip, { borderColor: getStageColor(opportunity.stage) }]}
            textStyle={{ color: getStageColor(opportunity.stage) }}
          >
            {opportunity.stage}
          </Chip>
        </View>
        
        <View style={styles.opportunityDetails}>
          <Paragraph style={styles.opportunityValue}>
            ${opportunity.value?.toLocaleString() || '0'}
          </Paragraph>
          <Paragraph style={styles.opportunityCustomer}>
            {opportunity.customer?.name || 'No customer'}
          </Paragraph>
        </View>
        
        <View style={styles.opportunityFooter}>
          <Paragraph style={styles.opportunitySalesperson}>
            {opportunity.salesperson?.name || 'Unassigned'}
          </Paragraph>
          <Paragraph style={styles.opportunityDate}>
            {opportunity.expectedCloseDate 
              ? new Date(opportunity.expectedCloseDate).toLocaleDateString()
              : 'No date set'
            }
          </Paragraph>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Paragraph style={styles.loadingText}>Loading pipeline...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Sales Pipeline</Title>
        <Button
          mode="contained"
          icon="plus"
          onPress={handleAddOpportunity}
          style={styles.addButton}
        >
          Add Opportunity
        </Button>
      </View>

      {pipelines.length > 0 && (
        <ScrollView
          horizontal
          style={styles.pipelineSelector}
          showsHorizontalScrollIndicator={false}
        >
          {pipelines.map((pipeline) => (
            <Button
              key={pipeline._id}
              mode={selectedPipeline?._id === pipeline._id ? 'contained' : 'outlined'}
              onPress={() => handlePipelineSelect(pipeline)}
              style={[
                styles.pipelineButton,
                selectedPipeline?._id === pipeline._id && styles.selectedPipelineButton,
              ]}
            >
              {pipeline.name}
            </Button>
          ))}
        </ScrollView>
      )}

      {selectedPipeline && (
        <View style={styles.stagesContainer}>
          <ScrollView
            horizontal
            style={styles.stagesScrollView}
            showsHorizontalScrollIndicator={false}
          >
            {selectedPipeline.stages.map((stage, index) => (
              <View key={stage.name} style={styles.stageColumn}>
                <View style={[styles.stageHeader, { backgroundColor: stage.color || '#2196F3' }]}>
                  <Title style={styles.stageTitle}>{stage.name}</Title>
                  <Paragraph style={styles.stageProbability}>
                    {stage.probability}%
                  </Paragraph>
                </View>
                
                <ScrollView style={styles.opportunitiesContainer}>
                  {stageData[stage.name]?.opportunities?.map((opportunity) => (
                    <OpportunityCard
                      key={opportunity._id}
                      opportunity={opportunity}
                    />
                  ))}
                </ScrollView>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <Portal>
        <PaperModal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Add New Opportunity</Title>
          
          <TextInput
            label="Opportunity Title"
            value={newOpportunity.title}
            onChangeText={(text) => setNewOpportunity({ ...newOpportunity, title: text })}
            mode="outlined"
            style={styles.modalInput}
          />
          
          <TextInput
            label="Value"
            value={newOpportunity.value}
            onChangeText={(text) => setNewOpportunity({ ...newOpportunity, value: text })}
            mode="outlined"
            keyboardType="numeric"
            style={styles.modalInput}
          />
          
          <TextInput
            label="Expected Close Date"
            value={newOpportunity.expectedCloseDate}
            onChangeText={(text) => setNewOpportunity({ ...newOpportunity, expectedCloseDate: text })}
            mode="outlined"
            style={styles.modalInput}
            placeholder="YYYY-MM-DD"
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
              onPress={handleSaveOpportunity}
              style={styles.modalButton}
            >
              Save
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
  pipelineSelector: {
    maxHeight: 60,
    paddingHorizontal: 16,
  },
  pipelineButton: {
    marginRight: 8,
    borderRadius: 20,
  },
  selectedPipelineButton: {
    backgroundColor: '#2196F3',
  },
  stagesContainer: {
    flex: 1,
    paddingTop: 16,
  },
  stagesScrollView: {
    flex: 1,
  },
  stageColumn: {
    width: 280,
    marginHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  stageHeader: {
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  stageTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stageProbability: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  opportunitiesContainer: {
    flex: 1,
    padding: 8,
  },
  opportunityCard: {
    marginBottom: 8,
    elevation: 1,
  },
  opportunityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  opportunityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  stageChip: {
    height: 24,
  },
  opportunityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  opportunityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  opportunityCustomer: {
    fontSize: 14,
    color: '#666',
  },
  opportunityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  opportunitySalesperson: {
    fontSize: 12,
    color: '#666',
  },
  opportunityDate: {
    fontSize: 12,
    color: '#666',
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

export default PipelineScreen;
