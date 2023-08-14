"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import Wave from "../models/wave.model";
import { connectToDB } from "../mongoose";

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}

export async function createWave ({ text, author, communityId, path }: Params) {
    try {
        connectToDB();

        const createdWave = await Wave.create({
            text,
            author,
            community: null,
        });
    
        // update user model
        await User.findByIdAndUpdate(author, {
            $push: { waves: createdWave._id }
        })
    
        revalidatePath(path);
    } catch (error: any) {
        throw new Error (`Error creating wave: ${error.message}`)
    }
}