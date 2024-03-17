export default function PostLayout({children}: {children: React.ReactNode}) {
  return (
    <section className="bg-slate-400 h-full w-full flex justify-center">
      {children}
    </section>
  )
}