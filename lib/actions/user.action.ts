"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Wave from "../models/wave.model";

interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
}


// Update User
export async function updateUser({
    userId,
    username,
    name,
    bio,
    image,
    path,
}: Params): Promise<void> {
     try {
        connectToDB();

        await User.findOneAndUpdate(
            { id: userId },
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true,
            },
            { upsert: true }
        );
        if(path === '/profile/edit') {
            revalidatePath(path);
        }
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`);
    }
}

// Fetch User 
export async function fetchUser(userId: string) {
    try {
        connectToDB();

        return await User
            .findOne({ id:userId })
            //.populate({
            //path: 'communities',
            //model: Community
        //})
    } catch (error: any) {
        throw new Error(`Failed to Fetch user: ${error.message}`)
    }
}

// fetch user waves
export async function fetchUserPosts(userId: string) {
    try {
        connectToDB();

        // find all waves authored by user
        const waves = await User.findOne({ id: userId })
        .populate({
            path: 'waves',
            model: Wave,
            populate: {
                path: 'children',
                model: Wave,
                populate: {
                    path: 'author',
                    model: User,
                    select: 'name image id'
                }
            }
        }) 
        return waves;
    } catch (error: any) {
        throw new Error (`failed to fetch user posts ${error.message}`)
    }
}
