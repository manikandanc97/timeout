import { sanitizeAdminSettings } from './backend/src/lib/adminSettings.js';

try {
  console.log('Test 1: null');
  console.log(sanitizeAdminSettings(null));
  
  console.log('Test 2: empty object');
  console.log(sanitizeAdminSettings({}));
  
  console.log('Test 3: partial data');
  console.log(sanitizeAdminSettings({ leavePolicySettings: { casualLeaveCount: 15 } }));

  console.log('Test 4: bad rolePermissions');
  console.log(sanitizeAdminSettings({ rolePermissions: 'not an array' }));

  console.log('Test 5: missing sub-fields');
  console.log(sanitizeAdminSettings({ smtpSettings: { host: 'smtp.example.com' } }));
  
  console.log('All tests passed');
} catch (err) {
  console.error('Failed:', err);
}
