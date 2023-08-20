import ProfileHeader from '@/components/shared/ProfileHeader';
import { fetchUser, getNotification } from '@/lib/actions/user.action';
import { currentUser } from '@clerk/nextjs'
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation'


async function Page() {
    
    const user = await currentUser();
    if(!user) return null;

    const userInfo = await fetchUser(user.id);
    if(!userInfo?.onboarded) redirect ('onboarding');

    // Get Notification
    const notification = await getNotification(userInfo._id);

    return (
      <section>
          <h1 className="head-text mb-10">Activity</h1>

          <section className='mt-10 flex flex-col gap-5'>
            {notification.length > 0 ? (
              <>
              {notification.map((notification) => (
                <Link key={notification._id} href={`/wave/${notification.parentId}`}>
                  <article className='activity-card'>
                    <Image
                      src={notification.author.image}
                      alt='Profile Picture'
                      width={20}
                      height={20}
                      className='rounded-full object-cover'
                    />
                    <p className='!text-small-regular text-light-1'>
                      <span className='mr-1 text-primary-500'>
                        {notification.author.name}
                      </span>{" "}
                        Replied To Your Wave
                    </p>
                  </article>
                </Link>
              ))}
              </>
            ) : <p className='!text-base-regular text-light-3'>
                    No Notification Yet
                </p> }
          </section>
      </section>
    )
  }
  
  export default Page