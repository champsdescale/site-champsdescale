import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#EDE6D3]">
      <form action={login} className="bg-white/60 p-8 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-[#3B2F23]">Connexion à l&apos;espace de gestion</h1>
        {error && <p className="text-red-700 text-sm">{error}</p>}
        <div>
          <label className="block text-sm mb-1" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="w-full border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" required className="w-full border px-3 py-2" />
        </div>
        <button type="submit" className="bg-[#3B2F23] text-[#EDE6D3] px-4 py-2 w-full">
          Se connecter
        </button>
      </form>
    </main>
  )
}
