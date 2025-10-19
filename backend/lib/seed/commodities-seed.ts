

// for inserting all commodities at once into the table and then use them later any time by fetching from the db 

import { getRandomValues, randomInt, randomUUID } from "crypto";
import {db} from "../db/db";
import {commodities} from "../db/schema";
import { date } from "drizzle-orm/mysql-core";
import {sql , eq } from "drizzle-orm";


const default_commodities = [
  {
    id: randomUUID(),
    name: "Wheat",
    unitType: "kg",
    description: "گندم - A staple grain used for making flour, bread, and other food products.",
    
  },
  {
    id: randomUUID(),
    name: "Flour",
    unitType: "kg",
    description: "آٹا - A finely ground powder made from wheat or other grains, commonly used in baking and cooking.",
    
  },
  {
    id: randomUUID(),
    name: "Gram Flour",
    unitType: "kg",
    description: "بیسن - Also known as besan, it’s a protein-rich flour made from ground chickpeas, used in various South Asian dishes.",
   
  },

  {
    id: randomUUID(),
    name: "Rice",
    unitType: "kg",
    description: "چاول - A widely consumed cereal grain and a primary source of carbohydrates, often eaten boiled or steamed.",
    
  },
  {
    id: randomUUID(),
    name: "Milk",
    unitType: "litre",
    description: "دودھ - A nutrient-rich liquid produced by mammals, commonly used for drinking and in dairy products like butter and cheese.",
    
  },
];


export async function seed_commodities() {


  try {

    // 1️⃣ Check if commodities table already has data
    
    const existing = await db.select().from(commodities).limit(1);
    
    
    if (existing.length > 0) {
    
      console.log("⚠️ Commodities already exist — skipping seed.");
    
      return;
    
    }
    // 2️⃣ Insert only if table is empty    
    await db
      .insert(commodities)
      .values(default_commodities);
    

       console.log("✅ Commodities seeded successfully!");
}
catch (err) {
    console.error("❌ Failed to seed commodities:", err);
  }

}

