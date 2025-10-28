// app/error.tsx
"use client";
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error tracking service
    console.error(error);
  }, [error]);

  return (
    <>
      <Head>
        <title>Error - Đã xảy ra lỗi!</title>
        <meta name="description" content="Có lỗi xảy ra trong quá trình xử lý yêu cầu của bạn. Vui lòng thử lại sau." />
      </Head>
      <div className="min-h-screen bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-gray-800/80 backdrop-blur-md p-12 rounded-lg shadow-lg max-w-lg w-full relative overflow-hidden"> {/* Added backdrop blur and overflow hidden */}
          <Image 
            src="/images/error-illustration.svg" // Thay bằng hình ảnh minh họa lỗi
            alt="Error Illustration"
            width={200}
            height={200}
            className="absolute top-0 right-0 -mt-20 -mr-20 opacity-30 animate-spin-slow" // Added animation and opacity
          />
          <h1 className="text-4xl font-bold text-white mb-4 relative z-10">Đã xảy ra lỗi!</h1> {/* Added z-index */}
          <p className="text-gray-400 mb-8 relative z-10">
            Có lỗi xảy ra trong quá trình xử lý yêu cầu của bạn. Vui lòng thử lại sau.
          </p>
          {/* Hiển thị chi tiết lỗi chỉ trong môi trường development */}
          {process.env.NODE_ENV === 'development' && (
            <pre className="text-xs text-red-400 bg-gray-900 p-4 rounded overflow-x-auto relative z-10">
              {error.message}
            </pre>
          )}
          <div className="flex gap-4 relative z-10">
            <button onClick={() => reset()} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded">
              Thử lại
            </button>
            <Link href="/" className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded">
              Về trang chủ
            </Link>
          </div>

          {/* Thêm animation lượn sóng */}
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-r from-indigo-700/50 to-pink-700/50 blur-2xl animate-wave"></div>
        </div>
      </div>
    </>
  );
}