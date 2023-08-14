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

    return <h1>Post Wave Form</h1>
}

export default PostWave;