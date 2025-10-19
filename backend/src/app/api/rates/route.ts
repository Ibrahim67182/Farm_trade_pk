import {NextResponse } from "next/server";
import {db} from "../../../../lib/db/db";
import {commodityRates} from "../../../../lib/db/schema";
import {eq , and} from "drizzle-orm";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";


import { verifyAuth } from "@/user-auth-helper-function/verifyAuth";          // helper function for user id verification 

// main api call function post with user verification 

export async function POST(req: Request) {

  try{

    const userId = verifyAuth(req);

    const {commodityId , pricePerUnit} = await req.json();  //get user id and also corresponding price per unit with commodity id

    if(!userId || !commodityId || !pricePerUnit){

      console.log("Data fields is/are  missing to insert or update commodity rates entry")
      return NextResponse.json({ success: false ,
         error: "Data fields is/are  missing to insert or update commodity rates entry"  }, { status: 400 });


    }

    const [existing] = await db                       
    .select()
    .from(commodityRates)
    .where(and(eq(commodityRates.userId, userId), 
    eq(commodityRates.commodityId, commodityId)));

     if(existing) {                                         // check if entry already exist with same user and commodity 
 
      await db.update(commodityRates)                      // if exist then update existing record price with updated price
      .set({pricePerUnit})
      .where(and(eq(commodityRates.userId, userId),
       eq(commodityRates.commodityId, commodityId)));

    }
    else{
          
       const id = randomUUID();                                      // if not exist in db then just insert a new entry 
      await db.insert(commodityRates).values(
        {
        id,
        userId,
        commodityId,
        pricePerUnit
        }
      );

    }

     return NextResponse.json({success: true});


  }
  catch (e: any) {
    console.error(e);
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}





