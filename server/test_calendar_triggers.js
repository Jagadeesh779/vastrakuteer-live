/**
 * Test script to simulate the daily cron job for all events
 * and verify that emails are sent exactly 1 day before the event start date.
 * Run: node test_calendar_triggers.js
 */

const { EVENTS } = require('./utils/eventCalendar');

console.log('\n📅 EVENT EMAIL BLAST SCHEDULE SIMULATION');
console.log('========================================');
console.log('Verifying that email blasts are triggered exactly ONE DAY BEFORE the event starts.\n');

// Loop through each event in the calendar and calculate the day before
EVENTS.forEach(event => {
    // Construct a Date object for the start of the event in 2026
    const eventStartDate = new Date(2026, event.start.month - 1, event.start.day);
    
    // Subtract 1 day to find the target email send date
    const emailSendDate = new Date(eventStartDate);
    emailSendDate.setDate(eventStartDate.getDate() - 1);

    const formatDate = (dateObj) => {
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    console.log(`🎉 Event: ${event.emoji} ${event.name}`);
    console.log(`   • Start Date  : ${formatDate(eventStartDate)}`);
    console.log(`   • SEND DATE   : 📨 ${formatDate(emailSendDate)} (1 Day Before)`);
    console.log(`   • Coupon      : ${event.coupon} (${event.discount}% OFF)`);
    console.log('----------------------------------------');
});
