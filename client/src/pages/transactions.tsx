import { useState } from "react";
import { useTransactions, useDeleteTransaction } from "@/hooks/use-transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate, downloadCSV } from "@/lib/export";
import { Search, Download, Edit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Transactions() {
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    category: "",
  });
  
  const { data: transactions = [], isLoading } = useTransactions(filters);
  const deleteTransaction = useDeleteTransaction();
  const { toast } = useToast();

  const handleExport = () => {
    if (transactions.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no transactions to export",
        variant: "destructive",
      });
      return;
    }

    const exportData = transactions.map(t => ({
      Date: t.date,
      Description: t.description,
      Category: t.category,
      Type: t.type,
      Amount: t.amount,
    }));

    downloadCSV(exportData, 'transactions.csv');
    toast({
      title: "Export successful",
      description: "Transactions have been exported to CSV",
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTransaction.mutateAsync(id);
      toast({
        title: "Transaction deleted",
        description: "The transaction has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      sales: "bg-blue-100 text-blue-800",
      shipping: "bg-amber-100 text-amber-800",
      marketing: "bg-purple-100 text-purple-800",
      rent: "bg-red-100 text-red-800",
      utilities: "bg-gray-100 text-gray-800",
      inventory: "bg-green-100 text-green-800",
      services: "bg-indigo-100 text-indigo-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getTypeBadgeColor = (type: string) => {
    return type === "income" 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800";
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b last:border-b-0">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Transactions</h2>
        
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    className="pl-10"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters({ ...filters, type: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income Only</SelectItem>
                  <SelectItem value="expense">Expenses Only</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="sales">Product Sales</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {transactions.length} transactions
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="text-app-primary"
              >
                <Download className="w-4 h-4 mr-1" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Description</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Category</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Type</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">Amount</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getCategoryBadgeColor(transaction.category)}>
                        {transaction.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getTypeBadgeColor(transaction.type)}>
                        {transaction.type}
                      </Badge>
                    </td>
                    <td className={`px-6 py-4 text-right text-sm font-semibold ${
                      transaction.type === 'income' ? 'text-app-secondary' : 'text-app-danger'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-app-danger" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this transaction? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(transaction.id)}
                                className="bg-app-danger hover:bg-app-danger/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="space-y-2">
                      <Search className="w-12 h-12 mx-auto opacity-50" />
                      <p>No transactions found</p>
                      <p className="text-sm">Try adjusting your search filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div key={transaction.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">
                    {transaction.description}
                  </span>
                  <span className={`text-lg font-semibold ${
                    transaction.type === 'income' ? 'text-app-secondary' : 'text-app-danger'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryBadgeColor(transaction.category)}>
                      {transaction.category}
                    </Badge>
                    <Badge className={getTypeBadgeColor(transaction.type)}>
                      {transaction.type}
                    </Badge>
                  </div>
                  <span>{formatDate(transaction.date)}</span>
                </div>
                <div className="flex items-center justify-end mt-3 space-x-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-app-danger" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this transaction? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(transaction.id)}
                          className="bg-app-danger hover:bg-app-danger/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No transactions found</p>
              <p className="text-sm">Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
