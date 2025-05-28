import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { voiceInput } from "@/lib/voice";
import { Camera, Mic, MicOff, Plus, Minus } from "lucide-react";
import { useLocation } from "wouter";

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Amount must be a positive number"
  ),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function AddEntry() {
  const [, setLocation] = useLocation();
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const createTransaction = useCreateTransaction();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "income",
      amount: "",
      description: "",
      category: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

  const entryType = form.watch("type");

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = async () => {
    if (!voiceInput.isSupported()) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice input",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      voiceInput.stopListening();
      setIsListening(false);
      return;
    }

    try {
      setIsListening(true);
      await voiceInput.startListening(
        (text) => {
          form.setValue("description", text);
          setIsListening(false);
          toast({
            title: "Voice input successful",
            description: "Description has been updated with your voice input",
          });
        },
        (error) => {
          setIsListening(false);
          toast({
            title: "Voice input failed",
            description: error,
            variant: "destructive",
          });
        }
      );
    } catch (error) {
      setIsListening(false);
      toast({
        title: "Voice input failed",
        description: "Failed to start voice recognition",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await createTransaction.mutateAsync({
        ...data,
        amount: data.amount,
        photo: selectedPhoto || undefined,
      });

      toast({
        title: "Transaction saved",
        description: "Your transaction has been saved successfully",
      });

      // Reset form
      form.reset();
      setSelectedPhoto(null);
      setPhotoPreview(null);
      
      // Navigate to dashboard
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save transaction",
        variant: "destructive",
      });
    }
  };

  const incomeCategories = [
    { value: "sales", label: "Product Sales" },
    { value: "services", label: "Services" },
    { value: "refunds", label: "Refunds Received" },
    { value: "other-income", label: "Other Income" },
  ];

  const expenseCategories = [
    { value: "inventory", label: "Inventory" },
    { value: "shipping", label: "Shipping" },
    { value: "marketing", label: "Marketing" },
    { value: "rent", label: "Rent" },
    { value: "utilities", label: "Utilities" },
    { value: "other-expense", label: "Other Expense" },
  ];

  const categories = entryType === "income" ? incomeCategories : expenseCategories;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Add New Entry</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Entry Type Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <Button
              type="button"
              variant={entryType === "income" ? "default" : "ghost"}
              className={`flex-1 ${entryType === "income" 
                ? "bg-app-secondary text-white hover:bg-app-secondary/90" 
                : "text-gray-600"
              }`}
              onClick={() => {
                form.setValue("type", "income");
                form.setValue("category", ""); // Reset category when changing type
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Income
            </Button>
            <Button
              type="button"
              variant={entryType === "expense" ? "default" : "ghost"}
              className={`flex-1 ${entryType === "expense" 
                ? "bg-app-danger text-white hover:bg-app-danger/90" 
                : "text-gray-600"
              }`}
              onClick={() => {
                form.setValue("type", "expense");
                form.setValue("category", ""); // Reset category when changing type
              }}
            >
              <Minus className="w-4 h-4 mr-2" />
              Expense
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-10 text-lg"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description with Voice Input */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="Enter description..."
                          className="pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2"
                          onClick={handleVoiceInput}
                          disabled={createTransaction.isPending}
                        >
                          {isListening ? (
                            <MicOff className="w-4 h-4 text-app-danger" />
                          ) : (
                            <Mic className="w-4 h-4 text-app-primary" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <p className="text-sm text-gray-500">
                      <Mic className="w-3 h-3 inline text-app-primary mr-1" />
                      Tap the microphone to use voice input
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Photo Upload */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Receipt Photo (Optional)
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-app-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handlePhotoSelect}
                  />
                  {photoPreview ? (
                    <div className="space-y-4">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="max-w-full h-32 object-cover mx-auto rounded-lg"
                      />
                      <div className="flex gap-2 justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change Photo
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPhoto(null);
                            setPhotoPreview(null);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Camera className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">Take Photo or Upload</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form Actions */}
              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setLocation("/")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-app-primary hover:bg-app-primary/90"
                  disabled={createTransaction.isPending}
                >
                  {createTransaction.isPending ? "Saving..." : "Save Entry"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
