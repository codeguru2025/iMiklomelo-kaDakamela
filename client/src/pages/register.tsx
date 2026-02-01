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
  ArrowLeft, Loader2, CreditCard, User, Globe, DollarSign
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
  phone: z.string().min(6, "Please enter a valid phone number"),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  ageRange: z.enum(["under_18", "18_24", "25_34", "35_44", "45_54", "55_64", "65_plus"]),
  profession: z.string().optional(),
  attendanceType: z.enum(["standard", "vip", "delegation"]),
  country: z.string().min(2, "Please select your country"),
  city: z.string().min(2, "Please enter your city"),
  isFirstTime: z.boolean(),
  needsAccommodation: z.boolean(),
  arrivalDate: z.date().optional(),
  departureDate: z.date().optional(),
  campId: z.string().optional(),
  bookingType: z.enum(["per_day", "full_camp"]).optional(),
  selectedServices: z.array(z.string()).optional(),
  marketingConsent: z.boolean(),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms"),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

const countries = [
  "South Africa", "Zimbabwe", "Botswana", "Namibia", "Mozambique", "Zambia",
  "Tanzania", "Kenya", "Nigeria", "Ghana", "United Kingdom", "United States",
  "Canada", "Australia", "Germany", "France", "Other"
];

const ageRangeLabels: Record<string, string> = {
  under_18: "Under 18",
  "18_24": "18-24",
  "25_34": "25-34",
  "35_44": "35-44",
  "45_54": "45-54",
  "55_64": "55-64",
  "65_plus": "65+",
};

