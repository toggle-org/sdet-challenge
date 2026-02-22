import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

type Tab = "account" | "subscriptions" | "payments";
type Plan = "1m" | "3m";

interface Subscription {
  id: string;
  status: string;
  expiredAt: string;
  planMonths?: number | null;
  priceCents?: number | null;
  paymentCardLast4?: string | null;
}

const VALID_CARD = "4242424242424242";
const INVALID_CARD = "4000000000000002";

const Home: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan>("1m");
  const [cardNumber, setCardNumber] = useState("");

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  const activeSubscription = useMemo(
    () =>
      subscriptions.find(
        (subscription) => subscription.status?.toLowerCase().trim() === "active"
      ),
    [subscriptions]
  );

  const canBuySubscription = !activeSubscription;

  const subscriptionWithPaymentMethod = useMemo(
    () => subscriptions.find((subscription) => subscription.paymentCardLast4),
    [subscriptions]
  );

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/subscriptions");
      setSubscriptions(response.data);
    } catch {
      toast.error("Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleBuySubscription = async () => {
    if (!canBuySubscription) {
      toast.error("You already have an active subscription");
      return;
    }

    if (cardNumber === INVALID_CARD) {
      toast.error("Card is invalid");
      return;
    }

    if (cardNumber !== VALID_CARD) {
      toast.error("Use hardcoded valid card number");
      return;
    }

    const planMonths = selectedPlan === "1m" ? 1 : 3;
    const priceCents = selectedPlan === "1m" ? 999 : 2499;

    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + planMonths);

    try {
      await axios.post("/subscriptions", {
        type: "web",
        status: "active",
        expiredAt: expirationDate.toISOString(),
        planMonths,
        priceCents,
        paymentCardLast4: cardNumber.slice(-4),
      });

      toast.success("Subscription purchased");
      setIsBuyModalOpen(false);
      setCardNumber("");
      await fetchSubscriptions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to buy subscription");
    }
  };

  const handleCancelSubscription = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to cancel subscription?");
    if (!confirmed) {
      return;
    }

    try {
      await axios.patch(`/subscriptions/${id}`, { status: "canceled" });
      toast.success("Subscription canceled");
      await fetchSubscriptions();
    } catch {
      toast.error("Failed to cancel subscription");
    }
  };

  const handleRemovePaymentMethod = async (id: string) => {
    try {
      await axios.delete(`/subscriptions/${id}/payment-method`);
      toast.success("Payment method removed");
      await fetchSubscriptions();
    } catch {
      toast.error("Failed to remove payment method");
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate("/signin", { replace: true });
  };

  const formatPrice = (priceCents?: number | null) => {
    if (!priceCents) {
      return "N/A";
    }
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const tabButtonClass = (tab: Tab) =>
    `w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      activeTab === tab
        ? "bg-indigo-600 text-white shadow"
        : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
    }`;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-indigo-600 shadow">
        <div className="w-full px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Account</h1>
            <p className="text-sm text-indigo-100">Manage your profile, subscription and payment method</p>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="w-full px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start w-full">
          <aside className="w-full bg-white rounded-2xl shadow border border-slate-200 p-3 min-h-[calc(100vh-170px)]">
            <div className="px-2 py-3 mb-3 border-b border-slate-200">
              <p className="text-xs uppercase tracking-wide text-slate-500">Signed in as</p>
              <p className="text-sm font-medium text-slate-900 mt-1 break-all">{user.email}</p>
            </div>
            <nav className="space-y-1.5">
              <button onClick={() => setActiveTab("account")} className={tabButtonClass("account")}>
                Account info
              </button>
              <button
                onClick={() => setActiveTab("subscriptions")}
                className={tabButtonClass("subscriptions")}
              >
                Subscriptions
              </button>
              <button onClick={() => setActiveTab("payments")} className={tabButtonClass("payments")}>
                Payment methods
              </button>
            </nav>
          </aside>

          <section className="w-full min-w-0 bg-white rounded-2xl shadow border border-slate-200 p-6 md:p-7 min-h-[calc(100vh-170px)]">
            {activeTab === "account" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900">Account info</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Name</p>
                    <p className="text-slate-900 font-medium mt-1">{user.name}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
                    <p className="text-slate-900 font-medium mt-1">{user.email}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">User ID</p>
                  <p className="text-sm text-slate-900 font-medium mt-1 break-all">{user.id}</p>
                </div>
              </div>
            )}

            {activeTab === "subscriptions" && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h2 className="text-xl font-semibold text-slate-900">Subscriptions</h2>
                  <div className="flex flex-col items-start sm:items-end gap-1">
                    <button
                      onClick={() => setIsBuyModalOpen(true)}
                      disabled={!canBuySubscription}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm border border-transparent"
                    >
                      Buy subscription
                    </button>
                    {!canBuySubscription && (
                      <p className="text-xs text-slate-500">Cancel active subscription to buy a new one</p>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
                    Loading...
                  </div>
                ) : subscriptions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <p className="text-slate-700">No subscriptions yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <div
                        key={subscription.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                            <p className="font-medium text-slate-900 mt-1">{subscription.status}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Plan</p>
                            <p className="font-medium text-slate-900 mt-1">
                              {subscription.planMonths ? `${subscription.planMonths} month(s)` : "N/A"}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Price</p>
                            <p className="font-medium text-slate-900 mt-1">{formatPrice(subscription.priceCents)}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Expires</p>
                            <p className="font-medium text-slate-900 mt-1">
                              {new Date(subscription.expiredAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {subscription.status?.toLowerCase().trim() === "active" && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <button
                              onClick={() => handleCancelSubscription(subscription.id)}
                              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                              Cancel subscription
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "payments" && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-slate-900">Payment methods</h2>
                {!subscriptionWithPaymentMethod ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8">
                    <p className="text-slate-700">No payment method saved.</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 p-5 bg-slate-50 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Card</p>
                      <p className="font-medium text-slate-900 mt-1">
                        **** **** **** {subscriptionWithPaymentMethod.paymentCardLast4}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemovePaymentMethod(subscriptionWithPaymentMethod.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Remove method
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {isBuyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/45 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">Buy subscription</h3>
            <p className="text-sm text-slate-600 mt-1">Choose plan and enter card number</p>

            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-2 border border-slate-200 rounded-xl p-3 hover:bg-slate-50">
                <input
                  type="radio"
                  name="plan"
                  checked={selectedPlan === "1m"}
                  onChange={() => setSelectedPlan("1m")}
                />
                <span className="text-sm text-slate-800">1 month subscription — $9.99</span>
              </label>
              <label className="flex items-center gap-2 border border-slate-200 rounded-xl p-3 hover:bg-slate-50">
                <input
                  type="radio"
                  name="plan"
                  checked={selectedPlan === "3m"}
                  onChange={() => setSelectedPlan("3m")}
                />
                <span className="text-sm text-slate-800">3 month subscription — $24.99</span>
              </label>
            </div>

            <div className="mt-4">
              <label className="block text-sm text-slate-700 mb-1">Card number</label>
              <input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ""))}
                placeholder="4242424242424242"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-slate-500 mt-2">Valid: {VALID_CARD} | Invalid: {INVALID_CARD}</p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsBuyModalOpen(false);
                  setCardNumber("");
                }}
                className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleBuySubscription}
                className="px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
              >
                Buy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
