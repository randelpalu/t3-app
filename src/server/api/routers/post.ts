import { type User, clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    imageUrl: user.imageUrl
  }
}

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ input }) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({
      content: z.string().min(1),
      authorId: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const authorId = input.authorId ?? ''

      return ctx.db.post.create({
        data: {
          content: input.content,
          authorId: authorId
        },
      });
    }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    // simulate a slow db call
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const posts = await ctx.db.post.findMany({
      take: 100
    });

    const users = (await clerkClient.users.
      getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100
      })
    ).map(filterUserForClient);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);

      if(!author?.username) throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:"Post author not found!"
      });

      return {
        post,
        author: {
          ...author,
          username: author.username
        }
      }
    });
  })
});
