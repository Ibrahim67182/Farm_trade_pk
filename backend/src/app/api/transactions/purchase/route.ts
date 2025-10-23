import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db/db";
import { eq, and } from "drizzle-orm";
import { transactions, inventory, commodities , suppliers , commodityRates} from "../../../../../lib/db/schema";
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
      supplierId, // purchase = supplier must be provided
      notes,
      dateTime,
    } = body;

    if (!commodityId || !supplierId) {
      return NextResponse.json({ success: false, message: "Commodity ID and Supplier ID are required" }, { status: 400 });
    }


          // ✅ Step : Validate Supplier
      const [supplier] = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, supplierId))
        .limit(1);

      if (!supplier) {
        return NextResponse.json(
          { success: false, message: "Supplier not found. Please select a valid supplier." },
          { status: 404 }
        );
      }


    // At least 2 of 3 numeric fields must be provided
    const provided = [quantity, ratePerUnit, totalAmount].filter(v => v !== undefined && v !== null);
    if (provided.length < 2) {
      return NextResponse.json({
        success: false,
        message: "At least two of quantity, ratePerUnit, or totalAmount are required",
      }, { status: 400 });
    }

    // ✅ Step 3: Auto-calculate missing field
    let qty = parseFloat(quantity ?? 0);
    let rate = parseFloat(ratePerUnit ?? 0);
    let total = parseFloat(totalAmount ?? 0);

    if (!qty && rate && total) qty = total / rate;
    else if (!rate && qty && total) rate = total / qty;
    else if (!total && qty && rate) total = qty * rate;

    // ✅ Step 4: Get commodity details
    const [commodity] = await db
      .select()
      .from(commodities)
      .where(eq(commodities.id, commodityId))
      .limit(1);

    if (!commodity) {
      return NextResponse.json({ success: false, message: "Commodity not found" }, { status: 404 });
    }

    // ✅ Step 5: Calculate mann equivalent (for kg only)
    let mannEquivalent: number | null = null;
    if (commodity.unitType.toLowerCase() === "kg") {
      mannEquivalent = qty / 40; // 1 mann = 40 kg
    }

    // ✅ Step 6: Insert purchase transaction
    const transactionId = randomUUID();

    await db.insert(transactions).values({
      id: transactionId,
      userId: userId,
      type: "purchase",
      commodityId: commodity.id,
      commodityName: commodity.name,
      commodityUnit: commodity.unitType,
      quantity: qty.toFixed(2),
      ratePerUnit: rate.toFixed(2),
      totalAmount: total.toFixed(2),
      mannEquivalent: mannEquivalent ? mannEquivalent.toFixed(2) : null,
      supplierId: supplierId,


       // 🧾 Added supplier snapshot fields
      supplierName: supplier.name ?? null,
      supplierCompany: supplier.company ?? null,
      supplierPhone: supplier.phone ?? null,

      notes: notes ?? null,
      createdBy: userId,
      // ✅ Handle user-provided or default timestamp
      dateTime: dateTime ? new Date(dateTime) : new Date(),
    });

    // ✅ Step 7: Update inventory totals
    const [existingInventory] = await db
      .select()
      .from(inventory)
      .where(and(eq(inventory.commodityId, commodity.id), eq(inventory.userId, userId)))
      .limit(1);

    if (existingInventory) {
      // Update existing inventory (add purchased qty and amount)
      const newTotalQtyPurchased = parseFloat(existingInventory.totalQtyPurchased ?? "0") + qty;
      const newTotalCurrQty =     parseFloat(existingInventory.totalCurrentQty ?? "0") + qty;
      

      await db
        .update(inventory)
        .set({
          totalQtyPurchased: newTotalQtyPurchased.toFixed(2),
          totalCurrentQty: newTotalCurrQty.toFixed(2),
          lastUpdated: new Date(),
        })
        .where(eq(inventory.id, existingInventory.id));
   
      } 
    
    else {
      // Create new inventory record
      await db.insert(inventory).values({
        id: randomUUID(),
        userId: userId,
        commodityId: commodity.id,
        commodityName: commodity.name,
        commodityUnit: commodity.unitType,
        totalQtyPurchased: qty.toFixed(2),
        totalCurrentQty: qty.toFixed(2),
        lastUpdated: new Date(),
      });
    }

 
// ✅ Step 9: Update commodity purchase rate internally (no API call)
    const [existingRate] = await db
      .select()
      .from(commodityRates)
      .where(and(eq(commodityRates.commodityId, commodity.id), eq(commodityRates.userId, userId)))
      .limit(1);

    if (existingRate) {
      await db
        .update(commodityRates)
        .set({
          purchasePricePerUnit: rate.toFixed(2),
          fetchedAt: new Date(),
        })
        .where(eq(commodityRates.id, existingRate.id));
    } else {
      await db.insert(commodityRates).values({
        id: randomUUID(),
        userId,
        commodityId: commodity.id,
        commodityName: commodity.name,
        purchasePricePerUnit: rate.toFixed(2),
        salePricePerUnit: null,
        fetchedAt: new Date(),
      });
    }


    return NextResponse.json({
      success: true,
      message: "Purchase recorded, inventory updated, and latest purchase rate saved."
     
    });


  } 
  
  catch (err: any) {
    console.error("❌ Error in purchase transaction:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }

}
