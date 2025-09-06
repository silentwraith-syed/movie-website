import express from "express";
const router = express.Router();
import { Movies } from "../models/Movies.js";
import { pipeline } from "@xenova/transformers";

//ROUTE 1:Get All the Notes using GET:"/api/movies/fetchAllMovies".login Required.

router.get("/fetchAllMovies", async (req, res) => {
  try {
    const movies = await Movies.find().limit(10); // find is used because we need to find 'all' notes of a user.
    res.json(movies); // req.user can be used because we have imported fetchuser.
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//ROUTE 2: Search movies by keywords

router.get("/search", async (req, res) => {
  try {
    const result = await Movies.aggregate([
      {
        $search: {
          index: "search-movies",
          text: {
            query: req.query.t,
            path: {
              wildcard: "*",
            },
          },
        },
      },
    ]);
    res.json(result);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/autocomplete", async (req, res) => {
  try {
    const agg = [
      {
        $search: {
          index: "autocomplete-text",
          autocomplete: { query: req.query.t, path: "title" },
        },
      },
      { $limit: 20 },
    ];
    // run pipeline
    const result = await Movies.aggregate(agg).limit(7);
    res.json(result);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//ROUTE 4:Search Movies by Category
router.get("/category", async (req, res) => {
  try {
    const result = await Movies.find({
      $or: [
        { genres: { $regex: req.query.t, $options: "i" } },
        { title: { $regex: req.query.t, $options: "i" } },
      ],
      poster: {
        $ne: "N/A",
        $regex: /\.jpg$/,
      },
    }).limit(20);

    res.json(result);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint to generate embeddings and save to MongoDB
// router.post("/generate-embeddings", async (req, res) => {
//   const BATCH_SIZE = 500; // Number of records to process in one batch
//   let processedCount = 0;

//   try {
//     // Step 1: Initialize the embedding model
//     const extractor = await pipeline(
//       "feature-extraction",
//       "Xenova/all-MiniLM-L6-v2"
//     );
//     console.log("Embedding model initialized.");

//     let skip = 0;

//     while (true) {
//       // Step 2: Fetch a batch of movies
//       const movies = await Movies.find({}, { title: 1, fullplot: 1 })
//         .skip(skip)
//         .limit(BATCH_SIZE)
//         .lean();
//       if (movies.length === 0) break; // Exit the loop if no more records

//       console.log(
//         `Processing batch of ${movies.length} movies (skip: ${skip})`
//       );

//       // Step 3: Generate embeddings for the batch
//       const tasks = movies.map(async (movie) => {
//         if (!movie.fullplot) {
//           console.warn(
//             `Skipping movie "${movie.title}" as it has no fullplot.`
//           );
//           return null;
//         }
//         const response = await extractor([movie.fullplot], {
//           pooling: "mean",
//           normalize: true,
//         });
//         return { _id: movie._id, embedding: Array.from(response.data) };
//       });

//       const results = await Promise.all(tasks);

//       // Step 4: Prepare bulk update operations
//       const bulkOps = results
//         .filter((result) => result) // Remove null results
//         .map((result) => ({
//           updateOne: {
//             filter: { _id: result._id },
//             update: { $set: { plot_embedding_384: result.embedding } },
//           },
//         }));

//       // Step 5: Execute bulk write
//       if (bulkOps.length > 0) {
//         await Movies.bulkWrite(bulkOps);
//         console.log(`Updated ${bulkOps.length} movies in batch.`);
//       }

//       processedCount += movies.length;
//       skip += BATCH_SIZE;
//     }

//     console.log(
//       `Embedding generation complete! Processed ${processedCount} movies.`
//     );
//     res.status(200).json({
//       success: true,
//       message: `Embeddings generated successfully for ${processedCount} movies.`,
//     });
//   } catch (error) {
//     console.error("Error during embedding generation:", error.message);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// Route 5: Semantic Search for Movies

router.get("/semantic-search", async (req, res) => {
  try {
    const query = req.query.query;
    const limit = 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Validate query parameter
    if (!query || typeof query !== "string" || query.trim() === "") {
      return res
        .status(400)
        .json({ error: "Query parameter must be a non-empty string." });
    }

    const extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
    const response = await extractor([query], {
      pooling: "mean",
      normalize: true,
    });
    const queryEmbedding = Array.from(response.data); // Convert Tensor to array

    const results = await Movies.aggregate([
      {
        $search: {
          index: "semantic",
          knnBeta: {
            vector: queryEmbedding,
            path: "plot_embedding_384",
            k: 50,
          },
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Step 3: Return the results
    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error("Error in semantic search:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// router.get("/latest", async (req, res) => {
//   try {
//     const movies = await Movies.find().sort({ year: -1 }).limit(100);
//     res.json(movies);
//   } catch (error) {
//     res.status(500).send("Internal Server Error");
//   }
// });
router.get("/latest", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const pageSize = parseInt(req.query.pageSize) || 10; // Default page size is 10

    // Calculate the number of documents to skip
    const skip = (page - 1) * pageSize;

    // Fetch the movies with sorting, skipping, and limiting
    const movies = await Movies.find()
      .sort({ year: -1 }) // Sort by year in descending order
      .skip(skip)
      .limit(pageSize);

    // Count total documents for metadata
    const totalMovies = await Movies.countDocuments();

    res.json({
      movies,
      currentPage: page,
      totalPages: Math.ceil(totalMovies / pageSize),
      totalMovies,
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

//ROUTE 5:Search Movies by Id
router.get("/:id", async (req, res) => {
  try {
    let movie = await Movies.findById(req.params.id);
    res.json(movie);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/fuzzy", async (req, res) => {
  try {
    const agg = [
      {
        $search: {
          index: "fuzzy",
          text: {
            query: req.query.t,
            path: "title",
            fuzzy: {
              maxEdits: 2,
              prefixLength: 1,
              maxExpansions: 10,
            },
          },
        },
      },
      { $limit: 20 },
    ];
    // run pipeline
    const result = await Movies.aggregate(agg);
    res.json(result);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

export default router;