const genderLabels: Record<string, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
};

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
      gender: "prefer_not_to_say",
      ageRange: "25_34",
      profession: "",
      attendanceType: "standard",
      country: "",
      city: "",
      isFirstTime: true,
      needsAccommodation: false,
      selectedServices: [],
      marketingConsent: false,
      acceptTerms: false,
      bookingType: "full_camp",
    },
  });

  const needsAccommodation = form.watch("needsAccommodation");

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationForm) => {
      return apiRequest("POST", "/api/attendees", {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        ageRange: data.ageRange,
        profession: data.profession || null,
        attendanceType: data.attendanceType,
        country: data.country,
        city: data.city,
        isFirstTime: data.isFirstTime,
        needsAccommodation: data.needsAccommodation,
        arrivalDate: data.arrivalDate?.toISOString() || null,
        departureDate: data.departureDate?.toISOString() || null,
        marketingConsent: data.marketingConsent,
      });
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "You will receive a confirmation email shortly. Thank you for registering!",
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
      fieldsToValidate = ["fullName", "email", "phone", "gender", "ageRange"];
    } else if (step === 2) {
      fieldsToValidate = ["country", "city", "attendanceType"];
    } else if (step === 3) {
      if (needsAccommodation) {
        fieldsToValidate = ["arrivalDate", "departureDate"];
      }
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
  const bookingType = form.watch("bookingType");

  const calculateTotal = () => {
    let total = 0;
    
    if (selectedCamp && needsAccommodation) {
      if (bookingType === "full_camp") {
        total += parseFloat(selectedCamp.priceFullCamp);
      } else {
        const arrivalDate = form.watch("arrivalDate");
        const departureDate = form.watch("departureDate");
        if (arrivalDate && departureDate) {
          const days = Math.ceil((departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
          total += parseFloat(selectedCamp.pricePerDay) * Math.max(days, 1);
        }
      }
    }

    selectedServicesData.forEach(service => {
      total += parseFloat(service.price);
    });

    return total;
  };

  const totalAmount = calculateTotal();
  const depositAmount = totalAmount * 0.3;

  const totalSteps = needsAccommodation ? 4 : 3;

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
              All attendees must register - even if not camping
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
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
                  {s < totalSteps && (
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
                    {step === 2 && "Location & Attendance"}
                    {step === 3 && (needsAccommodation ? "Accommodation & Services" : "Review & Confirm")}
                    {step === 4 && "Review & Confirm"}
                  </CardTitle>
                  <CardDescription>
                    {step === 1 && "Tell us about yourself"}
                    {step === 2 && "Where are you from and how will you attend?"}
                    {step === 3 && (needsAccommodation ? "Select your camping options" : "Review your registration")}
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
                            <FormLabel>Full Name *</FormLabel>
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
                            <FormLabel>Email Address *</FormLabel>
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
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+27 83 123 4567" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-gender">
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(genderLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ageRange"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Age Range *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-age-range">
                                    <SelectValue placeholder="Select age range" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(ageRangeLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="profession"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profession / Industry (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Teacher, Engineer, Farmer" {...field} data-testid="input-profession" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country *</FormLabel>
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
                              <FormLabel>City / Town *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your city" {...field} data-testid="input-city" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="attendanceType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attendance Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-attendance-type">
                                  <SelectValue placeholder="Select attendance type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="standard">Standard Attendee</SelectItem>
                                <SelectItem value="vip">VIP Guest</SelectItem>
                                <SelectItem value="delegation">Delegation / Cultural Representative</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isFirstTime"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-first-time"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>First Time Attendee</FormLabel>
                              <FormDescription>
                                Check this if this is your first time attending Imiklomelo Ka Dakamela
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="needsAccommodation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-needs-accommodation"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="flex items-center gap-2">
                                <Tent className="w-4 h-4" />
                                I need camping accommodation
                              </FormLabel>
                              <FormDescription>
                                Book a spot at our Premium Cultural Camping Sanctuary. Prices from $25/day or $60 for full camp.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {step === 3 && needsAccommodation && (
                    <>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="arrivalDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Arrival Date *</FormLabel>
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
                              <FormLabel>Departure Date *</FormLabel>
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

                      <FormField
                        control={form.control}
                        name="bookingType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Booking Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-booking-type">
                                  <SelectValue placeholder="Select booking type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="full_camp">Full Camp Duration ($60)</SelectItem>
                                <SelectItem value="per_day">Per Day ($25/day)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Full camp duration is better value for 3+ days
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="campId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Camp Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-camp">
                                  <SelectValue placeholder="Select a camp type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {camps?.filter(c => c.isActive).map(camp => (
                                  <SelectItem key={camp.id} value={camp.id}>
                                    {camp.name} - ${parseFloat(camp.pricePerDay)}/day or ${parseFloat(camp.priceFullCamp)} full
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                              <FormLabel>Optional Add-On Services</FormLabel>
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
                                        ${parseFloat(service.price)}
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

                  {((step === 3 && !needsAccommodation) || step === 4) && (
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
                            <Label className="text-muted-foreground">Phone</Label>
                            <p className="font-medium">{form.watch("phone")}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Gender</Label>
                            <p className="font-medium">{genderLabels[form.watch("gender")]}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Age Range</Label>
                            <p className="font-medium">{ageRangeLabels[form.watch("ageRange")]}</p>
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
                            <Label className="text-muted-foreground">First Time Attendee</Label>
                            <p className="font-medium">{form.watch("isFirstTime") ? "Yes" : "No"}</p>
                          </div>
                        </div>

                        {needsAccommodation && selectedCamp && (
                          <>
                            <Separator />
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label className="text-muted-foreground">Arrival</Label>
                                <p className="font-medium" data-testid="review-arrival">
                                  {form.watch("arrivalDate") ? format(form.watch("arrivalDate")!, "PPP") : "-"}
                                </p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Departure</Label>
                                <p className="font-medium" data-testid="review-departure">
                                  {form.watch("departureDate") ? format(form.watch("departureDate")!, "PPP") : "-"}
                                </p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Accommodation</Label>
                              <p className="font-medium">{selectedCamp.name} ({bookingType === "full_camp" ? "Full Camp" : "Per Day"})</p>
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
                                  <span className="font-medium">${parseFloat(service.price)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {needsAccommodation && totalAmount > 0 && (
                          <>
                            <Separator />
                            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Total Amount</span>
                                <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm text-primary">
                                <span>Deposit Required (30%)</span>
                                <span className="font-bold">${depositAmount.toFixed(2)}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Deposit must be paid within 48 hours to confirm your booking
                              </p>
                            </div>
                          </>
                        )}

                        <Separator />

                        <FormField
                          control={form.control}
                          name="marketingConsent"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-marketing"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm">
                                  Keep me informed about future events and offers
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

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
                                <FormLabel className="text-sm">
                                  I accept the terms and conditions and privacy policy *
                                </FormLabel>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-4 pt-4">
                    {step > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={prevStep}
                        data-testid="button-previous"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                    )}

                    {step < totalSteps ? (
                      <Button 
                        type="button" 
                        className="ml-auto" 
                        onClick={nextStep}
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
                            Submitting...
                          </>
                        ) : needsAccommodation && totalAmount > 0 ? (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Register & Pay Deposit
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Complete Registration
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
