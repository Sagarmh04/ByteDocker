import { NextResponse } from "next/server";
import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
    }),
  });
}

export async function POST() {
  try {
    const user = await admin.auth().createUser({
      email: "admin@admin.in",
      password: "helloo",
    });

    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    return NextResponse.json({ success: true, uid: user.uid });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: (err as Error).message || "Unknown error" },
      { status: 500 }
    );
  }
}
