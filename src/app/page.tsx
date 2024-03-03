import { currentUser } from "@clerk/nextjs";
import { unstable_noStore as noStore } from "next/cache";
import { SignInButton } from "@clerk/nextjs";
import { api } from "~/trpc/server";
import { CreatePost } from "./_components/create-post";
import { type RouterOutputs } from "../trpc/shared";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import Image from "next/image";
import { Suspense } from "react";
import { loaderWithTopMargin } from "./loading";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["post"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-8">
      <Image
        alt={`${author.username}'s profile picture`}
        className="w-16 h-16 rounded-full"
        src={author.imageUrl}
        width={56}
        height={56}>
      </Image>
      <div className="flex flex-col">
        <div className="flex text-slate-300">
          <span>{`@${author.username}`}</span>
          <span className="font-thin">{`\u00A0\u00A0∙  ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  )
}

const Feed = async() => {
  const posts = await api.post.getAll.query();

  return (
    <div className="flex flex-col">
      { posts?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id}/>
      ))}
    </div>
  )
}

export default async function Home() {
  noStore();
  const hello = await api.post.hello.query({ text: "from tRPC" });
  const user = await currentUser();

  return (
    <main className="flex h-screen w-screen justify-center">
      <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
        <div className="flex border-b border-slate-400 p-4">
          { !!user ? <CreatePost /> : <SignInButton />}
        </div>
        <div className="flex justify-center border-b border-slate-400 p-4">
          <p>
            {hello ? hello.greeting : "Loading tRPC query..."}
          </p>
        </div>
        <div>
        </div>
        <Suspense fallback={ loaderWithTopMargin(60) }>
          <Feed />
        </Suspense>
      </div>
    </main>
  );
}
