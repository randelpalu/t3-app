import { UserButton, currentUser } from "@clerk/nextjs";
import { unstable_noStore as noStore } from "next/cache";

import { api } from "~/trpc/server";

export default async function Home() {
  noStore();
  const hello = await api.post.hello.query({ text: "from tRPC" });
  const user = await currentUser();
  const posts = await api.post.getAll.query();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <div className="flex flex-col items-center gap-2">
          <p className="text-2xl text-white">
            {hello ? hello.greeting : "Loading tRPC query..."}
          </p>
        </div>
        <div>
          { !!user ? user.firstName : '( Not logged in )'}
        </div>
        <div>
          <UserButton />
        </div>
        <div>
          { posts?.map((post) => (
            <div key={post.id}>{post.content}</div>
          ))}
        </div>
      </div>
    </main>
  );
}
