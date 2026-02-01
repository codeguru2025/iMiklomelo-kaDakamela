import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Users, CalendarIcon, MapPin, Tent, CheckCircle2, ArrowRight, 
  ArrowLeft, Loader2, CreditCard
} from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import type { Camp, CampService } from "@shared/schema";
import { cn } from "@/lib/utils";

const registrationSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  attendanceType: z.enum(["standard", "vip", "delegation"]),
  country: z.string().min(2, "Please select your country"),
  city: z.string().min(2, "Please enter your city"),
  arrivalDate: z.date({ required_error: "Please select your arrival date" }),
  departureDate: z.date({ required_error: "Please select your departure date" }),
  campId: z.string().optional(),
  selectedServices: z.array(z.string()).optional(),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms"),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

const countries = [
  "South Africa", "Zimbabwe", "Botswana", "Namibia", "Mozambique", "Zambia",
  "Tanzania", "Kenya", "Nigeria", "Ghana", "United Kingdom", "United States",
  "Canada", "Australia", "Germany", "France", "Other"
];

export default function Register() {
  const [step, setStep] = useState(1);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: camps } = useQuery<Camp[]>({
    queryKey: ["/api/camps"],
  });

  const { data: services } = useQuery<CampService[]>({
    queryKey: ["/api/camp-services"],
  });

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      attendanceType: "standard",
      country: "",
      city: "",
      selectedServices: [],
      acceptTerms: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationForm) => {
      return apiRequest("POST", "/api/attendees", {
        ...data,
        arrivalDate: data.arrivalDate.toISOString(),
        departureDate: data.departureDate.toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "You will receive a confirmation email with payment instructions.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attendees"] });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationForm) => {
    registerMutation.mutate(data);
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof RegistrationForm)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ["fullName", "email", "phone", "attendanceType"];
    } else if (step === 2) {
      fieldsToValidate = ["country", "city", "arrivalDate", "departureDate"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const selectedCamp = camps?.find(c => c.id === form.watch("campId"));
  const selectedServiceIds = form.watch("selectedServices") || [];
  const selectedServicesData = services?.filter(s => selectedServiceIds.includes(s.id)) || [];

  const calculateTotal = () => {
    let total = 0;
    
    if (selectedCamp) {
      const arrivalDate = form.watch("arrivalDate");
      const departureDate = form.watch("departureDate");
      if (arrivalDate && departureDate) {
        const nights = Math.ceil((departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
        total += parseFloat(selectedCamp.pricePerNight) * Math.max(nights, 1);
      }
    }

    selectedServicesData.forEach(service => {
      total += parseFloat(service.price);
    });

    return total;
  };

  const totalAmount = calculateTotal();
  const depositAmount = totalAmount * 0.3;

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4">
              <Users className="w-3 h-3 mr-1" />
              Attendee Registration
            </Badge>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
              Register for Event 2026
            </h1>
            <p className="text-muted-foreground">
              Complete your registration to attend Imiklomelo Ka Dakamela
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors",
                      step >= s 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    )}
                    data-testid={`step-indicator-${s}`}
                  >
                    {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                  </div>
                  {s < 4 && (
                    <div className={cn(
                      "w-12 h-1 mx-1",
                      step > s ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">
                    {step === 1 && "Personal Information"}
                    {step === 2 && "Travel Details"}
                    {step === 3 && "Accommodation & Services"}
                    {step === 4 && "Review & Confirm"}
                  </CardTitle>
                  <CardDescription>
                    {step === 1 && "Tell us about yourself"}
                    {step === 2 && "When and where are you traveling from?"}
                    {step === 3 && "Select your camping and optional services"}
                    {step === 4 && "Review your registration details"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {step === 1 && (
                    <>
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} data-testid="input-full-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number (Optional)</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+27 83 123 4567" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="attendanceType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attendance Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-attendance-type">
                                  <SelectValue placeholder="Select attendance type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="vip">VIP</SelectItem>
                                <SelectItem value="delegation">Delegation / Cultural Guest</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-country">
                                  <SelectValue placeholder="Select your country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {countries.map(country => (
                                  <SelectItem key={country} value={country}>{country}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your city" {...field} data-testid="input-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="arrivalDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Arrival Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                      data-testid="button-arrival-date"
                                    >
                                      {field.value ? format(field.value, "PPP") : "Select date"}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date()}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="departureDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Departure Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                      data-testid="button-departure-date"
                                    >
                                      {field.value ? format(field.value, "PPP") : "Select date"}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => {
                                      const arrival = form.watch("arrivalDate");
                                      return date < (arrival || new Date());
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <FormField
                        control={form.control}
                        name="campId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Accommodation (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-camp">
                                  <SelectValue placeholder="Select a camp type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {camps?.filter(c => c.isActive).map(camp => (
                                  <SelectItem key={camp.id} value={camp.id}>
                                    {camp.name} - R{parseFloat(camp.pricePerNight).toFixed(0)}/night
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Leave empty if you have your own accommodation
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {services && services.length > 0 && (
                        <FormField
                          control={form.control}
                          name="selectedServices"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Optional Services</FormLabel>
                              <div className="grid sm:grid-cols-2 gap-3">
                                {services.filter(s => s.isActive).map(service => (
                                  <div 
                                    key={service.id}
                                    className={cn(
                                      "flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                                      field.value?.includes(service.id) 
                                        ? "border-primary bg-primary/5" 
                                        : "hover:bg-muted/50"
                                    )}
                                    onClick={() => {
                                      const current = field.value || [];
                                      const newValue = current.includes(service.id)
                                        ? current.filter(id => id !== service.id)
                                        : [...current, service.id];
                                      field.onChange(newValue);
                                    }}
                                  >
                                    <Checkbox 
                                      checked={field.value?.includes(service.id)}
                                      data-testid={`checkbox-service-${service.id}`}
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{service.name}</p>
                                      <p className="text-xs text-muted-foreground">{service.description}</p>
                                      <p className="text-sm font-semibold text-primary mt-1">
                                        R{parseFloat(service.price).toFixed(0)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </>
                  )}

                  {step === 4 && (
                    <>
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label className="text-muted-foreground">Full Name</Label>
                            <p className="font-medium" data-testid="review-full-name">{form.watch("fullName")}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Email</Label>
                            <p className="font-medium" data-testid="review-email">{form.watch("email")}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Attendance Type</Label>
                            <p className="font-medium capitalize" data-testid="review-attendance">{form.watch("attendanceType")}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Location</Label>
                            <p className="font-medium" data-testid="review-location">{form.watch("city")}, {form.watch("country")}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Arrival</Label>
                            <p className="font-medium" data-testid="review-arrival">
                              {form.watch("arrivalDate") ? format(form.watch("arrivalDate"), "PPP") : "-"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Departure</Label>
                            <p className="font-medium" data-testid="review-departure">
                              {form.watch("departureDate") ? format(form.watch("departureDate"), "PPP") : "-"}
                            </p>
                          </div>
                        </div>

                        {selectedCamp && (
                          <>
                            <Separator />
                            <div>
                              <Label className="text-muted-foreground">Accommodation</Label>
                              <p className="font-medium">{selectedCamp.name}</p>
                            </div>
                          </>
                        )}

                        {selectedServicesData.length > 0 && (
                          <div>
                            <Label className="text-muted-foreground">Selected Services</Label>
                            <ul className="mt-1 space-y-1">
                              {selectedServicesData.map(service => (
                                <li key={service.id} className="text-sm flex justify-between">
                                  <span>{service.name}</span>
                                  <span className="text-muted-foreground">R{parseFloat(service.price).toFixed(0)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {totalAmount > 0 && (
                          <>
                            <Separator />
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <div className="flex justify-between mb-2">
                                <span>Total Amount</span>
                                <span className="font-semibold">R{totalAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-primary">
                                <span className="flex items-center gap-1">
                                  <CreditCard className="w-4 h-4" />
                                  Deposit Required (30%)
                                </span>
                                <span className="font-bold">R{depositAmount.toFixed(2)}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Pay within 48 hours to secure your reservation
                              </p>
                            </div>
                          </>
                        )}

                        <FormField
                          control={form.control}
                          name="acceptTerms"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-terms"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  I accept the terms and conditions
                                </FormLabel>
                                <FormDescription>
                                  By registering, you agree to our policies regarding deposits, 
                                  reservations, and event participation.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                </CardContent>

                <div className="flex justify-between p-6 pt-0 gap-4">
                  {step > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={prevStep}
                      data-testid="button-back"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                  
                  {step < 4 ? (
                    <Button 
                      type="button" 
                      onClick={nextStep} 
                      className="ml-auto"
                      data-testid="button-next"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      className="ml-auto"
                      disabled={registerMutation.isPending}
                      data-testid="button-submit"
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          Complete Registration
                          <CheckCircle2 className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
