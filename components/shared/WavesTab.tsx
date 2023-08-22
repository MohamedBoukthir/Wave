import { redirect } from "next/navigation";

import { fetchCommunityPosts } from "@/lib/actions/community.action";
import { fetchUserPosts } from "@/lib/actions/user.action";

import WaveCard from "../cards/WaveCard";

interface Result {
  name: string;
  image: string;
  id: string;
  waves: {
    _id: string;
    text: string;
    parentId: string | null;
    author: {
      name: string;
      image: string;
      id: string;
    };
    community: {
      id: string;
      name: string;
      image: string;
    } | null;
    createdAt: string;
    children: {
      author: {
        image: string;
      };
    }[];
  }[];
}

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

async function WavesTab({ currentUserId, accountId, accountType }: Props) {
  let result: Result;

  if (accountType === "Community") {
    result = await fetchCommunityPosts(accountId);
  } else {
    result = await fetchUserPosts(accountId);
  }

  if (!result) {
    redirect("/");
  }

  return (
    <section className='mt-9 flex flex-col gap-10'>
      {result.waves.map((wave) => (
        <WaveCard
          key={wave._id}
          id={wave._id}
          currentUserId={currentUserId}
          parentId={wave.parentId}
          content={wave.text}
          author={
            accountType === "User"
              ? { name: result.name, image: result.image, id: result.id }
              : {
                  name: wave.author.name,
                  image: wave.author.image,
                  id: wave.author.id,
                }
          }
          community={
            accountType === "Community"
              ? { name: result.name, id: result.id, image: result.image }
              : wave.community
          }
          createdAt={wave.createdAt}
          comments={wave.children}
        />
      ))}
    </section>
  );
}

export default WavesTab;