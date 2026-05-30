import { io } from "socket.io-client"
import { useEffect, useState, useMemo } from "react"
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
    const [animatedTotal, setAnimatedTotal] = useState(0)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [backendStatus, setBackendStatus] =
        useState("Checking...")
    const [databaseStatus, setDatabaseStatus] =
        useState("Checking...")
    const [user, setUser] = useState<any>(null)
    const [lastUpdated, setLastUpdated] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [darkMode, setDarkMode] = useState(true)

    const logsPerPage = 10

    const totalPages = Math.ceil(
        logs.length / logsPerPage
    )

    const startIndex =
        (currentPage - 1) * logsPerPage

    const endIndex =
        startIndex + logsPerPage

    const slowestRequests = [...logs]
        .sort(
            (a, b) =>
                b.responseTime -
                a.responseTime
        )
        .slice(0, 5)

    const analytics = useMemo(() => {

        const totalRequests = logs.length

        const avgResponseTime =
            logs.length > 0
                ? Math.round(
                      logs.reduce(
                          (sum, log) =>
                              sum + log.responseTime,
                          0
                      ) / logs.length
                  )
                : 0

        const fastRequests =
            logs.filter(
                (log) => log.responseTime < 500
            ).length

        const slowRequests =
            logs.filter(
                (log) => log.responseTime >= 500
            ).length

        const successRequests =
            logs.filter(
                (log) => log.status >= 200 && log.status < 400
            ).length

        const clientErrors =
            logs.filter(
                (log) => log.status >= 400 && log.status < 500
            ).length

        const serverErrors =
            logs.filter(
                (log) => log.status >= 500
            ).length

        const errorRate =
            totalRequests > 0
                ? Math.round(
                      ((clientErrors + serverErrors) /
                          totalRequests) *
                          100
                  )
                : 0

        const fastestEndpoint =
            logs.length > 0
                ? logs.reduce((prev, curr) =>
                      prev.responseTime < curr.responseTime
                          ? prev
                          : curr
                  )
                : null

        const slowestEndpoint =
            logs.length > 0
                ? logs.reduce((prev, curr) =>
                      prev.responseTime > curr.responseTime
                          ? prev
                          : curr
                  )
                : null

        const endpointCount: Record<string, number> = {}

        logs.forEach((log) => {
            endpointCount[log.endpoint] =
                (endpointCount[log.endpoint] || 0) + 1
        })

        const mostUsedEndpoint =
            Object.keys(endpointCount).sort(
                (a, b) =>
                    endpointCount[b] -
                    endpointCount[a]
            )[0] || "N/A"

        const topEndpoints = Object.entries(endpointCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)

        return {
            totalRequests,
            avgResponseTime,
            fastRequests,
            slowRequests,
            successRequests,
            clientErrors,
            serverErrors,
            errorRate,
            fastestEndpoint,
            slowestEndpoint,
            mostUsedEndpoint,
            topEndpoints
        }

    }, [logs])

    const fetchLogs = async () => {

        try {

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

            setLastUpdated(
                new Date().toLocaleTimeString()
            )

        } catch (error) {

            console.log(error)

        }

    }

    useEffect(() => {

        fetchLogs()

        const interval = setInterval(() => {
            fetchLogs()
        }, 5000)

        const savedUser = localStorage.getItem("user")

        if (savedUser) {
            setUser(JSON.parse(savedUser))
        }

        axios
            .get("http://localhost:5000")
            .then((response) => {

                setBackendStatus(
                    response.data.backend === "online"
                        ? "Online"
                        : "Offline"
                )

                setDatabaseStatus(
                    response.data.database === "connected"
                        ? "Connected"
                        : "Disconnected"
                )

            })
            .catch(() => {

                setBackendStatus("Offline")
                setDatabaseStatus("Disconnected")

            })

        const socket = io("http://localhost:5000")

        socket.on("new-log", (newLog) => {

            setLogs((prevLogs) => [newLog, ...prevLogs])

        })

        return () => {

            socket.disconnect()
            clearInterval(interval)

        }

    }, [])

    useEffect(() => {

        let current = 0

        const interval = setInterval(() => {

            if (current >= analytics.totalRequests) {

                clearInterval(interval)

            } else {

                current++

                setAnimatedTotal(current)

            }

        }, 30)

        return () => clearInterval(interval)

    }, [analytics.totalRequests])

    const exportJSON = () => {

        const dataStr = JSON.stringify(
            logs,
            null,
            2
        )

        const blob = new Blob(
            [dataStr],
            {
                type: "application/json"
            }
        )

        const url =
            window.URL.createObjectURL(blob)

        const a =
            document.createElement("a")

        a.href = url
        a.download = "devpulse-logs.json"

        a.click()

        window.URL.revokeObjectURL(url)

    }

    const exportCSV = () => {

        const headers =
            "Endpoint,Method,Status,ResponseTime\n"

        const rows = logs
            .map(
                (log) =>
                    `${log.endpoint},${log.method},${log.status},${log.responseTime}`
            )
            .join("\n")

        const csv =
            headers + rows

        const blob = new Blob(
            [csv],
            {
                type: "text/csv"
            }
        )

        const url =
            window.URL.createObjectURL(blob)

        const a =
            document.createElement("a")

        a.href = url
        a.download = "devpulse-logs.csv"

        a.click()

        window.URL.revokeObjectURL(url)

    }

    return (
        <div
            className={`min-h-screen p-8 ${
                darkMode
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-black"
            }`}
        >

            <div className="flex justify-between items-center mb-10">

                <h1 className="text-6xl font-bold text-cyan-400">
                    DevPulse Dashboard
                </h1>

                <div className="flex gap-4">

                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-xl font-bold transition-all duration-300"
                    >
                        {darkMode ? "☀️ Light" : "🌙 Dark"}
                    </button>

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

            </div>

            <input
                type="text"
                placeholder="Search endpoint..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-4 mb-8 rounded-2xl bg-slate-900 border border-cyan-500 text-white outline-none"
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">

                <div className="bg-slate-900 border border-cyan-500 rounded-2xl p-5">
                    <h3 className="text-slate-400 text-sm">
                        Total Requests
                    </h3>
                    <p className="text-cyan-400 text-3xl font-bold mt-2">
                        {animatedTotal}
                    </p>
                </div>

                <div className="bg-slate-900 border border-cyan-500 rounded-2xl p-5">
                    <h3 className="text-slate-400 text-sm">
                        Avg Response Time
                    </h3>
                    <p className="text-cyan-400 text-3xl font-bold mt-2">
                        {analytics.avgResponseTime} ms
                    </p>
                </div>

                <div className="bg-slate-900 border border-green-500 rounded-2xl p-5">
                    <h3 className="text-slate-400 text-sm">
                        Fast Requests
                    </h3>
                    <p className="text-green-400 text-3xl font-bold mt-2">
                        {analytics.fastRequests}
                    </p>
                </div>

                <div className="bg-slate-900 border border-red-500 rounded-2xl p-5">
                    <h3 className="text-slate-400 text-sm">
                        Slow Requests
                    </h3>
                    <p className="text-red-400 text-3xl font-bold mt-2">
                        {analytics.slowRequests}
                    </p>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

                <div className="bg-slate-900 border border-green-500 rounded-2xl p-5">
                    <h3 className="text-slate-400 text-sm">
                        Success Requests
                    </h3>
                    <p className="text-green-400 text-3xl font-bold mt-2">
                        {analytics.successRequests}
                    </p>
                </div>

                <div className="bg-slate-900 border border-yellow-500 rounded-2xl p-5">
                    <h3 className="text-slate-400 text-sm">
                        4xx Errors
                    </h3>
                    <p className="text-yellow-400 text-3xl font-bold mt-2">
                        {analytics.clientErrors}
                    </p>
                </div>

                <div className="bg-slate-900 border border-red-500 rounded-2xl p-5">
                    <h3 className="text-slate-400 text-sm">
                        5xx Errors
                    </h3>
                    <p className="text-red-400 text-3xl font-bold mt-2">
                        {analytics.serverErrors}
                    </p>
                </div>

                <div className="bg-slate-900 border border-purple-500 rounded-2xl p-5">
                    <h3 className="text-slate-400 text-sm">
                        Error Rate
                    </h3>
                    <p className="text-purple-400 text-3xl font-bold mt-2">
                        {analytics.errorRate}%
                    </p>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                <div className="bg-slate-900 border border-cyan-500 rounded-2xl p-5">
                    <h3 className="text-slate-400 text-sm">
                        Fastest Endpoint
                    </h3>
                    <p className="text-cyan-400 text-lg font-bold mt-2 break-all">
                        {analytics.fastestEndpoint?.endpoint || "N/A"}
                    </p>
                </div>

                <div className="bg-slate-900 border border-red-500 rounded-2xl p-5">
                    <h3 className="text-slate-400 text-sm">
                        Slowest Endpoint
                    </h3>
                    <p className="text-red-400 text-lg font-bold mt-2 break-all">
                        {analytics.slowestEndpoint?.endpoint || "N/A"}
                    </p>
                </div>

                <div className="bg-slate-900 border border-purple-500 rounded-2xl p-5">
                    <h3 className="text-slate-400 text-sm">
                        Most Used Endpoint
                    </h3>
                    <p className="text-purple-400 text-lg font-bold mt-2 break-all">
                        {analytics.mostUsedEndpoint}
                    </p>
                </div>

            </div>

            <div className="bg-slate-900 border border-cyan-500 rounded-2xl p-6 mb-6">

                <p className="text-slate-400">
                    Last Updated
                </p>

                <h2 className="text-3xl font-bold text-cyan-400">
                    {lastUpdated || "Waiting..."}
                </h2>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                <div className="bg-slate-900 border border-green-500 rounded-2xl p-5">

                    <h3 className="text-slate-400 text-sm">
                        Backend Status
                    </h3>

                    <p className="text-green-400 text-2xl font-bold mt-2">
                        {backendStatus}
                    </p>

                </div>

                <div className="bg-slate-900 border border-cyan-500 rounded-2xl p-5">

                    <h3 className="text-slate-400 text-sm">
                        Database Status
                    </h3>

                    <p className="text-cyan-400 text-2xl font-bold mt-2">
                        {databaseStatus}
                    </p>

                </div>

            </div>

            <div className="bg-slate-900 border border-cyan-500 rounded-2xl p-5 mb-6">

                <h2 className="text-cyan-400 text-2xl font-bold mb-3">
                    User Profile
                </h2>

                <p>
                    <span className="text-cyan-400 font-bold">
                        Name:
                    </span>
                    {" "}
                    {user?.name || "Unknown"}
                </p>

                <p>
                    <span className="text-cyan-400 font-bold">
                        Email:
                    </span>
                    {" "}
                    {user?.email || "Unknown"}
                </p>

            </div>

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

            <div className="flex gap-4 mt-4 mb-6">

                <button
                    onClick={exportJSON}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-xl font-bold"
                >
                    Export JSON
                </button>

                <button
                    onClick={exportCSV}
                    className="bg-green-600 hover:bg-green-500 text-white px-5 py-3 rounded-xl font-bold"
                >
                    Export CSV
                </button>

            </div>

            <div className="bg-slate-900 border border-cyan-500 rounded-2xl p-6 mb-8">

                <h2 className="text-2xl font-bold text-cyan-400 mb-4">
                    Top Endpoints Leaderboard
                </h2>

                {
                    analytics.topEndpoints.map(
                        ([endpoint, count], index) => (

                            <div
                                key={index}
                                className="flex justify-between items-center border-b border-slate-700 py-3"
                            >
                                <span className="text-white break-all">
                                    {endpoint}
                                </span>

                                <span className="text-cyan-400 font-bold">
                                    {count} Hits
                                </span>

                            </div>

                        )
                    )
                }

            </div>

            {
                logs.length > 0 && (

                    <div className="bg-slate-900 border border-cyan-500 rounded-2xl p-6 mb-8">

                        <h2 className="text-2xl font-bold text-cyan-400 mb-4">
                            Response Time Trends
                        </h2>

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

                    </div>

                )
            }

            <div className="bg-slate-900 border border-red-500 rounded-2xl p-6 mb-8">

                <h2 className="text-2xl font-bold text-red-400 mb-4">
                    Top 5 Slowest Requests
                </h2>

                <div className="space-y-3">

                    {slowestRequests.map((log, index) => (

                        <div
                            key={index}
                            className="flex justify-between border-b border-slate-700 pb-2"
                        >

                            <span className="text-cyan-400">
                                {log.endpoint}
                            </span>

                            <span className="text-red-400 font-bold">
                                {log.responseTime} ms
                            </span>

                        </div>

                    ))}

                </div>

            </div>

            <div className="bg-slate-900 border border-cyan-500 rounded-2xl p-6 mb-6">

                <h2 className="text-2xl font-bold text-cyan-400 mb-4">
                    Request History
                </h2>

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead>

                            <tr className="border-b border-slate-700">

                                <th className="text-left p-3">Endpoint</th>
                                <th className="text-left p-3">Method</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-left p-3">Response Time</th>
                                <th className="text-left p-3">Time</th>

                            </tr>

                        </thead>

                        <tbody>

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

                                .slice(startIndex, endIndex)

                                .map((log: any, index: number) => (

                                    <tr
                                        key={index}
                                        className="border-b border-slate-800"
                                    >

                                        <td className="p-3">
                                            {log.endpoint}
                                        </td>

                                        <td className="p-3">

                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-bold ${
                                                    log.method === "GET"
                                                        ? "bg-green-500 text-black"
                                                        : log.method === "POST"
                                                        ? "bg-blue-500 text-white"
                                                        : log.method === "PUT"
                                                        ? "bg-yellow-500 text-black"
                                                        : "bg-red-500 text-white"
                                                }`}
                                            >
                                                {log.method}
                                            </span>

                                        </td>

                                        <td className="p-3">

                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-bold ${
                                                    log.statusCode >= 500
                                                        ? "bg-red-500 text-white"
                                                        : log.statusCode >= 400
                                                        ? "bg-yellow-500 text-black"
                                                        : "bg-green-500 text-black"
                                                }`}
                                            >
                                                {log.statusCode}
                                            </span>

                                        </td>

                                        <td className="p-3">

                                            <span
                                                className={`font-bold ${
                                                    log.responseTime > 1000
                                                        ? "text-red-400"
                                                        : log.responseTime > 500
                                                        ? "text-yellow-400"
                                                        : "text-green-400"
                                                }`}
                                            >
                                                {log.responseTime} ms
                                            </span>

                                        </td>

                                        <td className="p-3">
                                            {new Date(log.createdAt).toLocaleTimeString()}
                                        </td>

                                    </tr>

                                ))
                        }

                        </tbody>

                    </table>

                </div>

                <div className="flex justify-center gap-4 mt-6">

                    <button
                        disabled={currentPage === 1}
                        onClick={() =>
                            setCurrentPage(currentPage - 1)
                        }
                        className="bg-cyan-500 text-black px-4 py-2 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <span className="text-cyan-400 font-bold flex items-center">
                        Page {currentPage} of {totalPages || 1}
                    </span>

                    <button
                        disabled={
                            currentPage >= totalPages
                        }
                        onClick={() =>
                            setCurrentPage(currentPage + 1)
                        }
                        className="bg-cyan-500 text-black px-4 py-2 rounded disabled:opacity-50"
                    >
                        Next
                    </button>

                </div>

            </div>

            {/* Old log cards removed - using Request History Table */}

        </div>
    )
}

export default Dashboard