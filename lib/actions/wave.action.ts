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

export async function fetchWaves(pageNumber = 1, pageSize = 20) {
    connectToDB();

    // calculate the number of posts to skip
    const skipAmount = (pageNumber - 1) * pageSize;

    // fetch the top level waves
    const wavesQuery = Wave.find({ parentId: { $in: [null , undefined]}})
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: 'author', model: User })
    .populate({
        path: 'children',
        populate: { 
            path: 'author',
            model: User,
            select: '_id name parentId image' 
        }
    })

    const totalWavesCount = await Wave.countDocuments({ parentId: { $in: [null , undefined]}})

    const waves = await wavesQuery.exec();

    const isNext = totalWavesCount > skipAmount + waves.length;
    return { waves, isNext }
}

export async function fetchWaveById(id: string) {
    connectToDB();

    try {
        const wave = await Wave.findById(id)
        .populate({
            path: 'author',
            model: User,
            select: '_id id name image'
            })
        .populate({
            path: 'children',
            populate: [
                {
                    path: 'author',
                    model: User,
                    select: '_id id name parentId image'
                },
                {
                    path: 'children',
                    model: Wave,
                    populate: {
                        path: 'author',
                        model: User,
                        select: '_id id name parentId image'
                    }
                }
            ]
        }).exec();

        return wave;
    } catch (error: any) {
        throw new Error(`Error fetching wave: ${error.message}`)
    }
}

export async function addCommentToWave(
    waveId: string,
    commentText: string,
    userId: string,
    path: string,
) {
    connectToDB();

    try {

        // find the original wave by ID
        const originalWave = await Wave.findById(waveId);
        if(!originalWave){
            throw new Error ('Wave Not Found')
        }

        // create a new wave with comment text
        const commmentWave = new Wave({
            text: commentText,
            author: userId,
            parentId: waveId,
        })

        // save to the DB
        const savedCommentWave = await commmentWave.save();

        // update the original wave to include the new comment
        originalWave.children.push(savedCommentWave._id);

        // save the original wave
        await originalWave.save();

        revalidatePath(path);
        
    } catch (error: any) {
        throw new Error(`Error adding comment to wave: ${error.message}`)
    }
}