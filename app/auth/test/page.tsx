import AuthTest from "../../components/AuthTest"

export default function AuthTestPage() {
  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Authentication Test</h1>
        <AuthTest />
      </div>
    </div>
  )
}
