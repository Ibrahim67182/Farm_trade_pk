import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db/db";
import {or,and,eq , not} from "drizzle-orm";
import { suppliers } from "../../../../../lib/db/schema";
import {verifyAuth}  from "../../../../user-auth-helper-function/verifyAuth";



const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^03\d{2}-\d{7}$/; // only allow like 0333-1234567        // for update duplicate check




// getting particular supplier by id  for particular user to view or display

export async function GET(req:Request , context: { params: Promise<{ id: string }> }) {

  try{

  const userId = verifyAuth(req);

  if(!userId){
     console.log("no user logged in to get supplier record!");
      return NextResponse.json(
        { success: false, error: "user not found to get supplier record!" },
        { status: 400 }
      );
  }

  const {id} = await context.params;        // get suppliers id from params of api call 

  const supplierId = id;

  if(!supplierId){
    console.log("supplier's id not provided ");
      return NextResponse.json(
        { success: false, error: "supplier's id not provided" },
        { status: 400 }
      );

  }

  const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, supplierId));

   if (!supplier || supplier.userId !== userId)
    return NextResponse.json({ success: false, error: "Supplier not found" }, { status: 404 });

  return NextResponse.json(supplier);

}
catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }


}





// update suppliers data by using supplier id 

export async function PUT(req:Request , context: { params: Promise<{ id: string }> } ) {

  try{

   const userId = verifyAuth(req);

  if(!userId){
     console.log("no user logged in to update supplier record!");
      return NextResponse.json(
        { success: false, error: "user not found to update supplier record!" },
        { status: 400 }
      );
  }

   const {id} = await context.params;        // get suppliers id from params of api call 

  const supplierId = id;


  if(!supplierId){
    console.log("supplier's id not provided ");
      return NextResponse.json(
        { success: false, error: "supplier's id not provided" },
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
  .from(suppliers)
  .where(
    and(
      or(eq(suppliers.email, email), eq(suppliers.phone, phone)),
      not(eq(suppliers.id , supplierId))
    )
  );

if (existing.length > 0) {
  return NextResponse.json(
    { success: false, error: "Email or phone already exists for another supplier" },
    { status: 400 }
  );
}

           // ✅ Check if supplier exists and belongs to user
              const supplierExists = await db
                .select()
                .from(suppliers)
                .where(and(eq(suppliers.id, supplierId), eq(suppliers.userId, userId)))
                .limit(1);

              if (supplierExists.length === 0) {
                return NextResponse.json(
                  { success: false, error: "Supplier not found or already deleted" },
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

        await db.update(suppliers).set(updateData).where(eq(suppliers.id, supplierId));


       return NextResponse.json({ success: true, message: `Supplier updated with ${supplierId}` });

    }

    catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }


  
}






// delete suppliers data by using suppliers id

export async function DELETE(req:Request , context: { params: Promise<{ id: string }> }) {

  try{


 const userId = verifyAuth(req);

  if(!userId){
     console.log("no user logged in to delete supplier record!");
      return NextResponse.json(
        { success: false, error: "user not found to delete supplier record!" },
        { status: 400 }
      );
  }

     const {id} = await context.params;        // get suppliers id from params of api call 

      const supplierId = id;


      
  if(!supplierId){
    console.log("supplier's id not provided ");
      return NextResponse.json(
        { success: false, error: "supplier's id not provided" },
        { status: 400 }
      );

  }


    const exists = await db.select().from(suppliers).where(eq(suppliers.id,supplierId));

    if(exists.length==0){
      return NextResponse.json(
        { success: false, error: "supplier's id not found to delete" },
        { status: 400 }
      );

    }
      


    await  db.delete(suppliers).where(and(eq(suppliers.id, supplierId), eq(suppliers.userId, userId)));

    return NextResponse.json({ success: true, message: `Supplier deleted with ID: ${supplierId}` });


}

catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }


}



