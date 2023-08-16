"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from '../ui/input';
import * as z from "zod"

//import { updateUser } from '@/lib/actions/user.action';
import { CommentValidation } from '@/lib/validations/wave';
import Image from 'next/image';
import { addCommentToWave } from '@/lib/actions/wave.action';
//import { createWave } from '@/lib/actions/wave.action';

interface Props {
    waveId: string;
    currentUserImg: string;
    currentUserId: string;
}


const Comment = ({ waveId, currentUserImg, currentUserId }: Props) => {
    
    const router = useRouter();
    const pathname = usePathname();
  
    const form = useForm({
          resolver: zodResolver(CommentValidation),
          defaultValues: {
               wave: '',
          }
      })

    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        await addCommentToWave(waveId, values.wave, JSON.parse
            (currentUserId), pathname);

        form.reset();
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}
           className="comment-form">

            <FormField
              control={form.control}
              name="wave"
              render={({ field }) => (
                <FormItem className='flex w-full items-center gap-3'>
                  <FormLabel>
                    <Image
                        src={currentUserImg}
                        alt='Profile image'
                        width={48}
                        height={48}
                        className='rounded-full object-cover'
                    />
                  </FormLabel>
                  <FormControl className='border-none bg-transparent'>
                    <Input
                        type='text'
                        placeholder='Comment...'
                        className='no-focus text-light-1 outline-none'
                        {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
            type='submit'
            className='comment-form_btn'>
                Reply
            </Button>
            </form> 
        </Form>
    )
}

export default Comment;