import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { getErrorMessage } from "@/utils/auth-errors";
import { useToast } from "@/hooks/use-toast";
import { signupSchema, SignupFormData } from "@/types/auth";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import RegistrationForm from "./auth/RegistrationForm";

interface SignupFormProps {
  onOpenTerms: () => void;
}

export const SignupForm = ({ onOpenTerms }: SignupFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
      fullName: "",
      role: "customer",
      acceptTerms: false,
    },
  });

  const handleAuthError = (error: AuthError) => {
    console.error("Auth error:", error);
    if (error instanceof AuthApiError) {
      if (error.message.includes("User already registered") || error.status === 422) {
        console.log("User already exists, redirecting to login");
        toast({
          variant: "destructive",
          title: "Account Already Exists",
          description: "An account with this email already exists. Please login instead.",
        });
        navigate("/login", { 
          state: { 
            email: form.getValues("email"),
            message: "An account with this email already exists. Please login instead." 
          } 
        });
        return;
      }
    }
    toast({
      variant: "destructive",
      title: "Error Creating Account",
      description: getErrorMessage(error),
    });
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      console.log("Starting signup process for email:", data.email);
      
      // First check if the user already exists
      console.log("Checking if user exists in profiles table...");
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', data.email)
        .maybeSingle();

      console.log("Existing user check result:", { existingUser, checkError });

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing user:", checkError);
        throw checkError;
      }

      if (existingUser) {
        console.log("User already exists in profiles:", existingUser);
        toast({
          variant: "destructive",
          title: "Account Already Exists",
          description: "An account with this email already exists. Please login instead.",
        });
        navigate("/login", { 
          state: { 
            email: data.email,
            message: "An account with this email already exists. Please login instead." 
          } 
        });
        return;
      }

      console.log("No existing user found, proceeding with signup");
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            username: data.username,
            role: data.role,
          },
        },
      });

      if (error) {
        throw error;
      }

      console.log("Signup successful, user data:", signUpData);
      
      // Redirect based on role
      const redirectPath = data.role === 'artist' ? '/register-artist' : '/dashboard';
      
      toast({
        title: "Account Created Successfully!",
        description: data.role === 'artist' 
          ? "Please complete your artist profile to start offering services."
          : "You can now start booking services from our talented artists.",
        duration: 6000,
      });

      navigate(redirectPath, {
        state: {
          email: data.email,
          message: "Account created successfully. Welcome to GlamConnect!",
        },
      });
    } catch (error: any) {
      console.error("Signup process error:", error);
      if (error instanceof AuthError) {
        handleAuthError(error);
      } else {
        toast({
          variant: "destructive",
          title: "Error Creating Account",
          description: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <RegistrationForm
          form={form}
          isLoading={isLoading}
          onOpenTerms={onOpenTerms}
        />
      </form>
    </Form>
  );
};