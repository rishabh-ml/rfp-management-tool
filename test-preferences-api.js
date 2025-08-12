// Test script for preferences API
const testData = {
  email_notifications: true,
  project_assignments: true,
  due_date_reminders: true,
  comment_mentions: true,
  weekly_summary: false,
  notification_frequency: 'immediate',
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00'
}

fetch('http://localhost:3001/api/profile/preferences', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('Status:', response.status, response.statusText)
  return response.json()
})
.then(data => {
  console.log('Response:', data)
})
.catch(error => {
  console.error('Error:', error)
})
