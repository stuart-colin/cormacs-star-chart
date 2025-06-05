import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Define the structure of your schedule data for Firestore
interface Task {
  id: string;
  name: string;
  completed: boolean;
  starColorClass?: string;
  starBounceSpeedClass?: string;
}

interface DaySchedule {
  id: string;
  dayName: string;
  tasks: Task[];
}

const FIRESTORE_COLLECTION = 'starCharts';
const FIRESTORE_DOCUMENT_ID = 'cormacWeeklySchedule'; // Or make this dynamic if you plan for multiple users/charts

// Initialize Firebase Admin SDK
// Ensure this initialization happens only once
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace newlines characters in the private key from the environment variable
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const db = admin.firestore();

export async function GET() {
  try {
    const docRef = db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOCUMENT_ID);
    const doc = await docRef.get();

    if (!doc.exists) {
      // If no schedule exists, you might want to return an empty/initial schedule
      // or a specific status code. For now, let's return 404 or an empty array.
      console.log('No schedule document found in Firestore.');
      return NextResponse.json({ schedule: [] }, { status: 200 }); // Or return initial schedule
    }

    return NextResponse.json({ schedule: doc.data()?.scheduleData || [] });
  } catch (error) {
    console.error('Error fetching schedule from Firestore:', error);
    return NextResponse.json({ message: 'Error fetching schedule', error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const scheduleToSave: DaySchedule[] = body.schedule;

    if (!scheduleToSave) {
      return NextResponse.json({ message: 'Schedule data is required' }, { status: 400 });
    }

    const docRef = db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOCUMENT_ID);
    // We store the schedule array under a field, e.g., 'scheduleData'
    await docRef.set({ scheduleData: scheduleToSave }, { merge: true }); // merge: true can be useful

    return NextResponse.json({ message: 'Schedule saved successfully' });
  } catch (error) {
    console.error('Error saving schedule to Firestore:', error);
    return NextResponse.json({ message: 'Error saving schedule', error: (error as Error).message }, { status: 500 });
  }
}