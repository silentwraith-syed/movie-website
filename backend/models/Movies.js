import mongoose from "mongoose";
const { Schema } = mongoose;

// Define the schema with an explicit field for the new embeddings
const MoviesSchema = new mongoose.Schema(
  {
    plot_embedding_384: [Number], // New field for 384-dimensional embeddings
  },
  { strict: false } // Allow other properties not explicitly defined in the schema
);

// Create the Movies model
export const Movies = mongoose.model("movies", MoviesSchema);
