import { useState } from "react"
import axios from "axios"
import { GoogleLogin } from "@react-oauth/google"

const Login = () => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async () => {

        try {

            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                {
                    email,
                    password
                }
            )

            localStorage.setItem(
                "token",
                response.data.token
            )

            window.location.reload()

        } catch (error) {

            alert("Login Failed")

        }

    }

    return (

        <div className="min-h-screen bg-slate-950 flex items-center justify-center">

            <div className="bg-slate-900 p-10 rounded-3xl shadow-2xl w-[400px] border border-cyan-500">

                <h1 className="text-5xl font-bold text-cyan-400 text-center mb-8">
                    DevPulse Login
                </h1>

                <div className="flex flex-col gap-5">

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-4 rounded-xl bg-slate-800 text-white border border-slate-700 outline-none focus:border-cyan-400"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-4 rounded-xl bg-slate-800 text-white border border-slate-700 outline-none focus:border-cyan-400"
                    />

                    <GoogleLogin
                        onSuccess={(credentialResponse) => {

                            localStorage.setItem(
                                "token",
                                credentialResponse.credential || ""
                            )

                            alert("Google Login Success")

                            window.location.reload()

                        }}

                        onError={() => {
                            alert("Google Login Failed")
                        }}
                    />

                    <button
                        onClick={handleLogin}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold p-4 rounded-xl transition-all duration-300"
                    >
                        Login
                    </button>

                </div>

            </div>

        </div>

    )

}

export default Login