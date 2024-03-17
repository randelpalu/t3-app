export default async function Home({params}: {params: {id: string}}) {
  await new Promise((resolve) => {
    setTimeout((
      resolve
    ), 1000)
  });
  return (
    <div>
      USER: {params.id}
    </div>
  )
}