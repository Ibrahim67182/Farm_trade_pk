import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db/db";
import { commodityRates, commodities } from "../../../../../lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyAuth } from "@/user-auth-helper-function/verifyAuth";


// get all the latest commidites rates used in last purchase transaction by particular user

export async function GET(req: Request) {
  try {
    const userId = verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Fetch all commodities + their latest purchase rate
    const data = await db
      .select({
        commodityId: commodityRates.commodityId,
        commodityName: commodities.name,
        unitType: commodities.unitType,
        purchasePricePerUnit: commodityRates.purchasePricePerUnit,
        lastUpdated: commodityRates.fetchedAt,
      })
      .from(commodityRates)
      .innerJoin(commodities, eq(commodityRates.commodityId, commodities.id))
      .where(eq(commodityRates.userId, userId));

    return NextResponse.json({
      success: true,
      message: "Fetched latest purchase rates successfully",
      data,
    });

  } catch (err: any) {
    console.error("❌ Error fetching purchase rates:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
