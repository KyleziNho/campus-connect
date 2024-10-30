// Import dependencies
const { onCall, region } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const sgMail = require('@sendgrid/mail');

// Initialize Firebase Admin and Firestore
initializeApp();
const db = getFirestore();

// Initialize SendGrid
const sendgridKey = process.env.SENDGRID_API_KEY;
if (sendgridKey) {
  sgMail.setApiKey(sendgridKey);
} else {
  console.error("SendGrid API key not configured");
}

// University domains map
const UNIVERSITY_DOMAINS = {
  'bath.ac.uk': 'University of Bath',
  'bristol.ac.uk': 'University of Bristol',
  'ox.ac.uk': 'University of Oxford',
  'cam.ac.uk': 'University of Cambridge',
};

// Send verification code via email with sandbox mode enabled
exports.sendVerificationCode = onCall(
  { region: 'us-central1', memory: '256MiB', minInstances: 1 },
  async (data, context) => {
    try {
      const { email } = data;

      // Validate email
      if (!email || !email.includes('@')) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid email format');
      }

      // Generate a 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Store verification code in Firestore with a 1-minute expiry
      await db.collection('verificationCodes').doc(email).set({
        code: verificationCode,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 60 * 1000)), // 1-minute expiry
        attempts: 0
      });

      // Send email with SendGrid in sandbox mode
      const msg = {
        to: email,
        from: 'verification@campus-connect.com',
        templateId: 'd-303f10c183d548e7ace8e9eec1410c75', // Replace with your SendGrid template ID
        dynamicTemplateData: {
          verification_code: verificationCode
        },
        mail_settings: {
          sandbox_mode: {
            enable: true // Enable sandbox mode
          }
        }
      };

      await sgMail.send(msg);
      console.log(`Sandbox mode enabled. Verification code simulated for ${email}`);
      return { success: true };

    } catch (error) {
      console.error('Error in sendVerificationCode:', error);
      throw new functions.https.HttpsError('internal', 'Error sending verification code');
    }
  }
);

// Verify the code entered by the user
exports.verifyCode = onCall(
  { region: 'us-central1', memory: '256MiB', minInstances: 1 },
  async (data, context) => {
    try {
      const { email, code } = data;

      // Validate input
      if (!email || !code) {
        throw new functions.https.HttpsError('invalid-argument', 'Email and code are required');
      }

      // Retrieve verification data from Firestore
      const docRef = await db.collection('verificationCodes').doc(email).get();

      // Check if verification data exists
      if (!docRef.exists) {
        throw new functions.https.HttpsError('not-found', 'Code not found or expired');
      }

      const verificationData = docRef.data();

      // Check if the code matches
      if (verificationData.code !== code) {
        // Increment attempts if the code is incorrect
        await db.collection('verificationCodes').doc(email).update({
          attempts: FieldValue.increment(1)
        });
        throw new functions.https.HttpsError('invalid-argument', 'Invalid code');
      }

      // Delete the verification code once it’s successfully used
      await db.collection('verificationCodes').doc(email).delete();
      console.log(`Code verified successfully for ${email}`);
      return { success: true };

    } catch (error) {
      console.error('Error in verifyCode:', error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError('internal', 'Error verifying code');
    }
  }
);

// Get information about supported universities based on email domain
exports.getUniversityInfo = onCall(
  { region: 'us-central1', memory: '128MiB' },
  (data, context) => {
    try {
      const universities = Object.entries(UNIVERSITY_DOMAINS).map(([domain, name]) => ({
        domain,
        name
      }));
      console.log('University info retrieved successfully');
      return { universities };

    } catch (error) {
      console.error('Error in getUniversityInfo:', error);
      throw new functions.https.HttpsError('internal', 'Error getting university information');
    }
  }
);
