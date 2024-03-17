import { api } from "../../../trpc/server";

export default async function Home({params}: {params: {username: string}}) {
  const { username } = params;

  const user = await api.profile.getUserByUsername.query({ username });

  return user ? (
    <div>
      USER: {username} <br />
      name1: {user.firstName} <br />
      name2: {user.lastName} <br />
    </div>
  ) : null;
}