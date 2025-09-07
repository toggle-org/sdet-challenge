import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

interface Subscription {
  id: string;
  type: "web" | "ios" | "android";
  status: string;
  expiredAt: string;
  createdAt: string;
}

const Home: React.FC = () => {
  const { user, signOut } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get("/subscriptions");
      setSubscriptions(response.data);
    } catch (error) {
      toast.error("Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "web":
        return "bg-blue-100 text-blue-800";
      case "ios":
        return "bg-green-100 text-green-800";
      case "android":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user.name}
              </h1>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Subscriptions List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Your Subscriptions
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {subscriptions.length} subscription(s) found
              </p>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading subscriptions...</div>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No subscriptions found.</div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {subscriptions.map((subscription) => (
                  <li key={subscription.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(
                            subscription.type
                          )}`}
                        >
                          {subscription.type.toUpperCase()}
                        </span>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            Status: {subscription.status}
                          </div>
                          <div className="text-sm text-gray-500">
                            Expires:{" "}
                            {new Date(
                              subscription.expiredAt
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Created:{" "}
                        {new Date(subscription.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
