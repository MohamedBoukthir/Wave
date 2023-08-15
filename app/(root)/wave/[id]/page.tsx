import WaveCard from "@/components/cards/WaveCard";
import { fetchUser } from "@/lib/actions/user.action";
import { fetchWaveById } from "@/lib/actions/wave.action";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

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
                key={wave._id}
                id={wave._id}
                currentUserId={user?.id || ""}
                parentId={wave.parentId}
                content={wave.text}
                author={wave.author}
                community={wave.community}
                createdAt={wave.createdAt}
                comments={wave.children}
                />
        </div>
    </section>
    )
}

export default Page;