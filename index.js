const express = require('express');
const cors = require('cors');
const app = express()

const port = 5000
require('dotenv').config()

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
app.get('/', (req, res) => {
  res.send('Hello World!')
})


const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    await client.connect();

    const database = client.db('rentnest_db');
    const propertyCollection=database.collection('properties')
    const agencyCollection = database.collection('agencies');
    const usersCollection=database.collection('user')
  const favoritesCollection=database.collection('favorites')

    app.get('/api/users', async (req, res) => {
  
      const cursor = usersCollection.find().skip(2)
      const result = await cursor.toArray()
      res.json(result)
})

app.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.json({
        success: false,
        message: "Role is required",
      });
    }

    const filter = { _id: new ObjectId(req.params.id) };

    const user = await usersCollection.findOne(filter);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === role) {
      return res.json({
        success: false,
        message: "No changes made (same role)",
      });
    }

    const result = await usersCollection.updateOne(filter, {
      $set: { role },
    });
console.log(result);
    return res.json({
      success: true,
      message: "Role updated successfully",
      data: result,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
//     app.get('/api/properties', async (req, res) => {
//       const query = {}
//       if (req.query.propertyId) {
//         query.propertyId=req.query.propertyId
//       }
//       if (req.query.status) {
//         query.status=req.query.status
//       }
//       const cursor = propertyCollection.find(query)
//       const result = await cursor.toArray()
//       res.json(result)
    // })
//     app.get('/api/properties', async (req, res) => {
//   try {
//     const query = {};

//     // 1. Property ID ফিল্টার (যদি থাকে)
//     if (req.query.propertyId) {
//       query.propertyId = req.query.propertyId;
//     }

//     // 2. Status ফিল্টার (যদি ফ্রন্টএন্ড থেকে পাঠানো হয়)
//     if (req.query.status) {
//       query.status = req.query.status;
//     }

//     // 3. Location ফিল্টার (Case-insensitive আংশিক মিল বা Partial Match খোঁজার জন্য RegExp ব্যবহার করা হয়েছে)
//     if (req.query.location) {
//       query.location = { $regex: req.query.location, $options: 'i' };
//     }

//     // 4. Property Type ফিল্টার
//     if (req.query.propertyType) {
//       query.propertyType = req.query.propertyType;
//     }

//     // 5. Price Range (Min/Max Price) ফিল্টার
//     // এখানে $expr এবং $toDouble ব্যবহার করা হয়েছে কারণ আপনার ডাটাবেজে "monthlyRent" স্ট্রিং ('1000') আকারে আছে।
//     if (req.query.minPrice || req.query.maxPrice) {
//       query.$and = [];
      
//       if (req.query.minPrice) {
//         query.$and.push({
//           $expr: { $gte: [{ $toDouble: "$monthlyRent" }, parseFloat(req.query.minPrice)] }
//         });
//       }
      
//       if (req.query.maxPrice) {
//         query.$and.push({
//           $expr: { $lte: [{ $toDouble: "$monthlyRent" }, parseFloat(req.query.maxPrice)] }
//         });
//       }
//     }

//     // 6. Sorting (Price: Low to High / High to Low)
//     let sortOptions = {};
//     if (req.query.sort) {
//       if (req.query.sort === 'price_asc') {
//         sortOptions.monthlyRent = 1;  // কম থেকে বেশি
//       } else if (req.query.sort === 'price_desc') {
//         sortOptions.monthlyRent = -1; // বেশি থেকে কম
//       }
//     } else {
//       sortOptions.createdAt = -1; // ডিফল্টভাবে নতুন প্রোপার্টি আগে দেখাবে
//     }

//     // ডাটাবেজ কোয়েরি এক্সিকিউশন
//     // ডাটাবেজে monthlyRent স্ট্রিং হলে নিখুঁত সর্টিং এর জন্য এখানে collation ব্যবহার করা হয়েছে
//     const cursor = propertyCollection
//       .find(query)
//       .sort(sortOptions)
//       .collation({ locale: "en", numericOrdering: true });

//     const result = await cursor.toArray();
//     res.json(result);

//   } catch (error) {
//     console.error("Backend Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
    // });
    

    app.get('/api/properties/:id', async (req, res) => {
      const id = req.params.id;
      const query = {
        _id:new ObjectId(id)
      }
      const result = await propertyCollection.findOne(query)
      res.json(result)
    })


    app.get('/api/admin/properties', async (req, res) => {
  const result = await propertyCollection.find({}).toArray();
  res.json(result);
});
// app.get('/api/properties/admin', async (req, res) => {
//   try {
//     const { userId, status, location, propertyType, minPrice, maxPrice, sort } = req.query;

//     const matchQuery = {};

//     // FIX HERE
//     if (userId) matchQuery.ownerId = userId;

//     if (status) matchQuery.status = status;
//     if (propertyType) matchQuery.propertyType = propertyType;

//     if (location) {
//       matchQuery.location = { $regex: location, $options: 'i' };
//     }

//     const pipeline = [{ $match: matchQuery }];

//     pipeline.push({
//       $addFields: {
//         numericRent: { $toDouble: "$monthlyRent" }
//       }
//     });

//     if (minPrice || maxPrice) {
//       const priceMatch = {};
//       if (minPrice) priceMatch.$gte = parseFloat(minPrice);
//       if (maxPrice) priceMatch.$lte = parseFloat(maxPrice);

//       pipeline.push({
//         $match: { numericRent: priceMatch }
//       });
//     }

//     let sortStage = { $sort: { createdAt: -1 } };

//     if (sort === 'price_asc') {
//       sortStage = { $sort: { numericRent: 1 } };
//     } else if (sort === 'price_desc') {
//       sortStage = { $sort: { numericRent: -1 } };
//     }

//     pipeline.push(sortStage);

//     const result = await propertyCollection.aggregate(pipeline).toArray();
//     res.json(result);

//   } catch (error) {
//     console.error("Backend Filter Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
  app.get('/api/properties', async (req, res) => {
  try {
    const { userId, location, propertyType, minPrice, maxPrice, sort } = req.query;

    // ✅ PUBLIC RULE: only approved properties
    const matchQuery = {
      status: "approved",
    };

    if (userId) matchQuery.ownerId = userId;

    if (propertyType) matchQuery.propertyType = propertyType;

    if (location) {
      matchQuery.location = { $regex: location, $options: "i" };
    }

    const pipeline = [{ $match: matchQuery }];

    pipeline.push({
      $addFields: {
        numericRent: { $toDouble: "$monthlyRent" }
      }
    });

    if (minPrice || maxPrice) {
      const priceMatch = {};
      if (minPrice) priceMatch.$gte = parseFloat(minPrice);
      if (maxPrice) priceMatch.$lte = parseFloat(maxPrice);

      pipeline.push({
        $match: { numericRent: priceMatch }
      });
    }

    let sortStage = { $sort: { createdAt: -1 } };

    if (sort === 'price_asc') {
      sortStage = { $sort: { numericRent: 1 } };
    } else if (sort === 'price_desc') {
      sortStage = { $sort: { numericRent: -1 } };
    }

    pipeline.push(sortStage);

    const result = await propertyCollection.aggregate(pipeline).toArray();
    res.json(result);

  } catch (error) {
    console.error("Backend Filter Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// app.get("/api/properties/public", async (req, res) => {
//   const matchQuery = { status: "Approved" };

//   const data = await propertyCollection
//     .find(matchQuery)
//     .toArray();

//   res.json(data);
// });
  app.patch("/api/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // ফ্রন্টএন্ড থেকে পাঠানো payload (req.body) থেকে ডাটা আলাদা করা হচ্ছে
    const { 
      title, 
      location, 
      propertyType, 
      rentType, 
      monthlyRent, 
      propertySize, 
      bedrooms, 
      bathrooms, 
      extraFeatures, 
      imageUrl, 
       status,            // ✅ ADD THIS
  rejectionReason,
      amenities 
    } = req.body;

    // ডাটাবেজে আপডেট করার জন্য অবজেক্ট তৈরি
    const updateData = {
      title,
      location,
      propertyType,
      rentType,
      monthlyRent,
      propertySize,
      bedrooms,
      bathrooms,
      extraFeatures,
      imageUrl,
       status,            // ✅ ADD THIS
  rejectionReason,
      amenities,
      updatedAt: new Date() // এডিট করার সময় কারেন্ট ডেট সেভ হবে
    };

    // মঙ্গোডিবি-তে ফিল্টার এবং $set অপারেটর ব্যবহার
    const result = await propertyCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { ...updateData } 
      }
    );

    // ফ্রন্টএন্ডে রেজাল্ট পাঠানো হচ্ছে
    res.json(result);

  } catch (error) {
    console.error("Backend Database Error:", error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
  });
    
    // admin status change 
    app.patch("/api/properties/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const result = await propertyCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          rejectionReason,
          updatedAt: new Date()
        }
      }
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error });
  }
    });
    
    app.patch("/api/properties/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const result = await propertyCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "Rejected",
          rejectionReason,
          updatedAt: new Date(),
        },
      }
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
    app.delete('/api/properties/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await propertyCollection.deleteOne(query);
    res.json(result);
  } catch (error) {
    console.error("Delete Favorite Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post('/api/properties/reviews', async (req, res) => {
  try {
    const { propertyId, reviewerName, rating, comment } = req.body;

   
    if (!propertyId || !reviewerName || !comment) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // ২. প্রোপার্টি আইডিটি মঙ্গোডিবির নিয়ম অনুযায়ী ভ্যালিড কিনা চেক করা
    if (!ObjectId.isValid(propertyId)) {
      return res.status(400).json({ success: false, error: "Invalid Property ID format" });
    }

    
    const reviewDoc = {
      reviewerName: reviewerName,
      rating: parseInt(rating) || 5,
      comment: comment,
      createdAt: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    };


    const result = await propertyCollection.updateOne(
      { _id: new ObjectId(propertyId) }, 
      { $push: { reviews: reviewDoc } }
    );


    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: "Property not found to review" });
    }

    return res.status(200).json({ success: true, message: "Review added successfully", review: reviewDoc });

  } catch (error) {
    console.error("Review Submit Backend Error:", error);
    
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

   


    app.post('/api/properties', async (req, res) => {
      const property = req.body;
      const newProperty = {
        ...property,
        createdAt:new Date()
      }
      const result = await propertyCollection.insertOne(newProperty)
      res.json(result);
    })
    // Owner Agency releted apis

// app.get('/api/my/agency', async (req, res) => {
//   const { ownerId } = req.query;
  
//   if (!ownerId) {
//     return res.status(400).json({ message: "ownerId is required" });
//   }

//   // ওনার আইডি দিয়ে খোঁজার জন্য ফ্লেক্সিবল কুয়েরি অবজেক্ট
//   let query = { ownerId: ownerId };

//   try {
//     const result = await agencyCollection.findOne(query);
    
    
//     if (!result) {
//       try {
//         const altQuery = { ownerId: new ObjectId(ownerId) };
//         const altResult = await agencyCollection.findOne(altQuery);
//         return res.json(altResult);
//       } catch (e) {

//       }
//     }

//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error" });
//   }
    // });

    app.get('/api/agency', async (req, res) => {
      const cursor = agencyCollection.find()
      const result = await cursor.toArray()
      res.json(result)
    })
    
    app.get('/api/my/agency', async (req, res) => {
      const query = {}
      if (req.query.ownerId) {
        query.ownerId=req.query.ownerId
      }

      const result = await agencyCollection.findOne(query)
      res.json(result ||{})

    })
     app.post('/api/agency', async (req, res) => {
      const agencyData = req.body;
       const newAgencyData = {
         ...agencyData,
         createdAt:new Date()
      }
  
      const query = { ownerId: agencyData.ownerId };
      const updateDoc = {
        $set: {
          ...agencyData,
          updatedAt: new Date()
        }
      };
      
      
      const options = { upsert: true };
      const result = await agencyCollection.updateOne(query, updateDoc, options);
      res.json(result);
     });
    // booking related api


app.get("/api/my-bookings", async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email parameter is required"
      });
    }

    const bookings = await database
      .collection("bookings")
      .find({ email })
      .sort({ createdAt: -1 })
      .toArray();

    // 🔗 রেসপন্স ফরম্যাটটি POST রাউটের মতো সুন্দর করে পাঠানো হলো
    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error("Booking GET error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});


app.post("/api/bookings", async (req, res) => {
  try {
    const {
      propertyId,
      propertyName,
      email,
      userName,
      phone,
      moveInDate,
      stripeSessionId // Added to track actual Stripe purchases securely
    } = req.body;

    // 1️⃣ Validation
    if (!propertyId || !email) {
      return res.status(400).json({
        success: false,
        message: "propertyId and email are required"
      });
    }

    // 2️⃣ ID-Based Duplicate Check 
    // Prevents double entry if user Refreshes/Reloads the success page.
    if (stripeSessionId) {
      const sessionExists = await database.collection("bookings").findOne({ stripeSessionId });
      if (sessionExists) {
        return res.status(200).json({
          success: true,
          message: "Booking already stored",
          data: sessionExists
        });
      }
    }

    // 3️⃣ Get real property details securely
    const property = await database.collection("properties").findOne({
      _id: new ObjectId(propertyId)
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // 4️⃣ Assemble finalized data
    const bookingData = {
      propertyId,
      propertyName: property.title || propertyName,
      email,
      userName,
      phone,
      moveInDate,
      stripeSessionId,

      // Secure payment numbers from Database
      amount: property.monthlyRent,

      // Updated statuses since this route only fires after a paid checkout 
      bookingStatus: "confirmed", 
      paymentStatus: "paid",       

      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await database.collection("bookings").insertOne(bookingData);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      insertedId: result.insertedId,
      data: bookingData
    });

  } catch (error) {
    console.error("Booking POST error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
      

    

// ১. ফেভারিট প্রোপার্টিগুলোর ডিটেইলসসহ ডেটা আনার API (Aggregation)
app.get('/api/my-favorites', async (req, res) => {
  try {
    
    const tenantEmail = req.query.email || "tenant@example.com"; 

    const result = await favoritesCollection.aggregate([
      {
        $match: { tenantEmail: tenantEmail }
      },
      {
        
        $addFields: {
          pId: { $toObjectId: "$propertyId" }
        }
      },
      {
        $lookup: {
          from: "properties", // properties কালেকশনের নাম
          localField: "pId",
          foreignField: "_id",
          as: "propertyDetails"
        }
      },
      {
        $unwind: "$propertyDetails" // অ্যারে থেকে অবজেক্টে রূপান্তর
      },
      {
      $project: {
  _id: 1,
  propertyId: 1,
  tenantEmail: 1,
  propertyName: "$propertyDetails.title",
  location: "$propertyDetails.location",
  price: "$propertyDetails.monthlyRent"
}
      }
    ]).toArray();

    res.json(result);
  } catch (error) {
    console.error("Fetch Favorites Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ২. ফেভারিট লিস্ট থেকে ডিলিট করার API
app.delete('/api/favorites/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await favoritesCollection.deleteOne(query);
    res.json(result);
  } catch (error) {
    console.error("Delete Favorite Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


    app.post('/api/favorites', async (req, res) => {
   console.log("🔥 BODY RECEIVED:", req.body);
  try {
    const favoriteItem = req.body;
    
    // অথেনটিকেশন থেকে ইমেইল ধরবেন, না থাকলে আপাতত ডামি
    const tenantEmail = req.user?.email || "tenant@example.com"; 

    // ১. ফিল্টার: চেক করবে এই ইউজারের অ্যাকাউন্টে এই প্রোপার্টি আইডি অলরেডি আছে কি না
    const filter = { 
      tenantEmail: tenantEmail, 
      propertyId: favoriteItem.propertyId 
    };
    
    // ২. আপডেট ডকুমেন্ট
 const updateDoc = {
  $set: {
    tenantEmail,
    ...favoriteItem,
    createdAt: new Date()
  }
};

    // ৩. upsert: true দেওয়ার কারণে ডেটা না থাকলে নতুন insert হবে, থাকলে আগেরটাই থাকবে (ডুপ্লিকেট হবে না)
    const result = await favoritesCollection.updateOne(filter, updateDoc, { upsert: true });

   
    res.status(200).json({ success: true, result });
    
  } catch (error) {
    console.error("Favorite Insert Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});
    
   
app.get('/api/my-favorites', async (req, res) => {
  const tenantEmail = req.user?.email || "tenant@example.com";
  const userFavorites = await favoritesCollection.find({ tenantEmail }).toArray();
  res.json(userFavorites);
});


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})