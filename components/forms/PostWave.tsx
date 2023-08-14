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
import { Textarea } from '../ui/textarea';
import * as z from "zod"

//import { updateUser } from '@/lib/actions/user.action';
import { WaveValidation } from '@/lib/validations/wave';
import { createWave } from '@/lib/actions/wave.action';

interface Props {
    user: {
        id: string;
        objectId: string;
        username: string;
        name: string;
        bio: string;
        image: string;
    };
    btnTitle: string;
}


function PostWave({ userId }: { userId: string }) {
    const router = useRouter();
    const pathname = usePathname();
  
    const form = useForm({
          resolver: zodResolver(WaveValidation),
          defaultValues: {
               wave: '',
               accountId: userId,
          }
      })

    const onSubmit = async (values: z.infer<typeof WaveValidation>) => {
        await createWave({
            text: values.wave,
            author: userId,
            communityId: null,
            path: pathname
        });

        router.push('/')
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}
           className="mt-10 flex flex-col justify-start gap-10">

            <FormField
              control={form.control}
              name="wave"
              render={({ field }) => (
                <FormItem className='flex flex-col w-full gap-3'>
                  <FormLabel className='text-base-semibold text-light-2'>
                    Content
                  </FormLabel>
                  <FormControl className='no-focus border border-dark-4 bg-dark-3 text-light-1'>
                    <Textarea
                        rows={15}
                        {...field}
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />

            <Button
            type='submit'
            className='bg-primary-500'>
                Wave it
            </Button>

            </form> 
        </Form> 
    )
}

export default PostWave;