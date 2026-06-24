import { useState } from "react";
import { Layout } from "@/components/layout";
import { useCreateMessage } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const createMessage = useCreateMessage();

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (values: z.infer<typeof contactSchema>) => {
    createMessage.mutate({ data: values }, {
      onSuccess: () => {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      onError: () => {
        toast.error("Failed to send message. Please try again.");
      }
    });
  };

  return (
    <Layout>
      <section className="py-24 bg-muted/20 min-h-[calc(100vh-80px)]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h1 className="font-serif text-5xl text-foreground">Get in Touch</h1>
              <div className="w-12 h-px bg-primary mx-auto"></div>
              <p className="text-muted-foreground text-lg">We'd love to hear from you.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-16">
              {/* Contact Info */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-12"
              >
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-serif text-xl mb-2">Location</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        755 Nakina Way<br />
                        ON K1V2J2, Ottawa<br />
                        Canada
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-serif text-xl mb-2">Phone</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        (613) 600-8392
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-serif text-xl mb-2">Email</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        RANA.GLOW2025@GMAIL.COM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="w-full">
                      <h4 className="font-serif text-xl mb-2">Hours</h4>
                      <table className="w-full text-sm text-muted-foreground">
                        <tbody>
                          <tr className="border-b border-border/50">
                            <td className="py-2">Monday - Friday</td>
                            <td className="py-2 text-right">9:00 AM - 7:00 PM</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-2">Saturday</td>
                            <td className="py-2 text-right">10:00 AM - 5:00 PM</td>
                          </tr>
                          <tr>
                            <td className="py-2">Sunday</td>
                            <td className="py-2 text-right">Closed</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="bg-muted h-64 rounded-sm overflow-hidden flex items-center justify-center text-muted-foreground">
                  <MapPin className="w-8 h-8 opacity-20" />
                  <span className="ml-2 opacity-50">Map View Placeholder</span>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {submitted ? (
                  <div className="bg-white p-12 rounded-sm shadow-md text-center space-y-6 h-full flex flex-col justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                      <Mail className="w-8 h-8" />
                    </div>
                    <h3 className="font-serif text-3xl">Message Sent</h3>
                    <p className="text-muted-foreground">
                      Thank you for reaching out. We will get back to you shortly.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSubmitted(false);
                        form.reset();
                      }}
                      className="mx-auto"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white p-8 md:p-12 rounded-sm shadow-md">
                    <h3 className="font-serif text-2xl mb-8">Send a Message</h3>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Jane Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="jane@example.com" {...field} />
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
                                <FormLabel>Phone (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="(613) 555-0123" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input placeholder="How can we help?" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Please provide details..." 
                                  className="min-h-[150px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full bg-primary hover:bg-primary/90 text-white rounded-none h-12 text-lg"
                          disabled={createMessage.isPending}
                        >
                          {createMessage.isPending ? "Sending..." : "Send Message"}
                        </Button>
                      </form>
                    </Form>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
