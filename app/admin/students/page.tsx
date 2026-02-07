"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Search, Eye } from "lucide-react";

const DEPARTMENTS = ["CS", "IT", "ECE", "ME", "Civil", "EEE"];

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [semFilter, setSemFilter] = useState("0");

  const profiles = useQuery(api.functions.queries.listStudentProfiles, {
    department_filter: deptFilter,
    semester_filter: parseInt(semFilter),
    search: search || undefined,
  });

  if (profiles === undefined) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Student Profiles
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          View and manage all student profiles.
        </p>
      </div>

      {/* Filters */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, roll number, or email"
                className="pl-10 border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={semFilter} onValueChange={setSemFilter}>
              <SelectTrigger className="border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900">
                <SelectValue placeholder="Filter by semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All Semesters</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <CardContent className="pt-6 overflow-x-auto">
          {profiles.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              No student profiles found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <TableHead className="text-zinc-900 dark:text-zinc-50 font-semibold">Roll No</TableHead>
                  <TableHead className="text-zinc-900 dark:text-zinc-50 font-semibold">Name</TableHead>
                  <TableHead className="text-zinc-900 dark:text-zinc-50 font-semibold">Email</TableHead>
                  <TableHead className="text-zinc-900 dark:text-zinc-50 font-semibold">Department</TableHead>
                  <TableHead className="text-zinc-900 dark:text-zinc-50 font-semibold text-center">Semester</TableHead>
                  <TableHead className="text-zinc-900 dark:text-zinc-50 font-semibold">Batch</TableHead>
                  <TableHead className="text-zinc-900 dark:text-zinc-50 font-semibold text-center">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile._id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <TableCell className="font-mono font-medium text-zinc-900 dark:text-zinc-50">
                      {profile.roll_number}
                    </TableCell>
                    <TableCell className="font-medium text-zinc-900 dark:text-zinc-50">
                      {profile.full_name}
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400">
                      {profile.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-zinc-300 dark:border-zinc-700">
                        {profile.department}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-zinc-900 dark:text-zinc-50">
                      {profile.current_semester}
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400">
                      {profile.batch}
                    </TableCell>
                    <TableCell className="text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-zinc-300 dark:border-zinc-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-zinc-900 dark:text-zinc-50">
                              Student Profile
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 pt-4">
                            {/* Personal Info */}
                            <div>
                              <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                                Personal Information
                              </h4>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-zinc-500">Name</span>
                                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{profile.full_name}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-500">Roll Number</span>
                                  <p className="font-mono font-medium text-zinc-900 dark:text-zinc-50">{profile.roll_number}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-500">Email</span>
                                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{profile.email}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-500">Phone</span>
                                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{profile.phone_number}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-500">Date of Birth</span>
                                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{profile.date_of_birth}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-500">Gender</span>
                                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{profile.gender}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-500">Blood Group</span>
                                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{profile.blood_group || "-"}</p>
                                </div>
                              </div>
                            </div>

                            <div className="border-t border-zinc-200 dark:border-zinc-800" />

                            {/* Academic Info */}
                            <div>
                              <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                                Academic Information
                              </h4>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-zinc-500">Department</span>
                                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{profile.department}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-500">Semester</span>
                                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{profile.current_semester}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-500">Batch</span>
                                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{profile.batch}</p>
                                </div>
                              </div>
                            </div>

                            <div className="border-t border-zinc-200 dark:border-zinc-800" />

                            {/* Family & Contact */}
                            <div>
                              <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                                Family & Contact
                              </h4>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-zinc-500">Father&apos;s Name</span>
                                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{profile.father_name}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-500">Mother&apos;s Name</span>
                                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{profile.mother_name}</p>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-zinc-500">Address</span>
                                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{profile.address}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-500">City</span>
                                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{profile.city}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-500">State</span>
                                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{profile.state}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-500">Pincode</span>
                                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{profile.pincode}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-500">Emergency Contact</span>
                                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{profile.emergency_contact}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="mt-4 text-sm text-zinc-500">
            {profiles.length} student(s) found
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
