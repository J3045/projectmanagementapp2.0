import { useState } from "react";
import { api } from "~/utils/api";
import Layout from "~/components/Layout";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define validation schemas using Zod
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional(),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(6, "Old password must be at least 6 characters"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Profile() {
  const { data: user, isLoading } = api.user.getUserProfile.useQuery();
  const updateProfile = api.user.updateUserProfile.useMutation();
  const changePassword = api.user.changePassword.useMutation();
  const { data: session, update } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitProfile: SubmitHandler<z.infer<typeof profileSchema>> = async (data) => {
    try {
      setIsSubmitting(true);
      const updatedData: {
        name: string;
        email?: string; // Keep this optional
      } = {
        name: data.name, // Use the name from the data parameter
        email: data.email?.trim() !== "" ? data.email : session?.user?.email || undefined, // Set to undefined if emailValue is null
      };
      await updateProfile.mutateAsync(updatedData);
      toast.success("Profile updated!");
      await update();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitPassword: SubmitHandler<FieldValues> = async (data) => {
    try {
      setIsSubmitting(true);
      // Cast `data` to the inferred type from the Zod schema
      const passwordData = data as z.infer<typeof passwordSchema>;
      await changePassword.mutateAsync({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed!");
      resetPassword();
      setIsPasswordModalOpen(false); // Close modal after successful update
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">User Profile</h1>

        {/* Profile Picture */}
        <div className="flex flex-col items-center gap-4 mb-6">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt="Profile"
              width={96}
              height={96}
              className="rounded-full border-4 border-indigo-700 shadow-md"
            />
          ) : (
            <div className="w-24 h-24 bg-indigo-700 text-white font-bold rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-lg">
              {session?.user?.name?.[0] || "U"}
            </div>
          )}
          <span className="text-lg font-medium text-gray-700">{session?.user?.name}</span>
        </div>

        {/* Buttons to Open Modals */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md shadow-md transition"
          >
            Edit Profile
          </button>
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-md transition"
          >
            Change Password
          </button>
        </div>

        {/* Profile Update Modal */}
        {isProfileModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Update Profile</h2>
              <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-gray-600 font-medium">Name</label>
                  <input
                    {...register("name")}
                    placeholder="Your name"
                    className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-700"
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name.message?.toString()}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-600 font-medium">Email</label>
                  <input
                    {...register("email")}
                    placeholder="Your email"
                    type="email"
                    className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-700"
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email.message?.toString()}</p>}
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md shadow-md transition"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-md shadow-md transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Change Password Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Change Password</h2>
              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-gray-600 font-medium">Old Password</label>
                  <input
                    {...registerPassword("oldPassword")}
                    type="password"
                    placeholder="Enter old password"
                    className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-700"
                  />
                  {passwordErrors.oldPassword && (
                    <p className="text-red-500 text-sm">{passwordErrors.oldPassword.message?.toString()}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-600 font-medium">New Password</label>
                  <input
                    {...registerPassword("newPassword")}
                    type="password"
                    placeholder="Enter new password"
                    className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-700"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-red-500 text-sm">{passwordErrors.newPassword.message?.toString()}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-600 font-medium">Confirm Password</label>
                  <input
                    {...registerPassword("confirmPassword")}
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-700"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-sm">{passwordErrors.confirmPassword.message?.toString()}</p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-md transition"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Changing..." : "Change Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-md shadow-md transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
}