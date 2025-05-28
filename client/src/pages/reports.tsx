import { useState } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, DoughnutChart } from "@/components/charts";
import { formatCurrency, downloadCSV } from "@/lib/export";
import { FileText, Download, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    to: new Date().toISOString().split('T')[0], // today
  });
  const [reportType, setReportType] = useState("profit-loss");

  const { data: transactions = [] } = useTransactions();
  const { toast } = useToast();

  // Filter transactions by date range
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    return transactionDate >= fromDate && transactionDate <= toDate;
  });

  // Calculate metrics
  const totalRevenue = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const netProfit = totalRevenue - totalExpenses;

  // Prepare chart data
  const monthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const profitData = [2500, 3200, 2800, 3800, 4200, 3600];
    const lossData = [-800, -1200, -600, -900, -1100, -750];

    return {
      labels: months,
      datasets: [
        {
          label: 'Profit',
          data: profitData,
          backgroundColor: 'hsl(152 60% 50%)',
        },
        {
          label: 'Loss',
          data: lossData,
          backgroundColor: 'hsl(0 84% 60%)',
        },
      ],
    };
  };

  const categoryData = () => {
    const categoryTotals: Record<string, number> = {};
    
    filteredTransactions.forEach(t => {
      if (!categoryTotals[t.category]) {
        categoryTotals[t.category] = 0;
      }
      categoryTotals[t.category] += parseFloat(t.amount);
    });

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);
    
    const colors = [
      'hsl(152 60% 50%)',
      'hsl(35 91% 51%)',
      'hsl(262 51% 60%)',
      'hsl(0 84% 60%)',
      'hsl(215 16% 47%)',
    ];

    return {
      labels: categories,
      datasets: [
        {
          data: amounts,
          backgroundColor: colors.slice(0, categories.length),
        },
      ],
    };
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no transactions in the selected date range",
        variant: "destructive",
      });
      return;
    }

    const exportData = filteredTransactions.map(t => ({
      Date: t.date,
      Description: t.description,
      Category: t.category,
      Type: t.type,
      Amount: t.amount,
    }));

    downloadCSV(exportData, `report-${dateRange.from}-${dateRange.to}.csv`);
    toast({
      title: "Export successful",
      description: "Report has been exported to CSV",
    });
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print dialog opened",
      description: "Use your browser's print function to print the report",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Reports & Analytics</h2>
        
        {/* Report Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="from-date">From Date</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="to-date">To Date</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profit-loss">Profit & Loss</SelectItem>
                    <SelectItem value="category-breakdown">Category Breakdown</SelectItem>
                    <SelectItem value="monthly-summary">Monthly Summary</SelectItem>
                    <SelectItem value="trend-analysis">Trend Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-app-primary hover:bg-app-primary/90">
                  Generate Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Profit & Loss Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Profit & Loss Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <BarChart data={monthlyData()} />
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {filteredTransactions.length > 0 ? (
                <DoughnutChart data={categoryData()} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No data for selected period</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Period Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-app-secondary mb-2">
                {formatCurrency(totalRevenue)}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-xs text-app-secondary mt-1">
                {filteredTransactions.filter(t => t.type === 'income').length} transactions
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-app-danger mb-2">
                {formatCurrency(totalExpenses)}
              </div>
              <div className="text-sm text-gray-600">Total Expenses</div>
              <div className="text-xs text-app-danger mt-1">
                {filteredTransactions.filter(t => t.type === 'expense').length} transactions
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                netProfit >= 0 ? 'text-app-secondary' : 'text-app-danger'
              }`}>
                {formatCurrency(netProfit)}
              </div>
              <div className="text-sm text-gray-600">Net Profit</div>
              <div className={`text-xs mt-1 ${
                netProfit >= 0 ? 'text-app-secondary' : 'text-app-danger'
              }`}>
                {((netProfit / totalRevenue) * 100 || 0).toFixed(1)}% margin
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="flex items-center justify-center space-x-2"
              onClick={handleExportCSV}
            >
              <Download className="w-4 h-4 text-app-secondary" />
              <span>Export CSV</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center justify-center space-x-2"
              onClick={() => toast({
                title: "PDF Export",
                description: "PDF export functionality would be implemented here",
              })}
            >
              <FileText className="w-4 h-4 text-app-danger" />
              <span>Export PDF</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center justify-center space-x-2"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 text-gray-600" />
              <span>Print Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
