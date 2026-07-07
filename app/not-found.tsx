import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: "#EDEBE7", color: "#111111" }}
    >
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <div className="text-6xl font-extrabold">404</div>
        <h1 className="mt-4 text-xl font-extrabold uppercase">
          Halaman Tidak Ditemukan
        </h1>
        <p className="mt-2 text-sm font-medium opacity-70">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block border-[3px] border-black px-4 py-3 text-sm font-extrabold uppercase active:translate-y-[2px]"
          style={{ background: "#DDFF00" }}
        >
          Kembali ke Kalkulator
        </Link>
      </div>
    </div>
  );
}
