// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <h1 className="text-4xl font-bold text-white mt-8">404: Không tìm thấy trang</h1>
        <p className="text-gray-400 mt-4">Rất tiếc, chúng tôi không thể tìm thấy trang này.</p>
        <Link href="/">
          Quay lại trang chủ
        </Link>
      </div>
  );
}


// export function metadata() {
//   return {
//     title: '404: Phim không được tìm thấy' + ' | ' + WEB_NAME,
//     description: 'Rất tiếc, chúng tôi không thể tìm thấy bộ phim này.',
//   };
// }