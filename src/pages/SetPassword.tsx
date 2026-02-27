import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const SetupInfoSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    user_name: z.string().optional(),
    phone: z.string().optional(),
    date_of_birth: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SetupInfoFormValues = z.infer<typeof SetupInfoSchema>;

export default function SetPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<SetupInfoFormValues>({
    resolver: zodResolver(SetupInfoSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      user_name: '',
      phone: '',
      date_of_birth: '',
    },
  });

  const onSubmit = async (values: SetupInfoFormValues) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.setupInfo({
        password: values.password,
        user_name: values.user_name || undefined,
        phone: values.phone || undefined,
        date_of_birth: values.date_of_birth || undefined,
      });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 rounded-xl bg-gray-800 shadow-lg">
        <h1 className="text-2xl font-semibold text-white mb-2">Set up your account</h1>
        <p className="text-gray-400 text-sm mb-6">
          You signed in with Google. Please set a password and optionally fill in your profile details.
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Password <span className="text-red-400">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      disabled={loading}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Confirm Password <span className="text-red-400">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      disabled={loading}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Username</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g. johndoe"
                      disabled={loading}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                      {...field}
                    />
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
                  <FormLabel className="text-gray-200">Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="e.g. +66812345678"
                      disabled={loading}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Date of Birth</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={loading}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
