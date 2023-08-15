import { fetchWaves } from "@/lib/actions/wave.action";
import { currentUser } from "@clerk/nextjs";

export default async function Home() {
  const result = await fetchWaves(1, 30);
  const user = await currentUser();

  return (
    <>
      <h1 className="head-text text-left">Home</h1>

      <section className="mt-9 flex flex-col gap-10">
        { result.waves.length === 0 ? (
          <p className="no-result">No Waves Found</p>
        ) : (
          <>
            { result.waves.map((wave) => (
              <WaveCard
                key={wave._id}
                id={wave._id}
                currentUserId={user?.id}
                parentId={wave.parentId}
                content={wave.text}
                author={wave.author}
                community={wave.community}
                createdAt={wave.createdAt}
                comments={wave.children}
              />
            )) }
          </>
        )}
      </section>
    </>
  )
}