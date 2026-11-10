import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-copper uppercase">404</p>
        <h1 className="mt-2 text-4xl">This page is not in the registry</h1>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-pine">
          Back to the dashboard
        </Link>
      </div>
    </div>
  );
}
