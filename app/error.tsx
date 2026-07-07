"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: "#EDEBE7", color: "#111111" }}
    >
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <h1 className="text-xl font-extrabold uppercase">Terjadi Kesalahan</h1>
        <p className="mt-2 text-sm font-medium opacity-70">
          Maaf, ada masalah saat memuat kalkulator. Silakan coba lagi.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 border-[3px] border-black px-4 py-3 text-sm font-extrabold uppercase active:translate-y-[2px]"
          style={{ background: "#DDFF00" }}
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
