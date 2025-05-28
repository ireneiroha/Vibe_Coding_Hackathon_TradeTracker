import { useDashboardStats } from "@/hooks/use-transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart } from "@/components/charts";
import { ArrowUp, ArrowDown, PieChart, Receipt, ShoppingCart, Truck, CreditCard, Store } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/export";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 lg:px-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-20 mb-4" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Revenue',
        data: [1200, 800, 1500, 1100, 1800, 900, 1400],
        borderColor: 'hsl(152 60% 50%)',
        backgroundColor: 'hsla(152, 60%, 50%, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Expenses',
        data: [400, 300, 600, 450, 550, 350, 480],
        borderColor: 'hsl(0 84% 60%)',
        backgroundColor: 'hsla(0, 84%, 60%, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const getTransactionIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'sales':
      case 'product sales':
        return ShoppingCart;
      case 'shipping':
        return Truck;
      case 'services':
      case 'online payment':
        return CreditCard;
      case 'rent':
      case 'store rent':
        return Store;
      default:
        return Receipt;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Welcome back!</h1>
        <p className="text-gray-600">Here's your business overview for today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-app-secondary">
                  {formatCurrency(stats?.todayRevenue || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-app-secondary/10 rounded-lg flex items-center justify-center">
                <ArrowUp className="w-5 h-5 text-app-secondary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-app-secondary font-medium">+12.5%</span>
              <span className="text-gray-600 ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Expenses</p>
                <p className="text-2xl font-bold text-app-danger">
                  {formatCurrency(stats?.todayExpenses || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-app-danger/10 rounded-lg flex items-center justify-center">
                <ArrowDown className="w-5 h-5 text-app-danger" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-app-danger font-medium">+8.2%</span>
              <span className="text-gray-600 ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-app-secondary">
                  {formatCurrency(stats?.netProfit || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-app-accent/10 rounded-lg flex items-center justify-center">
                <PieChart className="w-5 h-5 text-app-accent" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-app-secondary font-medium">+15.3%</span>
              <span className="text-gray-600 ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats?.transactionCount || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-app-primary/10 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-app-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-app-secondary font-medium">+3</span>
              <span className="text-gray-600 ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue Overview</CardTitle>
              <Select defaultValue="7days">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <LineChart data={chartData} />
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Link href="/transactions">
                <Button variant="ghost" size="sm" className="text-app-primary">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentTransactions?.length ? (
                stats.recentTransactions.map((transaction) => {
                  const IconComponent = getTransactionIcon(transaction.category);
                  const isIncome = transaction.type === 'income';
                  
                  return (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isIncome ? 'bg-app-secondary/10' : 'bg-app-danger/10'
                        }`}>
                          <IconComponent className={`w-4 h-4 ${
                            isIncome ? 'text-app-secondary' : 'text-app-danger'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <span className={`font-semibold ${
                        isIncome ? 'text-app-secondary' : 'text-app-danger'
                      }`}>
                        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No transactions yet</p>
                  <Link href="/add-entry">
                    <Button size="sm" className="mt-2">Add your first transaction</Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
