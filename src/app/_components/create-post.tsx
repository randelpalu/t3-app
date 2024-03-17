"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { api } from "~/trpc/react";
import { loaderWithTopMargin } from "../loading";

export function CreatePost() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const { user } = useUser();

  if (!user) return null;

  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      router.refresh();
      setContent("");
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors.content;
      if(errorMessage) {
        const messages = errorMessage.join('\n');
        toast.error(`Failed to post ! \n${messages}`);
      } else {
        toast.error(`Failed to post !`);
      }
      router.refresh();
      setContent("");
    }
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createPost.mutate({ content });
      }}
      className="flex gap-3 w-full outline-none"
    >
      <Image
        className="w-16 h-16 rounded-full"
        alt="Profile image"
        src={user.imageUrl}
        width={56}
        height={56}>
      </Image>
      <div className="w-full flex gap-2">
        <input
          type="text"
          placeholder="Type some emojis !"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-4/6 h-full rounded-full px-4 py-2 text-black"
        />
        <div>
          {content !== 'd' && !createPost.isLoading && (
            <button
            type="submit"
            className="rounded-full w-36 h-full bg-orange-600 px-10 py-3 font-semibold transition hover:bg-orange-600/90"
            disabled={createPost.isLoading}
            >
              {createPost.isLoading ? "Submitting..." : "Submit"}
            </button>
          )}
          {createPost.isLoading && (
            <div className="flex w-36 items-center justify-center">
              { loaderWithTopMargin(16) }
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
