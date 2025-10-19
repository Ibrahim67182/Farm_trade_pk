import { NextResponse } from "next/server";
import { db } from "../../../../lib/db/db";
import { eq, or } from "drizzle-orm";
import { customers } from "../../../../lib/db/schema";
import { verifyAuth } from "../../../../src/user-auth-helper-function/verifyAuth";
import { randomUUID } from "crypto";

// ✅ Only allow format like 03xx-xxxxxxx (dash is mandatory)
const phoneRegex = /^03\d{2}-\d{7}$/;


// ✅ Basic email regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;





// for getting all customers data of a particular user
export async function GET(req: Request) {
  try {
    const userId = verifyAuth(req);

    if (!userId) {
      console.log("no user logged in to get customers data!");
      return NextResponse.json(
        { success: false, error: "user not found to get customers data!" },
        { status: 400 }
      );
    }

    const all_customers_data = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, userId));

    return NextResponse.json(all_customers_data);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}




// creation of new customer for a particular user
export async function POST(req: Request) {
  try {
    const userId = verifyAuth(req);
    const { name, company, email, phone, address } = await req.json();

    // ✅ Basic missing fields check
    if (!userId || !name || !company || !email || !phone || !address) {
      console.log("Data fields are missing to create customer record entry");
      return NextResponse.json(
        {
          success: false,
          error: "Data fields are missing to create customer record entry",
        },
        { status: 400 }
      );
    }

    // ✅ Validate email format
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format." },
        { status: 400 }
      );
    }

    // ✅ Validate Pakistani phone format
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid phone format. Use 03xx-xxxxxxx",
        },
        { status: 400 }
      );
    }

    // ✅ Check for existing email or phone in DB
    const existing = await db
      .select()
      .from(customers)
      .where(or(eq(customers.email, email), eq(customers.phone, phone)));

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Email or phone already exists in record for another customer!",
        },
        { status: 400 }
      );
    }

    const id = randomUUID(); // generating random id for customer

    await db.insert(customers).values({
      id,
      name,
      company,
      email,
      phone,
      address,
      userId,
    });

    return NextResponse.json({
      success: true,
      message: "Successfully created a new customer!",
      data: { id, name, company, email, phone, address },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}
