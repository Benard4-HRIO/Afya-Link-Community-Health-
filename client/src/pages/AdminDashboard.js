import React from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { FaUsers, FaHospital, FaBook, FaComments } from "react-icons/fa";

const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white shadow-md rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg transition-shadow duration-300">
    <div className={`w-12 h-12 ${color} text-white rounded-xl flex items-center justify-center text-xl`}>
      <Icon />
    </div>
    <div>
      <h4 className="text-sm text-gray-500 font-medium">{title}</h4>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { data, isLoading } = useQuery("admin-dashboard", async () => (await axios.get("/api/admin/dashboard")).data);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500 text-lg">Loading Dashboard...</div>
      </div>
    );

  const { users, services, content, chat, recent } = data || {};

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Page Title */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of users, content, and activity</p>
      </header>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={FaUsers} title="Total Users" value={users?.total || 0} color="bg-blue-600" />
        <StatCard icon={FaHospital} title="Health Services" value={services?.total || 0} color="bg-green-600" />
        <StatCard icon={FaBook} title="Published Content" value={content?.published || 0} color="bg-purple-600" />
        <StatCard icon={FaComments} title="Active Sessions" value={chat?.active || 0} color="bg-orange-500" />
      </section>

      {/* Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="border-b p-4 flex items-center justify-between">
            <h3 className="font-semibold text-lg text-gray-800">Recent Users</h3>
          </div>
          <div className="p-4 divide-y">
            {(recent?.users || []).length ? (
              recent.users.map((u) => (
                <div key={u.id} className="py-3">
                  <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                  <p className="text-gray-500 text-sm">{u.email}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No recent users</p>
            )}
          </div>
        </div>

        {/* Recent Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="border-b p-4 flex items-center justify-between">
            <h3 className="font-semibold text-lg text-gray-800">Recent Content</h3>
          </div>
          <div className="p-4 divide-y">
            {(recent?.content || []).length ? (
              recent.content.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{c.title}</p>
                    <p className="text-gray-500 text-sm">{c.category}</p>
                  </div>
                  <a
                    href={`/api/education/content/${c.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View
                  </a>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No recent content</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;




