import { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { useLocation } from "wouter";
import {
  useListServices,
  useListStaff,
  useGetAvailableSlots,
  useCreateAppointment,
  useGetAvailabilitySchedule,
  useListBlockedDates,
} from "@workspace/api-client-react";
import { format, parseISO } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle2, ChevronLeft, Calendar as CalendarIcon, Clock, User, Scissors } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const bookingSchema = z.object({
  clientName: z.string().min(2, "Name is required"),
  clientEmail: z.string().email("Valid email required"),
  clientPhone: z.string().min(10, "Phone number required"),
  notes: z.string().optional(),
});

type Step = 1 | 2 | 3 | 4 | 5;

export default function Book() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialServiceId = searchParams.get("service") ? Number(searchParams.get("service")) : null;

  const [step, setStep] = useState<Step>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(initialServiceId);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);

  const { data: services } = useListServices();
  const { data: staff } = useListStaff();
  const { data: schedule } = useGetAvailabilitySchedule();
  const { data: blockedDates } = useListBlockedDates();

  const inactiveDays = useMemo(() => {
    if (!schedule) return new Set([0, 6]);
    return new Set(schedule.filter((d) => !d.isActive).map((d) => d.dayOfWeek));
  }, [schedule]);

  const blockedDateSet = useMemo(() => {
    if (!blockedDates) return new Set<string>();
    return new Set(blockedDates.map((bd) => bd.date));
  }, [blockedDates]);

  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const { data: availableSlots, isLoading: slotsLoading } = useGetAvailableSlots(
    { serviceId: selectedServiceId!, staffId: selectedStaffId || undefined, date: dateStr },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { query: { enabled: !!selectedServiceId && !!dateStr && step === 3 } as any }
  );

  const createAppointment = useCreateAppointment();

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      notes: "",
    },
  });

  const selectedService = useMemo(() => services?.find(s => s.id === selectedServiceId), [services, selectedServiceId]);
  const selectedStaff = useMemo(() => staff?.find(s => s.id === selectedStaffId), [staff, selectedStaffId]);

  const handleNext = () => setStep((s) => (s + 1) as Step);
  const handleBack = () => setStep((s) => (s - 1) as Step);

  const onSubmit = (values: z.infer<typeof bookingSchema>) => {
    if (!selectedServiceId || !selectedStaffId || !dateStr || !selectedTime) {
      toast.error("Missing booking details");
      return;
    }

    createAppointment.mutate({
      data: {
        ...values,
        serviceId: selectedServiceId,
        staffId: selectedStaffId,
        date: dateStr,
        timeSlot: selectedTime,
      }
    }, {
      onSuccess: () => {
        setBookingComplete(true);
        setStep(5);
        window.scrollTo({ top: 0 });
      },
      onError: () => {
        toast.error("Failed to book appointment");
      }
    });
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-12">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
            step === i ? "bg-primary text-white" : step > i ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {i}
          </div>
          {i < 4 && (
            <div className={cn(
              "w-12 h-px transition-colors",
              step > i ? "bg-primary/50" : "bg-border"
            )} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Layout>
      <section className="py-16 md:py-24 bg-muted/10 min-h-[calc(100vh-80px)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {!bookingComplete && (
              <>
                <div className="text-center mb-12">
                  <h1 className="font-serif text-4xl text-foreground mb-4">Book Your Appointment</h1>
                  <p className="text-muted-foreground">Select a service, practitioner, and time.</p>
                </div>
                <StepIndicator />
              </>
            )}

            <div className="bg-card shadow-sm rounded-sm p-6 md:p-8 min-h-[400px]">
              
              {/* Step 1: Select Service */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-serif mb-6">1. Select Service</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {services?.map((service) => (
                      <Card 
                        key={service.id} 
                        className={cn(
                          "cursor-pointer transition-all hover:border-primary/50",
                          selectedServiceId === service.id ? "border-primary ring-1 ring-primary" : ""
                        )}
                        onClick={() => setSelectedServiceId(service.id)}
                      >
                        <CardContent className="p-6">
                          <h3 className="font-serif text-xl mb-2">{service.name}</h3>
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>{service.durationMinutes} min</span>
                            <span>${service.price}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="flex justify-end pt-6 mt-8 border-t border-border">
                    <Button 
                      onClick={handleNext} 
                      disabled={!selectedServiceId}
                      className="px-8 bg-primary hover:bg-primary/90"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Select Staff */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={handleBack}>
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h2 className="text-2xl font-serif">2. Select Practitioner</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {staff?.map((member) => (
                      <Card 
                        key={member.id} 
                        className={cn(
                          "cursor-pointer transition-all hover:border-primary/50",
                          selectedStaffId === member.id ? "border-primary ring-1 ring-primary" : ""
                        )}
                        onClick={() => setSelectedStaffId(member.id)}
                      >
                        <CardContent className="p-6 flex items-center gap-4">
                          {member.imageUrl ? (
                            <img src={member.imageUrl} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="text-primary" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-serif text-lg">{member.name}</h3>
                            <p className="text-sm text-muted-foreground">{member.title}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="flex justify-between pt-6 mt-8 border-t border-border">
                    <Button variant="outline" onClick={handleBack}>Back</Button>
                    <Button 
                      onClick={handleNext} 
                      disabled={!selectedStaffId}
                      className="px-8 bg-primary hover:bg-primary/90"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Date & Time */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={handleBack}>
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h2 className="text-2xl font-serif">3. Choose Date & Time</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="flex justify-center border p-4 rounded-sm bg-background/50">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setSelectedTime(null);
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (date < today) return true;
                          if (inactiveDays.has(date.getDay())) return true;
                          const ds = format(date, 'yyyy-MM-dd');
                          if (blockedDateSet.has(ds)) return true;
                          return false;
                        }}
                        modifiers={{
                          blocked: (date) => {
                            const ds = format(date, 'yyyy-MM-dd');
                            return blockedDateSet.has(ds);
                          }
                        }}
                        modifiersClassNames={{
                          blocked: "line-through opacity-40 cursor-not-allowed"
                        }}
                        className="rounded-md"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        Available Slots for {selectedDate ? format(selectedDate, 'MMM d, yyyy') : ''}
                      </h3>
                      
                      {slotsLoading ? (
                        <div className="grid grid-cols-2 gap-2">
                          {[1,2,3,4].map(i => <div key={i} className="h-10 bg-muted animate-pulse rounded-sm" />)}
                        </div>
                      ) : availableSlots && availableSlots.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {availableSlots.map((slot) => (
                            <Button
                              key={slot}
                              variant={selectedTime === slot ? "default" : "outline"}
                              className={cn(
                                "w-full",
                                selectedTime === slot ? "bg-primary" : ""
                              )}
                              onClick={() => setSelectedTime(slot)}
                            >
                              {slot}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-muted-foreground border rounded-sm bg-muted/20">
                          No available slots on this date.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between pt-6 mt-8 border-t border-border">
                    <Button variant="outline" onClick={handleBack}>Back</Button>
                    <Button 
                      onClick={handleNext} 
                      disabled={!selectedDate || !selectedTime}
                      className="px-8 bg-primary hover:bg-primary/90"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Details & Confirm */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={handleBack}>
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h2 className="text-2xl font-serif">4. Your Details</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-muted/20 p-6 rounded-sm border space-y-4 h-fit">
                      <h3 className="font-serif text-lg mb-4">Summary</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Scissors className="w-4 h-4" /> Service
                          </span>
                          <span className="font-medium text-right">{selectedService?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <User className="w-4 h-4" /> Practitioner
                          </span>
                          <span className="font-medium text-right">{selectedStaff?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" /> Date
                          </span>
                          <span className="font-medium text-right">{selectedDate && format(selectedDate, 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Time
                          </span>
                          <span className="font-medium text-right">{selectedTime}</span>
                        </div>
                        <div className="pt-3 mt-3 border-t flex justify-between font-serif text-lg">
                          <span>Total</span>
                          <span>${selectedService?.price}</span>
                        </div>
                      </div>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="clientName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="clientEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="clientPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input type="tel" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Special Requests / Notes</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-between pt-6 mt-4 border-t border-border">
                          <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
                          <Button 
                            type="submit" 
                            disabled={createAppointment.isPending}
                            className="px-8 bg-primary hover:bg-primary/90"
                          >
                            {createAppointment.isPending ? "Confirming..." : "Confirm Booking"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </div>
              )}

              {/* Step 5: Success */}
              {step === 5 && (
                <div className="text-center py-12 space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-4xl font-serif">Booking Confirmed</h2>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Thank you, {form.getValues().clientName}. Your appointment for {selectedService?.name} with {selectedStaff?.name} is confirmed for {selectedDate && format(selectedDate, 'MMMM d')} at {selectedTime}.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We've sent a confirmation email to {form.getValues().clientEmail}.
                  </p>
                  <div className="pt-8">
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = '/'}
                      className="px-8"
                    >
                      Return to Home
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
