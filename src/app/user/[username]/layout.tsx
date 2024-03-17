export default function UserLayout({children}: {children: React.ReactNode}) {
  return (
    <section className="bg-red-800 w-full h-full flex justify-center min-h-full">
      {children}
    </section>
  )
}