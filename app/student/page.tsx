"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { User, Phone, MapPin, GraduationCap, Heart, Pencil } from "lucide-react";

const departments = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
];

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function StudentProfilePage() {
  const { user } = useUser();
  const profile = useQuery(api.functions.queries.getMyProfile);
  const createProfile = useMutation(api.functions.mutations.createStudentProfile);
  const updateProfile = useMutation(api.functions.mutations.updateMyProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for creation
  const [form, setForm] = useState({
    roll_number: "",
    full_name: user?.fullName ?? "",
    phone_number: "",
    date_of_birth: "",
    gender: "" as "Male" | "Female" | "Other" | "",
    department: "",
    batch: "",
    current_semester: 1,
    father_name: "",
    mother_name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    emergency_contact: "",
    blood_group: "",
  });

  // Editable fields state
  const [editForm, setEditForm] = useState({
    phone_number: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    emergency_contact: "",
    blood_group: "",
  });

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  // ──── CREATE PROFILE FORM ─────────────────────────────
  if (profile === null) {
    const handleCreate = async () => {
      if (!form.roll_number || !form.full_name || !form.phone_number || !form.date_of_birth || !form.gender || !form.department || !form.batch || !form.father_name || !form.mother_name || !form.address || !form.city || !form.state || !form.pincode || !form.emergency_contact) {
        toast.error("Please fill in all required fields");
        return;
      }
      if (!/^\d{6,10}$/.test(form.roll_number)) {
        toast.error("Roll number must be 6-10 digits");
        return;
      }
      if (!/^\d{10}$/.test(form.phone_number)) {
        toast.error("Phone must be 10 digits");
        return;
      }
      if (!/^\d{6}$/.test(form.pincode)) {
        toast.error("Pincode must be 6 digits");
        return;
      }
      if (!/^\d{10}$/.test(form.emergency_contact)) {
        toast.error("Emergency contact must be 10 digits");
        return;
      }
      setSaving(true);
      try {
        await createProfile({
          roll_number: form.roll_number,
          full_name: form.full_name,
          phone_number: form.phone_number,
          date_of_birth: form.date_of_birth,
          gender: form.gender as "Male" | "Female" | "Other",
          department: form.department,
          batch: form.batch,
          current_semester: form.current_semester,
          father_name: form.father_name,
          mother_name: form.mother_name,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          emergency_contact: form.emergency_contact,
          blood_group: form.blood_group || undefined,
        });
        toast.success("Profile created successfully!");
      } catch (err: any) {
        toast.error(err.message || "Failed to create profile");
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Create Your Profile
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Fill in your details to get started
          </p>
        </div>

        <div className="grid gap-6">
          {/* Personal Information */}
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                <User className="h-5 w-5" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Roll Number *</Label>
                <Input value={form.roll_number} onChange={(e) => setForm({ ...form, roll_number: e.target.value })} placeholder="e.g. 12345678" />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v as any })}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Father&apos;s Name *</Label>
                <Input value={form.father_name} onChange={(e) => setForm({ ...form, father_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Mother&apos;s Name *</Label>
                <Input value={form.mother_name} onChange={(e) => setForm({ ...form, mother_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select value={form.blood_group} onValueChange={(v) => setForm({ ...form, blood_group: v })}>
                  <SelectTrigger><SelectValue placeholder="Select (optional)" /></SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((bg) => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                <GraduationCap className="h-5 w-5" /> Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Batch *</Label>
                <Input value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} placeholder="e.g. 2023-2027" />
              </div>
              <div className="space-y-2">
                <Label>Current Semester *</Label>
                <Select value={String(form.current_semester)} onValueChange={(v) => setForm({ ...form, current_semester: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                <Phone className="h-5 w-5" /> Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="10 digits" />
              </div>
              <div className="space-y-2">
                <Label>Emergency Contact *</Label>
                <Input value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} placeholder="10 digits" />
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                <MapPin className="h-5 w-5" /> Address
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2 md:col-span-2 lg:col-span-4">
                <Label>Address *</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street address" />
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Pincode *</Label>
                <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="6 digits" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleCreate}
              disabled={saving}
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 px-8"
            >
              {saving ? "Creating..." : "Create Profile"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ──── VIEW / EDIT PROFILE ─────────────────────────────
  const startEditing = () => {
    setEditForm({
      phone_number: profile.phone_number,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      pincode: profile.pincode,
      emergency_contact: profile.emergency_contact,
      blood_group: profile.blood_group ?? "",
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (editForm.phone_number && !/^\d{10}$/.test(editForm.phone_number)) {
      toast.error("Phone must be 10 digits");
      return;
    }
    if (editForm.pincode && !/^\d{6}$/.test(editForm.pincode)) {
      toast.error("Pincode must be 6 digits");
      return;
    }
    if (editForm.emergency_contact && !/^\d{10}$/.test(editForm.emergency_contact)) {
      toast.error("Emergency contact must be 10 digits");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        phone_number: editForm.phone_number,
        address: editForm.address,
        city: editForm.city,
        state: editForm.state,
        pincode: editForm.pincode,
        emergency_contact: editForm.emergency_contact,
        blood_group: editForm.blood_group || undefined,
      });
      toast.success("Profile updated!");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">My Profile</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Your student information
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={startEditing}
            variant="outline"
            className="border-zinc-300 dark:border-zinc-700"
          >
            <Pencil className="h-4 w-4 mr-2" /> Edit Contact Info
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {/* Personal */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
              <User className="h-5 w-5" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoField label="Full Name" value={profile.full_name} />
              <InfoField label="Roll Number" value={profile.roll_number} />
              <InfoField label="Email" value={profile.email} />
              <InfoField label="Date of Birth" value={profile.date_of_birth} />
              <InfoField label="Gender" value={profile.gender} />
              <InfoField label="Father's Name" value={profile.father_name} />
              <InfoField label="Mother's Name" value={profile.mother_name} />
              {profile.blood_group && (
                <InfoField label="Blood Group" value={profile.blood_group} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Academic */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
              <GraduationCap className="h-5 w-5" /> Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoField label="Department" value={profile.department} />
              <InfoField label="Batch" value={profile.batch} />
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Current Semester</p>
                <Badge variant="outline" className="mt-1 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                  Semester {profile.current_semester}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact — editable */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
              <Phone className="h-5 w-5" /> Contact Information
            </CardTitle>
            <CardDescription>
              {isEditing ? "Edit your contact details below" : "Contact and emergency details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={editForm.phone_number} onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Emergency Contact</Label>
                    <Input value={editForm.emergency_contact} onChange={(e) => setEditForm({ ...editForm, emergency_contact: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select value={editForm.blood_group} onValueChange={(v) => setEditForm({ ...editForm, blood_group: v })}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((bg) => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Phone Number" value={profile.phone_number} />
                <InfoField label="Emergency Contact" value={profile.emergency_contact} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Address — editable */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
              <MapPin className="h-5 w-5" /> Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2 md:col-span-2 lg:col-span-4">
                  <Label>Address</Label>
                  <Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input value={editForm.pincode} onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="md:col-span-2 lg:col-span-4">
                  <InfoField label="Address" value={profile.address} />
                </div>
                <InfoField label="City" value={profile.city} />
                <InfoField label="State" value={profile.state} />
                <InfoField label="Pincode" value={profile.pincode} />
              </div>
            )}
          </CardContent>
        </Card>

        {isEditing && (
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="border-zinc-300 dark:border-zinc-700">
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving}
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="text-zinc-900 dark:text-zinc-50 font-medium mt-0.5">{value}</p>
    </div>
  );
}
