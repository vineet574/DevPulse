import { io } from "socket.io-client"
import { useEffect, useState } from "react"
import axios from "axios"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"

const Dashboard = () => {

    const [logs, setLogs] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")

    const fetchLogs = async () => {

        const response = await axios.get(
            "http://localhost:5000/api/logs",
            {
                headers: {
                    authorization:
                        localStorage.getItem("token")
                }
            }
        )

        setLogs(response.data)

    }

    useEffect(() => {

        fetchLogs()

        const socket = io("http://localhost:5000")

        socket.on("new-log", (newLog) => {

            setLogs((prevLogs) => [newLog, ...prevLogs])

        })

        return () => {

            socket.disconnect()

        }

    }, [])

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">

            <div className="flex justify-between items-center mb-10">

                <h1 className="text-6xl font-bold text-cyan-400">
                    DevPulse Dashboard
                </h1>

                <button
                    onClick={() => {
                        localStorage.clear()
                        window.location.reload()
                    }}
                    className="bg-red-500 hover:bg-red-400 px-6 py-3 rounded-xl font-bold transition-all duration-300"
                >
                    Logout
                </button>

            </div>

            <input
                type="text"
                placeholder="Search endpoint..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-4 mb-8 rounded-2xl bg-slate-900 border border-cyan-500 text-white outline-none"
            />

            <div className="flex gap-4 mb-8">

                <button
                    onClick={() => setStatusFilter("ALL")}
                    className="bg-cyan-500 px-5 py-2 rounded-xl font-bold"
                >
                    ALL
                </button>

                <button
                    onClick={() => setStatusFilter("FAST")}
                    className="bg-green-500 px-5 py-2 rounded-xl font-bold"
                >
                    FAST
                </button>

                <button
                    onClick={() => setStatusFilter("SLOW")}
                    className="bg-red-500 px-5 py-2 rounded-xl font-bold"
                >
                    SLOW
                </button>

            </div>

            {
                logs.length > 0 && (

                    <div style={{ width: "100%", height: 300 }}>

                        <ResponsiveContainer>

                            <LineChart data={logs}>

                                <CartesianGrid strokeDasharray="3 3" />

                                <XAxis dataKey="method" />

                                <YAxis />

                                <Tooltip />

                                <Line
                                    type="monotone"
                                    dataKey="responseTime"
                                    stroke="#8884d8"
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    </div>

                )
            }

            {
                logs
                .filter((log: any) =>
                    log.endpoint
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )

                .filter((log: any) => {

                    if (statusFilter === "FAST") {
                        return log.responseTime <= 20
                    }

                    if (statusFilter === "SLOW") {
                        return log.responseTime > 20
                    }

                    return true

                })

                .map((log, index) => (

                    <div
                        key={index}
                        className={`p-6 rounded-2xl mb-6 border shadow-lg transition-all duration-300 hover:scale-[1.01]
                        ${
                            log.responseTime > 20
                            ? "bg-red-950 border-red-500"
                            : "bg-green-950 border-green-500"
                        }`}
                    >

                        <p className="text-lg">
                            <span className="font-bold text-cyan-400">
                                Endpoint:
                            </span>
                            {" "}
                            {log.endpoint}
                        </p>

                        <p className="text-lg">
                            <span className="font-bold text-cyan-400">
                                Method:
                            </span>
                            {" "}
                            {log.method}
                        </p>

                        <p className="text-lg">
                            <span className="font-bold text-cyan-400">
                                Status:
                            </span>
                            {" "}
                            {log.statusCode}
                        </p>

                        <p className="text-lg">
                            <span className="font-bold text-cyan-400">
                                Response Time:
                            </span>
                            {" "}
                            {log.responseTime} ms
                        </p>

                    </div>

                ))
            }

        </div>
    )
}

export default Dashboard