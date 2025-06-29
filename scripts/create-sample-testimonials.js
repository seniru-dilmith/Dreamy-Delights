/**
 * Script to populate the database with sample testimonials
 * Run this after setting up admin authentication
 */

const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'https://api-cvfhs7orea-uc.a.run.app/api';

// Read sample testimonials data
const sampleTestimonials = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../sample-testimonials.json'), 'utf8')
);

async function createSampleTestimonials() {
  try {
    console.log('🏗️  Creating sample testimonials...');
    
    // You'll need to get an admin token first
    console.log('\n⚠️  To run this script:');
    console.log('1. Log into the admin panel at /admin/login');
    console.log('2. Get your admin token from localStorage');
    console.log('3. Set the ADMIN_TOKEN variable below');
    console.log('4. Uncomment the createTestimonials() call at the bottom');
    
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your-admin-token-here';
    
    if (ADMIN_TOKEN === 'your-admin-token-here') {
      console.log('\n❌ Please set your admin token first!');
      return;
    }

    let created = 0;
    let errors = 0;

    for (const testimonial of sampleTestimonials) {
      try {
        console.log(`\nCreating testimonial for ${testimonial.name}...`);
        
        const response = await fetch(`${API_BASE_URL}/testimonials`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
          },
          body: JSON.stringify(testimonial),
        });

        const data = await response.json();
        
        if (data.success) {
          console.log(`✅ Created testimonial: ${testimonial.name}`);
          created++;
        } else {
          console.log(`❌ Failed to create testimonial for ${testimonial.name}:`, data.message);
          errors++;
        }
      } catch (error) {
        console.error(`❌ Error creating testimonial for ${testimonial.name}:`, error.message);
        errors++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Created: ${created} testimonials`);
    console.log(`❌ Errors: ${errors} testimonials`);
    console.log(`📝 Total: ${sampleTestimonials.length} testimonials`);

  } catch (error) {
    console.error('❌ Error in createSampleTestimonials:', error);
  }
}

// Instructions
console.log(`
🧪 Sample Testimonials Creator

This script will create sample testimonials in your database.

Steps:
1. Make sure your Firebase functions are deployed
2. Get an admin token by logging into /admin/login
3. Set the ADMIN_TOKEN environment variable or edit this script
4. Run: node scripts/create-sample-testimonials.js

Sample testimonials: ${sampleTestimonials.length}
API Base URL: ${API_BASE_URL}
`);

// Uncomment the line below after setting your admin token
// createSampleTestimonials();

module.exports = { createSampleTestimonials };
