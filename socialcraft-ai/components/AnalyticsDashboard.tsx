
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Spinner from './Spinner'; // Assuming a spinner component exists

// Define a type for our analytics data structure
interface AnalyticsData {
    engagementData: { name: string; Engagement: number; Reach: number; Clicks: number; }[];
    platformData: { name: string; Engagement: number; }[];
    demographicsData: { name: string; value: number; }[];
}

const COLORS = ['#8B9A8B', '#C4A484', '#A8B8C8', '#d1bda9'];

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="glass-card rounded-lg p-6 shadow-lg h-96 flex flex-col">
        <h3 className="text-lg font-semibold text-deep-charcoal mb-4">{title}</h3>
        <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
                {children}
            </ResponsiveContainer>
        </div>
    </div>
);

const AnalyticsDashboard: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                // In a real app, the token would be stored securely (e.g., in an HttpOnly cookie or secure storage)
                const token = localStorage.getItem('socialcraft_token');
                
                if (!token) {
                  // For this demo, we'll proceed with mock data if no token is found.
                  // In a real app, you would throw an error.
                  console.warn("No auth token found. Using mock data for analytics.");
                }
                
                // The URL points to the backend server.
                // During development, this would be 'http://localhost:3001/api/analytics'
                // A proxy would be set up in a real project to avoid CORS issues.
                const response = await fetch('/api/analytics', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Authentication failed. Your session may have expired.');
                    }
                    if (response.status >= 500) {
                        throw new Error('A server error occurred while fetching analytics. Please try again later.');
                    }
                    throw new Error(`Failed to fetch analytics data (Error: ${response.status}).`);
                }

                const fetchedData: AnalyticsData = await response.json();
                setData(fetchedData);
            } catch (err) {
                 if (err instanceof TypeError) { // Catches network errors from fetch itself
                    setError('Could not connect to the server. Please check your network connection or if the backend is running.');
                } else {
                    setError(err instanceof Error ? err.message : 'An unknown error occurred.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalyticsData();
    }, []); // Empty dependency array means this runs once on component mount

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Spinner />
                <span className="ml-4 text-lg text-gray-600">Loading Live Analytics Data...</span>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="text-center py-12 text-red-500 bg-red-50 rounded-lg">
                <h2 className="text-xl font-semibold">Could not load analytics.</h2>
                <p className="mt-2">{error}</p>
                 <p className="mt-4 text-xs text-gray-500">Note: This feature requires a running backend server and a valid login session.</p>
            </div>
        );
    }

    if (!data) {
        return <div className="text-center py-12 text-gray-500">No analytics data available.</div>;
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    Analytics <span className="gradient-text-emerald">Dashboard</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                    Visualize your content's performance with live data from your connected accounts.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard title="Engagement Trends">
                    <LineChart data={data.engagementData} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }} />
                        <Legend wrapperStyle={{ bottom: 0, left: 20 }}/>
                        <Line type="monotone" dataKey="Engagement" stroke="#C4A484" strokeWidth={2} />
                        <Line type="monotone" dataKey="Reach" stroke="#8B9A8B" strokeWidth={2}/>
                        <Line type="monotone" dataKey="Clicks" stroke="#A8B8C8" strokeWidth={2}/>
                    </LineChart>
                </ChartCard>
                 <ChartCard title="Performance by Platform">
                    <BarChart data={data.platformData} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }} cursor={{fill: 'rgba(139, 154, 139, 0.1)'}} />
                        <Legend wrapperStyle={{ bottom: 0, left: 20 }}/>
                        <Bar dataKey="Engagement" fill="#8B9A8B" />
                    </BarChart>
                </ChartCard>
                 <ChartCard title="Audience Demographics">
                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 40 }}>
                        <Pie
                            data={data.demographicsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {data.demographicsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }} />
                        <Legend wrapperStyle={{ bottom: 0 }}/>
                    </PieChart>
                </ChartCard>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
