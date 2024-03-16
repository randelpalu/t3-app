import { type User, clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

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

  create: privateProcedure.
    input(z.object({
      content: z.string().emoji().min(1).max(255)
    })).
    mutation(async ({ctx, input}) => {
      const authorId = ctx.user.id;

      return ctx.db.post.create({
        data: {
          authorId,
          content: input.content
        }
      })
  }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.post.findFirst({
      orderBy: { createdAt: 'desc' },
    });
  }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    // simulate a slow db call
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const posts = await ctx.db.post.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' }
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
