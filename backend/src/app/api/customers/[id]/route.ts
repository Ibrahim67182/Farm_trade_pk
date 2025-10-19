import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db/db";
import {or,and,eq , not} from "drizzle-orm";
import { customers } from "../../../../../lib/db/schema";
import { verifyAuth } from "@/user-auth-helper-function/verifyAuth";



const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^03\d{2}-\d{7}$/; // only allow like 0333-1234567        // for update duplicate check




// getting particular customer by id  for particular user to view or display

export async function GET(req:Request , context: { params: Promise<{ id: string }> }) {

  try{

  const userId = verifyAuth(req);

  if(!userId){
     console.log("no user logged in to get customer record!");
      return NextResponse.json(
        { success: false, error: "user not found to get customer record!" },
        { status: 400 }
      );
  }

  const {id} = await context.params;        // get customers id from params of api call 

  const customerId = id;

  if(!customerId){
    console.log("customer's id not provided ");
      return NextResponse.json(
        { success: false, error: "customer's id not provided" },
        { status: 400 }
      );

  }

  const [customer] = await db.select().from(customers).where(eq(customers.id, customerId));

   if (!customer || customer.userId !== userId)
    return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });

  return NextResponse.json(customer);



}

catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }


}





// update customers data by using customer id 

export async function PUT(req:Request , context: { params: Promise<{ id: string }> } ) {


  try{

   const userId = verifyAuth(req);

  if(!userId){
     console.log("no user logged in to update customer record!");
      return NextResponse.json(
        { success: false, error: "user not found to update customer record!" },
        { status: 400 }
      );
  }

   const {id} = await context.params;        // get customers id from params of api call 

  const customerId = id;


  if(!customerId){
    console.log("customer's id not provided ");
      return NextResponse.json(
        { success: false, error: "customer's id not provided" },
        { status: 400 }
      );

  }

       const { name, company, email, phone, address } = await req.json();

        // checking correct email and phone format 
       if (email && !emailRegex.test(email)) {
        return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
}


if (phone && !phoneRegex.test(phone)) {
  return NextResponse.json({ success: false, error: "Invalid phone format. Must be 03xx-xxxxxxx" }, { status: 400 });
}


const existing = await db
  .select()
  .from(customers)
  .where(
    and(
      or(eq(customers.email, email), eq(customers.phone, phone)),
      not(eq(customers.id , customerId))
    )
  );

if (existing.length > 0) {
  return NextResponse.json(
    { success: false, error: "Email or phone already exists for another customer" },
    { status: 400 }
  );
}

           // ✅ Check if customer exists and belongs to user
              const customerExists = await db
                .select()
                .from(customers)
                .where(and(eq(customers.id, customerId), eq(customers.userId, userId)))
                .limit(1);

              if (customerExists.length === 0) {
                return NextResponse.json(
                  { success: false, error: "Customer not found or already deleted" },
                  { status: 404 }
                );
              }

        

            // finally update data if no record email or phone matched 

              const updateData: any = {};                 // support to update only provided fields and rest remian unchanged 
              if (name) updateData.name = name;
              if (company) updateData.company = company;
              if (email) updateData.email = email;
              if (phone) updateData.phone = phone;
              if (address) updateData.address = address;

        await db.update(customers).set(updateData).where(eq(customers.id, customerId));


       return NextResponse.json({ success: true, message: `Customer updated with ${customerId}` });

  
      }
       catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }

  
}






// delete customers data by using customers id

export async function DELETE(req:Request , context: { params: Promise<{ id: string }> }) {

  try{


 const userId = verifyAuth(req);

  if(!userId){
     console.log("no user logged in to delete customer record!");
      return NextResponse.json(
        { success: false, error: "user not found to delete customer record!" },
        { status: 400 }
      );
  }

     const {id} = await context.params;        // get customers id from params of api call 

      const customerId = id;


      
  if(!customerId){
    console.log("customer's id not provided ");
      return NextResponse.json(
        { success: false, error: "customer's id not provided" },
        { status: 400 }
      );

  }

  
      const exists = await db.select().from(customers).where(eq(customers.id,customerId));
  
      if(exists.length==0){
        return NextResponse.json(
          { success: false, error: "customer's id not found to delete" },
          { status: 400 }
        );
  
      }

    await  db.delete(customers).where(and(eq(customers.id, customerId), eq(customers.userId, userId)));

    return NextResponse.json({ success: true, message: `Customer deleted with ID: ${customerId}` });

}
catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }


}



