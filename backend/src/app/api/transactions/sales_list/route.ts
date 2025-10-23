import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db/db";
import { transactions, customers } from "../../../../../lib/db/schema";
import { verifyAuth } from "@/user-auth-helper-function/verifyAuth";
import { eq, and, desc, like, sql, or, gte, lte } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const userId = verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const commodityFilter = searchParams.get("commodityId");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    const offset = (page - 1) * limit;

    // Base conditions
    const conditions: any[] = [
      eq(transactions.userId, userId),
      eq(transactions.type, "sale"),
    ];

    if (commodityFilter) {
      conditions.push(eq(transactions.commodityId, commodityFilter));
    }

    // Date range filter
    if (fromDate && toDate) {
      conditions.push(
        and(
          gte(transactions.dateTime, new Date(fromDate)),
          lte(transactions.dateTime, new Date(toDate))
        )
      );
    }

    // Search by commodity name, customer name, or date
    if (search) {
      conditions.push(
        or(
          like(transactions.commodityName, `%${search}%`),
          like(customers.name, `%${search}%`),
          like(sql`DATE(${transactions.dateTime})`, `%${search}%`)
        )
      );
    }

    // Fetch paginated sales transactions with customer info
    const data = await db
      .select({
        id: transactions.id,
        commodityName: transactions.commodityName,
        commodityUnit: transactions.commodityUnit,
        quantity: transactions.quantity,
        ratePerUnit: transactions.ratePerUnit,
        totalAmount: transactions.totalAmount,
        mannEquivalent: transactions.mannEquivalent,
        dateTime: transactions.dateTime,
        notes: transactions.notes,
        customerName: transactions.customerName,
        customerPhone: transactions.customerPhone,
        customerCompany: transactions.customerCompany,
      })
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);

    // Count total records
    const total = await db
      .select({ count: sql<number>`count(${transactions.id})` })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.type, "sale")));

    const totalCount = total[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        totalRecords: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / limit),
      },
    });

  } catch (e: any) {
    console.error("❌ Error in fetching sales transactions:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
