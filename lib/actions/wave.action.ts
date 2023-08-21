"use server";

import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongoose";

import User from "../models/user.model";
import Wave from "../models/wave.model";
import Community from "../models/community.model";

export async function fetchWaves(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calculate the number of waves to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a query to fetch the waves that have no parent (top-level waves) (a wave that is not a comment/reply).
  const wavesQuery = Wave.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "community",
      model: Community,
    })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });

  // Count the total number of top-level waves (waves) i.e., waves that are not comments.
  const totalPostsCount = await Wave.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of waves

  const waves = await wavesQuery.exec();

  const isNext = totalPostsCount > skipAmount + waves.length;

  return { waves, isNext };
}

interface Params {
  text: string,
  author: string,
  communityId: string | null,
  path: string,
}

export async function createWave({ text, author, communityId, path }: Params
) {
  try {
    connectToDB();

    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    const createdWave = await Wave.create({
      text,
      author,
      community: communityIdObject, // Assign communityId if provided, or leave it null for personal account
    });

    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { waves: createdWave._id },
    });

    if (communityIdObject) {
      // Update Community model
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { waves: createdWave._id },
      });
    }

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create wave: ${error.message}`);
  }
}

async function fetchAllChildWaves(waveId: string): Promise<any[]> {
  const childWaves = await Wave.find({ parentId: waveId });

  const descendantWaves = [];
  for (const childWave of childWaves) {
    const descendants = await fetchAllChildWaves(childWave._id);
    descendantWaves.push(childWave, ...descendants);
  }

  return descendantWaves;
}

export async function deleteWave(id: string, path: string): Promise<void> {
  try {
    connectToDB();

    // Find the wave to be deleted (the main wave)
    const mainWave = await Wave.findById(id).populate("author community");

    if (!mainWave) {
      throw new Error("Wave not found");
    }

    // Fetch all child waves and their descendants recursively
    const descendantWaves = await fetchAllChildWaves(id);

    // Get all descendant wave IDs including the main wave ID and child wave IDs
    const descendantWaveIds = [
      id,
      ...descendantWaves.map((wave) => wave._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantWaves.map((wave) => wave.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainWave.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantWaves.map((wave) => wave.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainWave.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child waves and their descendants
    await Wave.deleteMany({ _id: { $in: descendantWaveIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { waves: { $in: descendantWaveIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { waves: { $in: descendantWaveIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete wave: ${error.message}`);
  }
}

export async function fetchWaveById(waveId: string) {
  connectToDB();

  try {
    const wave = await Wave.findById(waveId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }) // Populate the author field with _id and username
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      }) // Populate the community field with _id and name
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Wave, // The model of the nested children (assuming it's the same "Wave" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();

    return wave;
  } catch (err) {
    console.error("Error while fetching wave:", err);
    throw new Error("Unable to fetch wave");
  }
}

export async function addCommentToWave(
  waveId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // Find the original wave by its ID
    const originalWave = await Wave.findById(waveId);

    if (!originalWave) {
      throw new Error("Wave not found");
    }

    // Create the new comment wave
    const commentWave = new Wave({
      text: commentText,
      author: userId,
      parentId: waveId, // Set the parentId to the original wave's ID
    });

    // Save the comment wave to the database
    const savedCommentWave = await commentWave.save();

    // Add the comment wave's ID to the original wave's children array
    originalWave.children.push(savedCommentWave._id);

    // Save the updated original wave to the database
    await originalWave.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}