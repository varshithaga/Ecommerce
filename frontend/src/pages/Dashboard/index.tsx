import { useEffect, useState } from 'react';
import { createApiUrl, getAuthHeaders } from '../../access/access.ts';
import { DollarSign, ShoppingBag, Package, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  total_sales: number;
  total_orders: number;
  recent_orders: any[];
  status_counts: Record<string, number>;
}

export default function MasterDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(createApiUrl('api/orders/dashboard_stats/'), {
          headers: headers
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: "Total Revenue",
      val: `$${parseFloat(stats.total_sales.toString()).toFixed(2)}`,
      icon: <DollarSign className="w-6 h-6 text-brand-500" />,
      trend: "+12.5%",
      color: "bg-brand-50 dark:bg-brand-500/10"
    },
    {
      title: "Total Orders",
      val: stats.total_orders,
      icon: <ShoppingBag className="w-6 h-6 text-blue-500" />,
      trend: "+5.2%",
      color: "bg-blue-50 dark:bg-blue-500/10"
    },
    {
      title: "Pending Orders",
      val: stats.status_counts['Pending'] || 0,
      icon: <Clock className="w-6 h-6 text-orange-500" />,
      trend: "-2.1%",
      color: "bg-orange-50 dark:bg-orange-500/10"
    },
    {
      title: "Delivered",
      val: stats.status_counts['Delivered'] || 0,
      icon: <Package className="w-6 h-6 text-success-500" />,
      trend: "+18.2%",
      color: "bg-success-50 dark:bg-success-500/10"
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            Store <span className="text-brand-500">Overview</span>
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-1">Here's what's happening with your store today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${card.trend.startsWith('+') ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400' : 'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400'}`}>
                {card.trend}
              </span>
            </div>
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{card.title}</h3>
            <p className="text-3xl font-black text-gray-900 dark:text-white mt-2 tracking-tight">{card.val}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-brand-500" />
            Recent Orders
          </h2>
          <Link to="/master/orders" className="text-xs font-black uppercase tracking-widest text-brand-500 hover:text-brand-600 transition-colors">
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Order ID</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {stats.recent_orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-sm font-bold text-gray-400">No recent orders found.</td>
                </tr>
              ) : (
                stats.recent_orders.map((order, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-8 py-5 font-black text-gray-900 dark:text-white text-sm">#{order.order_id.slice(0, 8)}...</td>
                    <td className="px-8 py-5 font-black text-sm uppercase">{order.customer_name}</td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400'
                        : order.status === 'Cancelled' ? 'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400'
                          : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                        }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-brand-500 text-sm">${order.total_amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
