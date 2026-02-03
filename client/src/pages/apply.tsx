import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Building2, Loader2, CheckCircle2, Palette, Shirt, UtensilsCrossed, Handshake, Wrench, Upload, X, Image as ImageIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";

const companySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  description: z.string().min(10, "Please provide a brief description"),
  contactEmail: z.string().email("Please enter a valid email"),
  contactPhone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().optional(),
  role: z.enum(["exhibitor", "sponsor", "both"]),
  exhibitionCategory: z.enum(["art", "fashion", "food", "cultural_crafts", "services"]).optional(),
  sponsorshipTier: z.string().optional(),
});

type CompanyForm = z.infer<typeof companySchema>;

const exhibitionCategories = [
  { value: "art", label: "Art", icon: Palette },
  { value: "fashion", label: "Fashion", icon: Shirt },
  { value: "food", label: "Food", icon: UtensilsCrossed },
  { value: "cultural_crafts", label: "Cultural Crafts", icon: Handshake },
  { value: "services", label: "Services", icon: Wrench },
];

const sponsorshipTiers = [
  { value: "platinum", label: "Platinum" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "bronze", label: "Bronze" },
];

export default function Apply() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please upload an image file", variant: "destructive" });
      return;
    }
    
    setIsUploadingLogo(true);
    
    try {
      const response = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to get upload URL");
      
      const { uploadURL, objectPath } = await response.json();
      
      await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      
      setLogoUrl(objectPath);
      form.setValue("logoUrl", objectPath);
      toast({ title: "Logo uploaded successfully" });
    } catch (error) {
      console.error("Upload failed:", error);
      toast({ title: "Logo upload failed", variant: "destructive" });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const form = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      description: "",
      contactEmail: "",
      contactPhone: "",
      website: "",
      logoUrl: "",
      role: "exhibitor",
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (data: CompanyForm) => {
      return apiRequest("POST", "/api/companies", data);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "We will review your application and contact you soon.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      navigate("/sponsors");
    },
    onError: (error: Error) => {
      toast({
        title: "Application Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CompanyForm) => {
    applyMutation.mutate(data);
  };

  const selectedRole = form.watch("role");

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4">
              <Building2 className="w-3 h-3 mr-1" />
              Partner Application
            </Badge>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
              Apply as Sponsor or Exhibitor
            </h1>
            <p className="text-muted-foreground">
              Join us in celebrating African heritage at Imiklomelo Ka Dakamela 2026
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Company Information</CardTitle>
                  <CardDescription>
                    Tell us about your organization and how you'd like to participate
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company/Organization Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter company name" {...field} data-testid="input-company-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your company and what you offer..."
                            className="min-h-[100px]"
                            {...field}
                            data-testid="input-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <label className="text-sm font-medium mb-2 block">Company Logo</label>
                    <div 
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover-elevate transition-colors"
                      onClick={() => logoInputRef.current?.click()}
                      data-testid="upload-logo-area"
                    >
                      <input 
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoUpload(file);
                        }}
                        data-testid="input-logo-upload"
                      />
                      {logoUrl ? (
                        <div className="relative inline-block">
                          <img 
                            src={logoUrl} 
                            alt="Logo preview" 
                            className="w-24 h-24 object-contain mx-auto rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLogoUrl("");
                              form.setValue("logoUrl", "");
                            }}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                            data-testid="button-remove-logo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {isUploadingLogo ? "Uploading..." : "Click to upload your logo"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Your logo will be displayed on the sponsors page
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contact@company.com" {...field} data-testid="input-contact-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+27 83 123 4567" {...field} data-testid="input-contact-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website (Optional)</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder="https://yourcompany.com" {...field} data-testid="input-website" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-role">
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="exhibitor">Exhibitor Only</SelectItem>
                            <SelectItem value="sponsor">Sponsor Only</SelectItem>
                            <SelectItem value="both">Both Exhibitor & Sponsor</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose how you would like to participate
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {(selectedRole === "exhibitor" || selectedRole === "both") && (
                    <FormField
                      control={form.control}
                      name="exhibitionCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exhibition Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {exhibitionCategories.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  <div className="flex items-center gap-2">
                                    <cat.icon className="w-4 h-4" />
                                    {cat.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {(selectedRole === "sponsor" || selectedRole === "both") && (
                    <FormField
                      control={form.control}
                      name="sponsorshipTier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sponsorship Tier Interest</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-tier">
                                <SelectValue placeholder="Select a tier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sponsorshipTiers.map(tier => (
                                <SelectItem key={tier.value} value={tier.value}>
                                  {tier.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Our team will contact you with sponsorship package details
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">What happens next?</h4>
                    <ol className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0">1</span>
                        Your application will be reviewed by our committee
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0">2</span>
                        We will contact you within 5-7 business days
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0">3</span>
                        Upon approval, you'll receive package details and next steps
                      </li>
                    </ol>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={applyMutation.isPending}
                    data-testid="button-submit-application"
                  >
                    {applyMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
