import { NextResponse } from "next/server";
import { clientPromise } from "@/app/lib/mongodb";  // Correct named import

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("my_db");
        const users = await db.collection("user").find({}).toArray();

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error("MongoDB error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
