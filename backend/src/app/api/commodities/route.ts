// api to get all commodities present in db if empty seed the commodities once in DB

import { NextResponse } from "next/server";
import {db} from "../../../../lib/db/db";
import { commodities } from "../../../../lib/db/schema";
import {initApp} from "../../../init";


export async function GET() {


  // Ensures seeding is done ONCE automatically
 await initApp();


 // selecting all commodities to return to user
 const all_commodities = await db.select().from(commodities);

 return NextResponse.json(all_commodities);

}





