const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Pipeline = require('./models/Pipeline');
const Opportunity = require('./models/Opportunity');

// Sample data for seeding
const sampleCustomers = [
  {
    name: 'Acme Corp',
    email: 'contact@acmecorp.com',
    phone: '+1-555-0123',
    company: 'Acme Corporation',
    industry: 'Technology',
    address: {
      street: '123 Business Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    }
  },
  {
    name: 'TechStart Inc',
    email: 'info@techstart.com',
    phone: '+1-555-0456',
    company: 'TechStart Inc',
    industry: 'Software',
    address: {
      street: '456 Innovation St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    }
  },
  {
    name: 'Global Systems',
    email: 'sales@globalsystems.com',
    phone: '+1-555-0789',
    company: 'Global Systems Ltd',
    industry: 'Enterprise Software',
    address: {
      street: '789 Enterprise Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    }
  },
  {
    name: 'Digital Solutions',
    email: 'hello@digitalsolutions.com',
    phone: '+1-555-0321',
    company: 'Digital Solutions Co',
    industry: 'Digital Marketing',
    address: {
      street: '321 Digital Way',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      country: 'USA'
    }
  }
];

const sampleOpportunities = [
  {
    title: 'Enterprise Software Deal',
    value: 50000,
    stage: 'Lead',
    expectedCloseDate: new Date('2024-03-15'),
    description: 'Large enterprise software implementation project'
  },
  {
    title: 'Marketing Automation Platform',
    value: 25000,
    stage: 'Qualified',
    expectedCloseDate: new Date('2024-02-28'),
    description: 'Marketing automation and CRM integration'
  },
  {
    title: 'Cloud Migration Project',
    value: 75000,
    stage: 'Proposal',
    expectedCloseDate: new Date('2024-04-30'),
    description: 'Complete cloud infrastructure migration'
  },
  {
    title: 'Digital Transformation Initiative',
    value: 100000,
    stage: 'Negotiation',
    expectedCloseDate: new Date('2024-05-15'),
    description: 'Full digital transformation consulting engagement'
  },
  {
    title: 'Mobile App Development',
    value: 35000,
    stage: 'Qualified',
    expectedCloseDate: new Date('2024-03-30'),
    description: 'Custom mobile application development'
  }
];

const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');

    // Get the first user (assuming there's at least one user)
    const user = await User.findOne().select('+password');
    if (!user) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }
    console.log(`✅ Found user: ${user.name} (${user.email})`);

    // Create customers
    console.log('👥 Creating customers...');
    const customers = [];
    for (const customerData of sampleCustomers) {
      const existingCustomer = await Customer.findOne({ email: customerData.email });
      if (!existingCustomer) {
        const customer = new Customer({
          ...customerData,
          createdBy: user._id
        });
        await customer.save();
        customers.push(customer);
        console.log(`✅ Created customer: ${customer.name}`);
      } else {
        customers.push(existingCustomer);
        console.log(`ℹ️  Customer already exists: ${existingCustomer.name}`);
      }
    }

    // Create default pipeline if it doesn't exist
    console.log('🔄 Creating default pipeline...');
    let pipeline = await Pipeline.findOne({ isDefault: true });
    if (!pipeline) {
      pipeline = new Pipeline({
        name: 'Sales Pipeline',
        description: 'Default sales pipeline for tracking opportunities',
        isDefault: true,
        createdBy: user._id,
        stages: [
          { name: 'Lead', probability: 10, color: '#FF9800', order: 1 },
          { name: 'Qualified', probability: 25, color: '#2196F3', order: 2 },
          { name: 'Proposal', probability: 50, color: '#9C27B0', order: 3 },
          { name: 'Negotiation', probability: 75, color: '#FF5722', order: 4 },
          { name: 'Closed Won', probability: 100, color: '#4CAF50', order: 5 },
        ]
      });
      await pipeline.save();
      console.log('✅ Created default pipeline');
    } else {
      console.log('ℹ️  Default pipeline already exists');
    }

    // Create opportunities
    console.log('💰 Creating opportunities...');
    for (let i = 0; i < sampleOpportunities.length; i++) {
      const oppData = sampleOpportunities[i];
      const customer = customers[i % customers.length];
      
      // Check if opportunity already exists
      const existingOpp = await Opportunity.findOne({ 
        title: oppData.title,
        customer: customer._id
      });
      
      if (!existingOpp) {
        // Get stage probability from pipeline
        const stage = pipeline.stages.find(s => s.name === oppData.stage);
        const probability = stage ? stage.probability : 0;

        const opportunity = new Opportunity({
          title: oppData.title,
          value: oppData.value,
          stage: oppData.stage,
          probability,
          pipeline: pipeline._id,
          customer: customer._id,
          salesperson: user._id,
          expectedCloseDate: oppData.expectedCloseDate,
          description: oppData.description,
          source: 'website',
          createdBy: user._id
        });
        
        await opportunity.save();
        console.log(`✅ Created opportunity: ${opportunity.title}`);
      } else {
        console.log(`ℹ️  Opportunity already exists: ${existingOpp.title}`);
      }
    }

    console.log('🎉 Data seeding completed successfully!');
    console.log(`📊 Created/Found:`);
    console.log(`   - ${customers.length} customers`);
    console.log(`   - 1 pipeline`);
    console.log(`   - ${sampleOpportunities.length} opportunities`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  // Connect to MongoDB using the same config as server
  const dotenv = require('dotenv');
  dotenv.config({ path: './config.env' });
  
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/calyx-crm';
  console.log('Connecting to:', mongoUri);
  
  mongoose.connect(mongoUri)
    .then(() => {
      console.log('🔗 Connected to MongoDB');
      return seedData();
    })
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedData };
