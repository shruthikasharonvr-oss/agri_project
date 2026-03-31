import { createClient } from "@supabase/supabase-js";

// Seed data for marketplace
const SEED_PRODUCTS = [
  {
    name: "Organic Ragi Flour",
    category: "Grains",
    price: 60,
    unit: "kg",
    rating: 4.8,
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKlkLRUmc3NuhvhdVOuCQLqcG4yo14oSE6vg&s"
  },
  {
    name: "Fresh Cow Ghee",
    category: "Dairy",
    price: 850,
    unit: "500ml",
    rating: 4.9,
    image_url: "https://images.unsplash.com/photo-1596522868827-678785f7cd45?q=80&w=2000&auto=format&fit=crop"
  },
  {
    name: "Pure Wild Honey",
    category: "Honey",
    price: 450,
    unit: "kg",
    rating: 5.0,
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMm2fiyXRMp1b6Qs7ChWvnsyCJKki-2SoaJg&s"
  },
  {
    name: "Premium Basmati Rice",
    category: "Grains",
    price: 320,
    unit: "kg",
    rating: 4.7,
    image_url: "https://images.unsplash.com/photo-1586080876198-6e2ce93ef6ba?q=80&w=2000&auto=format&fit=crop"
  },
  {
    name: "Fresh Tomatoes",
    category: "Vegetables",
    price: 45,
    unit: "kg",
    rating: 4.6,
    image_url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=2000&auto=format&fit=crop"
  },
  {
    name: "Banana Bunch",
    category: "Fruits",
    price: 80,
    unit: "dozen",
    rating: 4.8,
    image_url: "https://images.unsplash.com/photo-1587182142653-2f31e908e1b4?q=80&w=2000&auto=format&fit=crop"
  },
  {
    name: "Organic Spinach",
    category: "Vegetables",
    price: 35,
    unit: "kg",
    rating: 4.9,
    image_url: "https://m.media-amazon.com/images/I/6190UDgSyIL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    name: "Alphonso Mangoes",
    category: "Fruits",
    price: 1200,
    unit: "dozen",
    rating: 4.7,
    image_url: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=1580&auto=format&fit=crop"
  },
  {
    name: "Turmeric Powder",
    category: "Spices",
    price: 250,
    unit: "kg",
    rating: 4.9,
    image_url: "https://images.unsplash.com/photo-1596040306246-1c2ca6b08bbb?q=80&w=2000&auto=format&fit=crop"
  },
  {
    name: "Coconut Oil",
    category: "Oils",
    price: 320,
    unit: "ltr",
    rating: 4.8,
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4B02KYH5EVtUMaXrqSJcXzNi0hjJwYoDR9A&s"
  },
  {
    name: "Fresh Carrot",
    category: "Vegetables",
    price: 40,
    unit: "kg",
    rating: 4.7,
    image_url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=2000&auto=format&fit=crop"
  },
  {
    name: "Pearl Millet",
    category: "Grains",
    price: 120,
    unit: "kg",
    rating: 4.8,
    image_url: "https://images.unsplash.com/photo-1586254965502-e96da69f04da?q=80&w=2000&auto=format&fit=crop"
  }
];

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Check if products already exist
    const { data: existingProducts, error: checkError } = await supabase
      .from("products")
      .select("name")
      .limit(1);

    if (checkError) {
      return Response.json(
        { error: "Failed to check existing products", details: checkError.message },
        { status: 500 }
      );
    }

    // If products already exist, optionally delete them
    if (existingProducts && existingProducts.length > 0) {
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (deleteError) {
        console.warn("Could not delete existing products:", deleteError.message);
      }
    }

    // Insert seed products
    const { data, error } = await supabase
      .from("products")
      .insert(SEED_PRODUCTS);

    if (error) {
      return Response.json(
        { error: "Failed to seed products", details: error.message },
        { status: 500 }
      );
    }

    // Verify count
    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    return Response.json({
      success: true,
      message: `Successfully seeded ${SEED_PRODUCTS.length} marketplace products`,
      productsAdded: SEED_PRODUCTS.map((p) => p.name),
      totalProductsInDB: count || 0
    });
  } catch (error: any) {
    return Response.json(
      { error: "Server error during seeding", details: error.message },
      { status: 500 }
    );
  }
}
