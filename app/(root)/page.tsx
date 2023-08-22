import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import WaveCard from "@/components/cards/WaveCard";
import Pagination from "@/components/shared/Pagination";

import { fetchWaves } from "@/lib/actions/wave.action";
import { fetchUser } from "@/lib/actions/user.action";

async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const result = await fetchWaves(
    searchParams.page ? +searchParams.page : 1,
    30
  );

  return (
    <>
      <h1 className='head-text text-left'>Home</h1>

      <section className='mt-9 flex flex-col gap-10'>
        {result.waves.length === 0 ? (
          <p className='no-result'>No waves found</p>
        ) : (
          <>
            {result.waves.map((wave) => (
              <WaveCard
                key={wave._id}
                id={wave._id}
                currentUserId={user.id}
                parentId={wave.parentId}
                content={wave.text}
                author={wave.author}
                community={wave.community}
                createdAt={wave.createdAt}
                comments={wave.children}
              />
            ))}
          </>
        )}
      </section>

      <Pagination
        path='/'
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </>
  );
}

export default Home;