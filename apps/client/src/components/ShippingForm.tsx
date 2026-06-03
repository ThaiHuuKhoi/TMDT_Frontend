"use client";

import { ShippingFormInputs, shippingFormSchema } from "@repo/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, MapPin, Phone, User, Mail, Building } from "lucide-react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { useAuthStore } from "@/features/auth/store";
import { useEffect } from "react";

const ShippingForm = ({
  setShippingForm,
}: {
  setShippingForm: (data: ShippingFormInputs) => void;
}) => {
  const router = useRouter();
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<ShippingFormInputs>({
    resolver: zodResolver(shippingFormSchema as any),
    defaultValues: {
      email: user?.email || "",
      name: user?.name || "",
    },
  });

  useEffect(() => {
    if (user) {
      if (user.email) setValue("email", user.email);
      if (user.name) setValue("name", user.name);
    }
  }, [user, setValue]);

  const handleShippingForm: SubmitHandler<ShippingFormInputs> = (data) => {
    setShippingForm(data);
    router.push("/cart?step=3", { scroll: false });
  };

  const renderInput = (
    id: keyof ShippingFormInputs,
    label: string,
    placeholder: string,
    icon: React.ReactNode,
    type: string = "text",
    autoComplete: string
  ) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs text-gray-700 font-semibold flex items-center gap-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <input
          {...register(id)}
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm outline-none transition-all
            ${errors[id]
              ? "border-red-300 bg-red-50 focus:border-red-500"
              : "border-gray-200 focus:border-black focus:ring-1 focus:ring-gray-200"
            }
          `}
        />
      </div>
      {errors[id] && (
        <p className="text-xs text-red-500 font-medium ml-1">{errors[id]?.message}</p>
      )}
    </div>
  );

  return (
    <form
      className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500"
      onSubmit={handleSubmit(handleShippingForm)}
    >
      {/* Name */}
      {renderInput("name", "Full Name", "John Doe", <User size={16} />, "text", "name")}

      {/* Email */}
      {renderInput("email", "Email Address", "john@example.com", <Mail size={16} />, "email", "email")}

      {/* Phone */}
      {renderInput("phone", "Phone Number", "+84 901 234 567", <Phone size={16} />, "tel", "tel")}

      {/* Address */}
      {renderInput("address", "Street Address", "123 Main St, Apt 4B", <MapPin size={16} />, "text", "street-address")}

      {/* City */}
      {renderInput("city", "City / Province", "Ho Chi Minh City", <Building size={16} />, "text", "address-level2")}

      <button
        type="submit"
        className="w-full bg-black hover:bg-gray-800 transition-all duration-300 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 mt-2 shadow-lg hover:shadow-xl transform active:scale-[0.98]"
      >
        Continue to Payment
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
};

export default ShippingForm;