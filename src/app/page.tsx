import Button from "@/components/Button";
import Logo from "@/components/Logo";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black border border-gray-300">
      <header className="flex items-center p-6 border-b border-gray-300">
        <Logo width={80} />
        <h1 className="text-2xl font-bold ml-4">Laureas</h1>
        <div className="ml-auto" />
        <Link
          href="/dashboard"
          className="px-6 py-2 rounded border border-black text-black hover:bg-gray-100"
        >
          Login
        </Link>
      </header>

      <main className="flex flex-col items-center justify-center flex-grow py-24 px-4 text-center">
        <h2 className="text-4xl font-extrabold mb-4">
          Where Champions Are Crowned
        </h2>
        <p className="text-lg max-w-xl mb-8">
          Host, manage and elevate your tournaments — from esports to local
          leagues. Built for competitors, designed for organizers.
        </p>
        <div className="flex gap-4">
          <button className="px-6 py-2 rounded border border-black text-black hover:bg-gray-100">
            Create Tournament
          </button>
          <button className="px-6 py-2 rounded border border-black text-black hover:bg-gray-100">
            Learn More
          </button>
        </div>
      </main>
    </div>
  );
}
