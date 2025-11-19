// Test script to check profile validation logic
console.log('Testing profile validation logic...');

// Simulate a complete profile
const completeProfile = {
  first_name: 'John',
  last_name: 'Doe',
  birthdate: '1990-01-01',
  gender: 'male',
  height: '175.5',
  weight: '70.0',
  blood_group: 'A+'
};

// Test the validation logic
const requiredFields = ['first_name', 'last_name', 'birthdate', 'gender', 'height', 'weight', 'blood_group'];

const missingFields = requiredFields.filter(field => {
  const value = completeProfile[field];
  const isMissing = !value || value === '' || value === '0.00' || value === null || value === undefined;
  console.log(`${field}: "${value}" (type: ${typeof value}) - missing: ${isMissing}`);
  return isMissing;
});

console.log(`Missing fields count: ${missingFields.length}/7`);
console.log('Should show form:', missingFields.length > 0 ? 'YES' : 'NO');
