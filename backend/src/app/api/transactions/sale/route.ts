import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db/db";
import { eq, and } from "drizzle-orm";
import { transactions, inventory, commodities , customers , commodityRates} from "../../../../../lib/db/schema";
import { verifyAuth } from "../../../../../src/user-auth-helper-function/verifyAuth";
import { randomUUID } from "crypto";


export async function POST(req: Request) {
  try {


    // ✅ Step 1: Verify Authentication
    const userId = verifyAuth(req);

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // ✅ Step 2: Parse and validate body
    const body = await req.json();
    const {
      commodityId,
      quantity,
      ratePerUnit,
      totalAmount,
      customerId, // sale = customer must be provided
      notes,
      dateTime,
    } = body;

    if (!commodityId || !customerId) {
      return NextResponse.json(
        { success: false, message: "Commodity ID and Customer ID are required" },
        { status: 400 }
      );
    }

       // ✅ Step : Validate customer
          const [customer] = await db
            .select()
            .from(customers)
            .where(eq(customers.id, customerId))
            .limit(1);
    
          if (!customer) {
            return NextResponse.json(
              { success: false, message: "Customer not found. Please select a valid customer." },
              { status: 404 }
            );
          }



    // ✅ Step 3: Validate numeric input (must have at least 2 fields)
    const provided = [quantity, ratePerUnit, totalAmount].filter(
      (v) => v !== undefined && v !== null
    );
    if (provided.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "At least two of quantity, ratePerUnit, or totalAmount are required",
        },
        { status: 400 }
      );
    }

    // ✅ Step 4: Auto-calculate missing field
    let qty = parseFloat(quantity ?? 0);
    let rate = parseFloat(ratePerUnit ?? 0);
    let total = parseFloat(totalAmount ?? 0);

    if (!qty && rate && total) qty = total / rate;
    else if (!rate && qty && total) rate = total / qty;
    else if (!total && qty && rate) total = qty * rate;

    // ✅ Step 5: Get commodity details
    const [commodity] = await db
      .select()
      .from(commodities)
      .where(eq(commodities.id, commodityId))
      .limit(1);

    if (!commodity) {
      return NextResponse.json(
        { success: false, message: "Commodity not found" },
        { status: 404 }
      );
    }

    // ✅ Step 6: Fetch existing inventory for this commodity & user
    const [existingInventory] = await db
      .select()
      .from(inventory)
      .where(and(eq(inventory.commodityId, commodity.id), eq(inventory.userId, userId)))
      .limit(1);

    if (!existingInventory) {
      return NextResponse.json(
        {
          success: false,
          message: "No inventory record found for this commodity. Please purchase first.",
        },
        { status: 400 }
      );
    }

    const availableQty = parseFloat(existingInventory.totalCurrentQty ?? "0");
    


    // ✅ Step 7: Check if user has enough quantity to sell

    // ⚠️ Check for insufficient quantity

    if (qty > availableQty) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient stock. Available: ${availableQty.toFixed(
            2
          )}, Requested: ${qty.toFixed(2)}. Please purchase more before selling.`,
        },
        { status: 400 }
      );
    }




    // ✅ Step 8: Calculate mann equivalent (for kg only)
    let mannEquivalent: number | null = null;
    if (commodity.unitType.toLowerCase() === "kg") {
      mannEquivalent = qty / 40; // 1 mann = 40 kg
    }

    // ✅ Step 9: Insert sale transaction
    const transactionId = randomUUID();

    await db.insert(transactions).values({
      id: transactionId,
      userId: userId,
      type: "sale",
      commodityId: commodity.id,
      commodityName: commodity.name,
      commodityUnit: commodity.unitType,
      quantity: qty.toFixed(2),
      ratePerUnit: rate.toFixed(2),
      totalAmount: total.toFixed(2),
      mannEquivalent: mannEquivalent ? mannEquivalent.toFixed(2) : null,
      customerId: customerId,

      customerName:customer.name ?? null,
      customerCompany:customer.company ?? null,
      customerPhone:customer.phone ?? null,
         
      notes: notes ?? null,
      createdBy: userId,
      dateTime: dateTime ? new Date(dateTime) : new Date(),
    });

    // ✅ Step 10: Update inventory (reduce sold quantity)
    const newTotalQtySold = parseFloat(existingInventory.totalQtySold ?? "0") + qty;
    const newTotalCurrQty = availableQty - qty;

    await db
      .update(inventory)
      .set({
        totalQtySold: newTotalQtySold.toFixed(2),
        totalCurrentQty: newTotalCurrQty.toFixed(2),
        lastUpdated: new Date(),
      })
      .where(eq(inventory.id, existingInventory.id));

     
// ✅ Step 9: Update commodity sale rate internally (no API call)

    const [existingRate] = await db
      .select()
      .from(commodityRates)
      .where(and(eq(commodityRates.commodityId, commodity.id), eq(commodityRates.userId, userId)))
      .limit(1);

    if (existingRate) {
      await db
        .update(commodityRates)
        .set({
          salePricePerUnit: rate.toFixed(2),
          fetchedAt: new Date(),
        })
        .where(eq(commodityRates.id, existingRate.id));
    } else {
      await db.insert(commodityRates).values({
        id: randomUUID(),
        userId,
        commodityId: commodity.id,
        commodityName: commodity.name,
        purchasePricePerUnit: null,
        salePricePerUnit: rate.toFixed(2),
        fetchedAt: new Date(),
      });
    }




    return NextResponse.json({
      success: true,
      message: "Sale recorded successfully and inventory updated and latest sale rate saved.",
    });
  } 
  
  catch (err: any) {
    console.error("❌ Error in sale transaction:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
