import WaveCard from "@/components/cards/WaveCard";
import Comment from "@/components/forms/Comment";
import { fetchUser } from "@/lib/actions/user.action";
import { fetchWaveById } from "@/lib/actions/wave.action";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export const revalidate = 0;

const Page = async ({ params }: { params: { id: string }}) => {
    
    if(!params.id) return null;

    const user = await currentUser();
    if(!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect('/onboarding')

    const wave = await fetchWaveById(params.id);

    return (
    <section className="relative">
        <div>
            <WaveCard
                id={wave._id}
                currentUserId={user.id}
                parentId={wave.parentId}
                content={wave.text}
                author={wave.author}
                community={wave.community}
                createdAt={wave.createdAt}
                comments={wave.children}
                />
        </div>
        <div className='mt-7'>
            <Comment 
                waveId={params.id}
                currentUserImg={userInfo.image}
                currentUserId={JSON.stringify(userInfo._id)}
            />
        </div>
        <div className="mt-10">

            {wave.children.map((childItem: any) => (
                <WaveCard
                    key={childItem._id}
                    id={childItem._id}
                    currentUserId={childItem.id}
                    parentId={childItem.parentId}
                    content={childItem.text}
                    author={childItem.author}
                    community={childItem.community}
                    createdAt={childItem.createdAt}
                    comments={childItem.children}
                    isComment
                />
            ))}

        </div>
    </section>
    )
}

export default Page;