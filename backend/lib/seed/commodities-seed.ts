

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
  {
  id: randomUUID(),
  name: "Sugar",
  unitType: "kg",
  description: "چینی - A sweet crystalline substance obtained from various plants, primarily sugarcane, used as a sweetener in food and beverages.",
},

  // 🌻 Oilseeds
  {
    id: randomUUID(),
    name: "Cotton Seed",
    unitType: "kg",
    description: "روئی کا بیج - Used for oil extraction and as livestock feed after oil is removed.",
  },
  {
    id: randomUUID(),
    name: "Mustard Seed",
    unitType: "kg",
    description: "رائی - Used to produce mustard oil and condiments.",
  },
  {
    id: randomUUID(),
    name: "Sunflower Seed",
    unitType: "kg",
    description: "سورج مکھی - An oilseed crop used for extracting sunflower oil.",
  },
  // 🌱 Pulses / Legumes
  {
    id: randomUUID(),
    name: "Lentil (Masoor)",
    unitType: "kg",
    description: "مسور دال - A red/orange lentil rich in protein, commonly used in South Asian cuisine.",
  },
  {
    id: randomUUID(),
    name: "Chickpeas (Desi)",
    unitType: "kg",
    description: "چنے - A pulse crop used for food and flour (besan).",
  },
  {
    id: randomUUID(),
    name: "Mung Bean",
    unitType: "kg",
    description: "مونگ دال - A small green pulse used in dal dishes and sprouting.",
  },
  // 🌾 Grains & Fodder
  {
    id: randomUUID(),
    name: "Maize (Corn)",
    unitType: "kg",
    description: "مکئی - A versatile grain used for food, feed, and industrial purposes.",
  },
  {
    id: randomUUID(),
    name: "Barley",
    unitType: "kg",
    description: "جو - A cereal grain used for food, fodder, and malt production.",
  },
  {
    id: randomUUID(),
    name: "Oats",
    unitType: "kg",
    description: "جو کی ایک قسم - Grown for food and animal feed, rich in fiber.",
  },
  {
    id: randomUUID(),
    name: "Fodder (Green Feed)",
    unitType: "kg",
    description: "چارہ - Fresh green crops used for feeding livestock.",
  },
 
  {
    id: randomUUID(),
    name: "Sugarcane",
    unitType: "kg",
    description: "گنا - A tall perennial grass used for sugar and jaggery (gur) production.",
  },
 
  // 🐄 Livestock Related
  {
    id: randomUUID(),
    name: "Cattle Feed",
    unitType: "kg",
    description: "جانوروں کا چارہ - Feed mixture for cows and buffaloes to improve milk production.",
  },
  {
    id: randomUUID(),
    name: "Poultry Feed",
    unitType: "kg",
    description: "مرغیوں کا چارہ - Nutrient-rich feed for chickens.",
  }


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

