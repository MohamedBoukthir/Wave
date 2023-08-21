import { fetchUserPosts } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";
import WaveCard from "../cards/WaveCard";
import { fetchCommunityPosts } from "@/lib/actions/community.action";

interface Props {
    currentUserId: string;
    accountId: string;
    accountType: string;
}


const WavesTab = async ({currentUserId, accountId, accountType}: Props) => {
    let result: any;

    if(accountType === 'Community') {
        result = await fetchCommunityPosts(accountId);
    } else {
        result = await fetchUserPosts(accountId);
    }

    if(!result) redirect('/')

    return (
        <section className="mt-9 flex flex-col gap-10">
            {result.waves.map((wave: any) => (
                <WaveCard
                    key={wave._id}
                    id={wave._id}
                    currentUserId={currentUserId}
                    parentId={wave.parentId}
                    content={wave.text}
                    author={
                        accountType === 'User'
                            ? {name: result.name, image: result.image, id: result.id}
                            : {name: wave.author.name, image: wave.author.image, id: wave.author.id}
                    }
                    community={wave.community}
                    createdAt={wave.createdAt}
                    comments={wave.children}
                />
            ))}
        </section>
    )
}

export default WavesTab;