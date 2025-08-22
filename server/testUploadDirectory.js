const fs = require('fs');
const path = require('path');

function testUploadDirectories() {
  console.log('Testing upload directories...\n');

  const directories = [
    '../uploads/teacher-materials',
    '../uploads/teacher-assignments',
    '../uploads/shared-files'
  ];

  directories.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    console.log(`Checking directory: ${fullPath}`);
    
    try {
      // Check if directory exists
      if (fs.existsSync(fullPath)) {
        console.log('✅ Directory exists');
        
        // Check if writable
        try {
          fs.accessSync(fullPath, fs.constants.W_OK);
          console.log('✅ Directory is writable');
        } catch (err) {
          console.log('❌ Directory is not writable');
        }
      } else {
        console.log('❌ Directory does not exist, creating...');
        try {
          fs.mkdirSync(fullPath, { recursive: true });
          console.log('✅ Directory created successfully');
        } catch (err) {
          console.log('❌ Failed to create directory:', err.message);
        }
      }
    } catch (err) {
      console.log('❌ Error checking directory:', err.message);
    }
    
    console.log('');
  });
}

testUploadDirectories(); 