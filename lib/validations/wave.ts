import * as z from 'zod'

export const WaveValidation = z.object({
    wave: z.string().nonempty().min(1, {message:'Minimum One Characters'}),
    accountId: z.string(),
})

export const CommentValidation = z.object({
    wave: z.string().nonempty().min(1, {message:'Minimum One Characters'}),
})