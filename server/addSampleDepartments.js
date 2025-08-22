const mongoose = require('mongoose');
const Department = require('./models/Department');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleDepartments = [
  {
    department: 'Computer Science',
    personInCharge: 'Dr. John Smith'
  },
  {
    department: 'Mathematics',
    personInCharge: 'Prof. Sarah Johnson'
  },
  {
    department: 'Physics',
    personInCharge: 'Dr. Michael Brown'
  },
  {
    department: 'Chemistry',
    personInCharge: 'Prof. Emily Davis'
  },
  {
    department: 'Biology',
    personInCharge: 'Dr. Robert Wilson'
  },
  {
    department: 'English',
    personInCharge: 'Prof. Lisa Anderson'
  },
  {
    department: 'History',
    personInCharge: 'Dr. James Taylor'
  },
  {
    department: 'Economics',
    personInCharge: 'Prof. David Miller'
  }
];

async function addSampleDepartments() {
  try {
    console.log('Adding sample departments...');
    
    for (const deptData of sampleDepartments) {
      // Check if department already exists
      const existingDept = await Department.findOne({ department: deptData.department });
      
      if (existingDept) {
        console.log(`Department ${deptData.department} already exists, skipping...`);
        continue;
      }
      
      // Create new department
      const department = new Department(deptData);
      await department.save();
      console.log(`Department ${deptData.department} created successfully`);
    }
    
    console.log('Sample departments added successfully!');
    
  } catch (error) {
    console.error('Error adding sample departments:', error);
  } finally {
    mongoose.connection.close();
  }
}

addSampleDepartments(); 