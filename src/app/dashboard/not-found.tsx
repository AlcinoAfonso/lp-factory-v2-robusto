import Link from 'next/link';

export default function DashboardNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard não encontrado
        </h1>
        <p className="text-gray-600 mb-8">
          O cliente especificado não existe ou você não tem permissão para acessá-lo.
        </p>
        <Link
          href="/dashboard/login"
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Voltar ao Login
        </Link>
      </div>
    </div>
  );
}
