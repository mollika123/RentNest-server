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


    app.get('/api/users', async (req, res) => {
  
      const cursor = usersCollection.find().skip(2)
      const result = await cursor.toArray()
      res.json(result)
})


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
app.get('/api/properties', async (req, res) => {
  try {
    const { propertyId, status, location, propertyType, minPrice, maxPrice, sort } = req.query;
    
    // ১. প্রাথমিক ম্যাচ স্টেজ (প্রথমে সাধারণ ফিল্টারগুলো আলাদা করা)
    const matchQuery = {};

    if (propertyId) matchQuery.propertyId = propertyId;
    if (status) matchQuery.status = status;
    if (propertyType) matchQuery.propertyType = propertyType;
    
    // লোকেশন সার্চ: আংশিক মিল এবং কেস-ইনসেনসিটিভ করার জন্য
    if (location) {
      matchQuery.location = { $regex: location, $options: 'i' };
    }

    // ২. Aggregation Pipeline তৈরি
    const pipeline = [{ $match: matchQuery }];

    // ৩. 'monthlyRent' স্ট্রিংকে নাম্বারে রূপান্তর করা (নিখুঁত ফিল্টার ও সর্টিং এর জন্য)
    pipeline.push({
      $addFields: {
        numericRent: { $toDouble: "$monthlyRent" }
      }
    });

    // ৪. প্রাইস রেঞ্জ ফিল্টার (numericRent এর ওপর ভিত্তি করে)
    if (minPrice || maxPrice) {
      const priceMatch = {};
      if (minPrice) priceMatch.$gte = parseFloat(minPrice);
      if (maxPrice) priceMatch.$lte = parseFloat(maxPrice);
      
      pipeline.push({
        $match: { numericRent: priceMatch }
      });
    }

    // ৫. সর্টিং স্টেজ
    let sortStage = { $sort: { createdAt: -1 } }; // ডিফল্ট: নতুন প্রোপার্টি আগে
    if (sort) {
      if (sort === 'price_asc') {
        sortStage = { $sort: { numericRent: 1 } };  // কম থেকে বেশি
      } else if (sort === 'price_desc') {
        sortStage = { $sort: { numericRent: -1 } }; // বেশি থেকে কম
      }
    }
    pipeline.push(sortStage);

    // কোয়েরি এক্সিকিউট করা
    const result = await propertyCollection.aggregate(pipeline).toArray();
    res.json(result);

  } catch (error) {
    console.error("Backend Filter Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
      
      // যদি প্রোফাইল না থাকে তবে নতুন তৈরি হবে, থাকলে আপডেট হবে
      const options = { upsert: true };
      const result = await agencyCollection.updateOne(query, updateDoc, options);
      res.json(result);
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